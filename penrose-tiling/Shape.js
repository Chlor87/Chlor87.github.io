import M from '../common/M.js'
import {SEC} from '../common/style.js'

export default class Shape extends Array {
  constructor(ctx, vertices, color = SEC) {
    super(...vertices)
    this.ctx = ctx
    this.color = color
    for (let i = 0; i < vertices.length; i++) {
      Object.defineProperty(this, String.fromCharCode(97 + i), {
        get() {
          return this[i]
        }
      })
    }
  }

  get copy() {
    return new Shape(this.ctx, this)
  }

  stroke(color = this.color) {
    const {ctx, length} = this
    ctx.strokeStyle = color
    for (let [i, v] of this.entries()) {
      ctx.joinV(v, this[i < length - 1 ? i + 1 : 0])
    }
    return this
  }

  fill(color = this.color) {
    const {ctx, length} = this
    ctx.save()
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(...this[0])
    for (let [i, v] of this.entries()) {
      ctx.lineTo(...this[i < length - 1 ? i + 1 : 0])
    }
    ctx.closePath()
    ctx.fill()
    ctx.restore()
    return this
  }

  translate(x, y) {
    return this.transform(new M(1, 0, x, 0, 1, y))
  }

  rotate(theta) {
    return this.transform(new M().rotate(theta))
  }

  scale(x, y) {
    return this.transform(new M(x, 0, 0, 0, y, 0))
  }

  transform(matrix) {
    for (let [i, v] of this.entries()) {
      this[i] = matrix.mul(v)
    }
    return this
  }

  rotateAbout(pivot, theta) {
    return this.transform(
      new M()
        .translate(...pivot.mul(-1))
        .rotate(theta)
        .translate(...pivot)
    )
  }
}
