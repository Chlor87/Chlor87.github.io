import {BLUE, GREEN, PRI, RED} from '../common/style.js'
import {joinV, magV, pointV} from '../common/utils.js'
import {vec} from '../common/V.js'

export class Circle {
  constructor(ctx, pos, r, color = PRI) {
    Object.assign(this, {ctx, pos, r, color})
  }

  draw() {
    const {ctx, pos, r, color} = this
    if (r < 0) {
      return
    }
    pointV(pos, ctx, color, 3)
    circleV(pos, ctx, r, color)
  }

  distTo(v) {
    return magV(this.pos, v) - this.r
  }
}

const inBounds = ([x, y], [x1, y1], [x2, y2]) =>
  x >= min(x1, x2) && x <= max(x1, x2) && y >= min(y1, y2) && y <= max(y1, y2)

export class Line {
  constructor(ctx, a, b, color = PRI) {
    Object.assign(this, {ctx, a, b, color})
  }

  distTo(v) {
    const [x1, y1] = v,
      {
        a,
        b,
        a: [x2, y2],
        b: [x3, y3]
      } = this,
      m = (y3 - y2) / (x3 - x2),
      s = -m * x2 + y2,
      d = 1 + m ** 2
      const x = (x1 - s * m + m * y1) / d,
      P = vec(x, m * x + s),
      res = inBounds(P, a, b) ? magV(v, P) : min(magV(v, a), magV(v, b))
      return res <= 1 ? 0 : res
  }

  draw() {
    const {ctx, a, b, color} = this
    joinV(a, b, ctx, color)
  }
}
