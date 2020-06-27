import {PRI, SEC} from "./style.js"
import {TWO_PI} from "./utils.js"

const {PI, atan2} = Math

export default class Vec {
  /**
   * @description 2x1 only
   */
  constructor(x, y, ctx, color = SEC) {
    this.x = x
    this.y = y
    this.ctx = ctx
    this.color = color
  }

  add(vecOrScalar) {
    const cp = Object.create(this)
    switch (typeof vecOrScalar) {
      case 'number':
        cp.x += vecOrScalar
        cp.y += vecOrScalar
        break
      default:
        cp.x += vecOrScalar.x
        cp.y += vecOrScalar.y
    }
    return cp
  }

  mul(scalar) {
    const cp = Object.create(this)
    cp.x *= scalar
    cp.y *= scalar
    return cp
  }

  draw() {
    const {ctx, x, y, color} = this
    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(x, y)
    ctx.closePath()
    ctx.stroke()
    this.arrow(x, y)
  }

  arrow(x, y) {
    const {ctx, color} = this
    ctx.save()
    ctx.fillStyle = color
    ctx.translate(x, y)
    ctx.rotate(atan2(y, x))
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(-15, -10)
    ctx.lineTo(-15, 10)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  to({x, y}) {
    const {ctx} = this
    ctx.strokeStyle = this.color
    ctx.beginPath()
    ctx.moveTo(this.x, this.y)
    ctx.lineTo(x, y)
    ctx.closePath()
    ctx.stroke()
  }

  point() {
    const {ctx, x, y} = this
    ctx.beginPath()
    ctx.fillStyle = this.color
    ctx.arc(x, y, 2, 0, TWO_PI)
    ctx.closePath()
    ctx.fill()
  }
}