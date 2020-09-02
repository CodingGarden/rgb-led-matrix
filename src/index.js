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

const validColor = (color) => color.match(/^[0-9a-f]{6}$/i);

function embiggen(command) {
  command = command.split(/[ ,]/g)
  command.shift()
  let indices = [];
  return command.map(color=>{
    if (color.startsWith("*")) return indices[parseInt(color.slice(1), 16)]
    indices.push(color);
    return color;
  })
}

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
        // TODO: !pixel index 0 color 00FF00
        // TODO: !pixel x 3 y 4 color 00FF00
        // TODO: !pixel row 3 col 4 color 00FF00
        // TODO: !pixel r
        if (command === '!pixel') {
          if (!args.length) return;
          const pixelIndex = parseInt(args.shift(), 10);
          if (isNaN(pixelIndex)) return;
          if (pixelIndex < 0 || pixelIndex > 39) return;
          const color = args.shift();
          if (!color || !validColor(color)) return;
          const lightenedColor = lightenColor(color);
          strip.pixel(pixelIndex).color(lightenedColor);
          strip.show();
        } else if (command === '!rgb') {
          if (!args.length) return;
          const colorsString = args.shift();
          const colors = embiggen(colorsString);
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
