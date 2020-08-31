const pixel = require('node-pixel');
const five = require('johnny-five');
const chroma = require('chroma-js');
const tmi = require('tmi.js');

const client = new tmi.Client({
  connection: {
    secure: true,
    reconnect: true,
  },
  channels: ['codinggarden'],
});

client.connect();

const board = new five.Board();

let strip;

/**
 * Returns a pixel index from the given arguments.
 * Returns null if the index is not valid (e.g. < 0 or > 39).
 * @param {string[]} args
 */
const getPixelIndex = (args) => {
  const input = args.join(' ');
  if (input.match(/^r /i)) return Math.floor(Math.random() * 40);
  const fromIndex = input.match(/^index (\d+)/i);
  const fromCoords = input.match(/^x (\d+) y (\d+)/i);
  const fromRowCol = input.match(/^row (\d+) col (\d+)/i);
  if (fromIndex) {
    const index = parseInt(fromIndex[1]);
    if (index < 0 || index > 39) return null;
    return index;
  }
  if (fromCoords) {
    const x = parseInt(fromCoords[1]);
    const y = parseInt(fromCoords[2]);
    if (x < 0 || x > 7) return null;
    if (y < 0 || y > 4) return null;
    return y * 8 + x;
  }
  if (fromRowCol) {
    const row = parseInt(fromCoords[1]);
    const col = parseInt(fromCoords[2]);
    if (col < 0 || col > 7) return null;
    if (row < 0 || row > 4) return null;
    return row * 8 + col;
  }
  return null;
};

/**
 * Returns a color from the given arguments.
 * Returns null if the color is not valid.
 * @param {string[]} args 
 */
const getColor = (args) => {
  const input = args.join(' ');
  if (input.match(/^r /i)) {
    return ['r', 'g', 'b'].map(() => {
      const hex = Math.floor(Math.random() * 256).toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    }).join();
  }
  const matches = input.match(/color ([0-9a-f]{6})$/i);
  if (matches) return matches[1];
  return null;
};

const validColor = (color) => color.match(/^[0-9a-f]{6}$/i);

const lightenColor = (color) => {
  const [h, s] = chroma(`#${color}`).hsl();
  return chroma.hsl(h, s, 0.3).hex();
};

board.on('ready', () => {
  strip = new pixel.Strip({
    board,
    controller: 'FIRMATA',
    strips: [
      {
        pin: 13,
        length: 40,
      },
    ],
    gamma: 2.8,
  });

  strip.on('ready', () => {
    console.log('Strip Ready!');
    Array.from({ length: 40 }, (_, i) => {
      strip.pixel(i).off();
    });
    strip.show();

    client.on('message', (channel, tags, message, self) => {
      if (self) return;
      if (message.startsWith('!')) {
        const args = message.split(' ');
        const command = args.shift();
        if (command === '!pixel') {
          if (!args.length) return;
          const pixelIndex = getPixelIndex(args);
          if (!pixelIndex) return;
          const color = getColor(args);
          if (!color) return;
          const lightenedColor = lightenColor(color);
          strip.pixel(pixelIndex).color(lightenedColor);
          strip.show();
        } else if (command === '!rgb') {
          if (!args.length) return;
          const colorsString = args.shift();
          const colors = colorsString.split(',');
          if (colors.length !== 40) return;
          colors.forEach((color, i) => {
            if (validColor(color)) {
              strip.pixel(i).color(lightenColor(color));
            } else {
              strip.pixel(i).off();
            }
          });
          strip.show();
        }
      }
    });
  });
});
