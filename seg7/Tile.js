import {vec} from '../common/V.js'

export const BASE_LENGTH = 10

const ease = x => sin((PI * x) / 2) ** 2

export default class Tile {
  state = 0
  step = 60
  dir = -1
  duration = 2
  transition = false

  off = [vec(0, 0), vec(1, 1), vec(BASE_LENGTH - 1, 1), vec(BASE_LENGTH, 0)]
  on = this.off.map(v => {
    const n = vec(v)
    n.y *= -1
    return n
  })

  constructor({
    ctx,
    len,
    pos = vec(),
    rot = 0,
    openColor,
    closeColor,
    duration = 2
  }) {
    Object.assign(this, {
      ctx,
      len,
      pos,
      rot,
      openColor,
      closeColor,
      duration
    })
    this.step *= duration
    this.max = this.step
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
    const {on, off, drawTile, dir, openColor, closeColor, step, max} = this,
      shape = []

    this.step = step + 1 * dir
    if (this.step > max || this.step < 0) {
      this.dir *= -1
      this.transition = false
    }

    const mapped = map(this.step, 0, max, 0, 1)
    for (let i = 0; i < on.length; i++) {
      shape[i] = on[i].lerp(off[i], ease(mapped))
    }
    drawTile(shape, mapped > 0.5 ? closeColor : openColor)
  }

  draw() {
    const {off, state, transition, on, openColor, closeColor} = this
    if (state === 0 && !transition) {
      return
    }
    this.drawTile(off, this.openColor)
    transition
      ? this.animate()
      : this.drawTile(on, state === 1 ? openColor : closeColor)
  }
}
