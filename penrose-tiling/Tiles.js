import {BLACK, BLUE, GREEN, RED, SEC} from '../common/style.js'
import V from '../common/V.js'
import Shape from './Shape.js'

const PENTA = TAU / 5

class PenroseTile extends Shape {
  constructor(ctx, sideLength) {
    super(ctx, sideLength)
    const {length} = this
    this.forEach((v, i) => {
      Object.defineProperty(this, String.fromCharCode(65 + i), {
        get() {
          return [v, this[i < length - 1 ? i + 1 : 0]]
        }
      })
    })
  }

  get copy() {
    const {ctx, sideLength, a, b, c, d} = this,
      cp = new this.constructor(ctx, sideLength)
    this.forEach((v, i) => (cp[i] = v))
    return cp
  }

  draw() {
    const {ctx} = this
    ctx.save()
    ctx.lineWidth = 1
    super.fill(SEC)
    this.colorize()
    super.stroke(BLACK)
    ctx.restore()
    return this
  }

}

export class Big extends PenroseTile {
  constructor(ctx, sideLength) {
    const a = new V(0, 0),
      b = new V(sideLength, 0),
      c = b.rotate(PENTA).add(b),
      d = c.sub(b)
    super(ctx, [a, b, c, d])
    Object.assign(this, {ctx, sideLength})
  }

  colorize() {
    const {ctx, a, b, c, d, sideLength} = this
    ctx.fillStyle = BLUE
    ctx.beginPath()
    ctx.moveTo(...a)
    ctx.arc(...a, sideLength / 4, arcMeasure(a, b), arcMeasure(b, c))
    ctx.moveTo(...a)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = RED
    ctx.beginPath()
    ctx.arc(...a, sideLength / 4, arcMeasure(a, b), arcMeasure(a, d))
    ctx.lineTo(...d)
    ctx.lineTo(...d.lerp(c, 0.25))
    ctx.arc(...c, (sideLength * 3) / 4, arcMeasure(c, d), arcMeasure(c, b))
    ctx.lineTo(...b)
    ctx.lineTo(...a)
    ctx.fill()
  }
}

export class Small extends PenroseTile {
  constructor(ctx, sideLength) {
    const a = new V(0, 0),
      b = new V(sideLength, 0),
      c = new V(sideLength, 0).rotate(PENTA / 2).add(b),
      d = c.sub(b)
    super(ctx, [a, b, c, d])
    Object.assign(this, {ctx, sideLength})
  }

  colorize() {
    const {ctx, a, b, c, d, sideLength} = this
    ctx.fillStyle = RED
    ctx.beginPath()
    ctx.moveTo(...b)
    ctx.arc(...b, sideLength / 4, arcMeasure(b, c), arcMeasure(b, a))
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = BLUE
    ctx.beginPath()
    ctx.moveTo(...d)
    ctx.arc(...d, sideLength / 4, arcMeasure(d, a), arcMeasure(d, c))
    ctx.fill()
  }
}
