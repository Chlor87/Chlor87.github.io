import {vec} from '../common/V.js'

export const BASE_LENGTH = 9

export default class Tile {
  state = 0

  transition = false
  step = 0
  dir = -1

  off = [
    vec(0, 0),
    vec(BASE_LENGTH / 9, 1),
    vec((BASE_LENGTH * 8) / 9, 1),
    vec(BASE_LENGTH, 0)
  ]
  on = this.off.map(v => {
    const n = vec(v)
    n.y *= -1
    return n
  })

  constructor({ctx, len, pos = vec(), rot = 0, openColor, closeColor}) {
    Object.assign(this, {ctx, len, pos, rot, openColor, closeColor})
    const {off, on} = this
    for (let i = 0; i < off.length; i++) {
      off[i] = off[i]
        .mul(len)
        .rotate(rot)
        .translate(...pos)
      on[i] = on[i]
        .mul(len)
        .rotate(rot)
        .translate(...pos)
    }
  }

  setState(state) {
    if (state !== this.state) {
      this.state = state
      if (this.transition) {
        this.dir *= -1
      } else {
        this.transition = true
      }
    }
  }

  drawTile = (shape, color) => {
    const {ctx, pos, closeColor} = this
    ctx.save()
    ctx.fillStyle = color
    ctx.strokeStyle = closeColor
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(...pos)
    for (let i = 0; i < shape.length; i++) {
      ctx.lineTo(...shape[i])
    }
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }

  animate() {
    const {on, off, drawTile, dir, openColor, closeColor} = this
    this.step = this.step + 0.2 * dir
    if (this.step > 1 || this.step < 0) {
      this.dir *= -1
      this.transition = false
    }
    let shape = []
    for (let i = 0; i < on.length; i++) {
      shape[i] = on[i].lerp(off[i], this.step)
    }
    drawTile(shape, this.step > 0.5 ? closeColor : openColor)
  }

  draw() {
    const {drawTile, off, state, transition, on, openColor, closeColor} = this
    if (state === 0 && !transition) {
      return
    }
    drawTile(off, this.openColor)
    transition
      ? this.animate()
      : this.drawTile(on, state === 1 ? openColor : closeColor)
  }
}
