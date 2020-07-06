import {SEC} from "./style.js"
import {TWO_PI} from "./utils.js"

const {atan2} = Math

export default class Vec {
  /**
   * @description 2x1 only
   */
  constructor(x, y, z = 1, ctx, color = SEC) {
    this.x = x
    this.y = y
    this.z = z
    this.ctx = ctx
    this.color = color
  }

  add(other) {
    const cp = Object.create(this)
    switch (typeof other) {
      case 'number':
        cp.x += other
        cp.y += other
        break
      default:
        cp.x += other.x
        cp.y += other.y
    }
    return cp
  }

  mul(scalar) {
    const cp = Object.create(this)
    cp.x *= scalar
    cp.y *= scalar
    return cp
  }

  lerp(other, progress) {
    return this.mul(1 - progress).add(other.mul(progress))
  }

  draw() {
    const {ctx, x, y, color} = this
    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(x, y)
    ctx.closePath()
    ctx.stroke()
    this.arrow(0, 0, x, y)
  }

  arrow(x1, y1, x2, y2) {
    const {ctx, color} = this
    ctx.save()
    ctx.fillStyle = color
    ctx.translate(x2, y2)
    ctx.rotate(atan2(y2 - y1, x2 - x1))
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(-15, -10)
    ctx.lineTo(-15, 10)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  to({x, y}, arrow) {
    const {ctx} = this
    ctx.strokeStyle = this.color
    ctx.beginPath()
    ctx.moveTo(this.x, this.y)
    ctx.lineTo(x, y)
    ctx.closePath()
    ctx.stroke()
    arrow && this.arrow(this.x, this.y, x, y)
  }

  point() {
    const {ctx, x, y} = this
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(x, y, 10, 0, TWO_PI)
    ctx.closePath()
    ctx.fill()
  }

}