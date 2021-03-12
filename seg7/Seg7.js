import {HALF_PI} from '../common/utils.js'
import {vec} from '../common/V.js'
import Tile, {BASE_LENGTH} from './Tile.js'

const posMap = [
    vec(0, 2 * BASE_LENGTH),
    vec(BASE_LENGTH, 2 * BASE_LENGTH),
    vec(BASE_LENGTH, BASE_LENGTH),
    vec(0, 0),
    vec(0, BASE_LENGTH),
    vec(0, 2 * BASE_LENGTH),
    vec(0, BASE_LENGTH)
  ],
  rotMap = [0, -HALF_PI, -HALF_PI, 0, -HALF_PI, -HALF_PI, 0],
  digitMap = [
    0b00111111,
    0b00000110,
    0b01011011,
    0b01001111,
    0b01100110,
    0b01101101,
    0b01111101,
    0b00000111,
    0b01111111,
    0b01101111,
    0b10000000
  ],
  mask = 0b00000001

export default class Seg7 {
  tiles = []

  constructor({ctx, pos, len, openColor, closeColor}) {
    for (let i = 0; i < 7; i++) {
      this.tiles.push(
        new Tile({
          ctx,
          pos: posMap[i].mul(len).translate(...pos),
          len,
          rot: rotMap[i],
          openColor,
          closeColor
        })
      )
    }
  }

  setDigit(n) {
    const d = digitMap[n]
    let i = 0
    while (i < 8) {
      this.tiles[i]?.setState(mask & (d >> i))
      i++
    }
  }

  draw() {
    const {tiles} = this
    for (let i = 0; i < tiles.length; i++) {
      tiles[i].draw()
    }
  }
}
