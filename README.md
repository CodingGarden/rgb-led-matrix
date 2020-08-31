# RGB LED Matrix

Control an RGB LED Matrix with Twitch chat!

## Setup

```sh
npm install
```

Flash the node-pixel framework to your Arduino Uno:

```sh
npx nodebots-interchange install git+https://github.com/ajfisher/node-pixel -a uno --firmata
```

## Run

```sh
npm start
```

## TODO:

* RGB command variants:
  * [ ] JSON representation
  * [ ] Sparse representation
  * [ ] Others...
* [ ] Pixel command variants:
  * [ ] !pixel index 0 color 00FF00
  * [ ] !pixel x 3 y 4 color 00FF00
  * [ ] !pixel row 3 col 4 color 00FF00
  * [ ] !pixel r
* [ ] Animation!
