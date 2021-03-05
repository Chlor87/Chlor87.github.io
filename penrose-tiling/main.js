import '../common/global.js'
import Base from '../common/Base.js'
import V from '../common/V.js'
import {GREEN, PRI, RED, YELLOW} from '../common/style.js'
import extendContext from '../common/extendContext.js'
import M from '../common/M.js'
import {Big, Small} from './Tiles.js'
import {joinV, magV} from '../common/utils.js'

const matchTiles = ([a, b], [c, d]) => {
  return new M()
    .translate(...c.n)
    .rotate(arcMeasure(a, b) - arcMeasure(c, d))
    .translate(...a)
}

const solve = (p1, p2, p3, p4) => {
  const m1 = (p2.y - p1.y) / (p2.x - p1.x),
    b1 = -(m1 * p1.x - p1.y),
    m2 = (p4.y - p3.y) / (p4.x - p3.x),
    b2 = -(m2 * p3.x - p3.y),
    x = (b2 - b1) / (m1 - m2)

  return new V(x, m1 * x + b1)
}

const scatter = (n, xMin, xMax, yMin, yMax) => {
  const res = []
  for (let i = 0; i < n; i++) {
    res.push(new V(rand(xMin, xMax), rand(yMin, yMax)))
  }
  return res
}

const funcFromPoints = (p1, p2) => {
  const m = (p2.y - p1.y) / (p2.x - p1.x),
    b = -(m * p1.x - p1.y)
  return x => m * x + b
}

const checkRange = (v, p1, p2, p3, p4) =>
  v.x >= min(p1.x, p2.x) &&
  v.x <= max(p1.x, p2.x) &&
  v.x >= min(p3.x, p4.x) &&
  v.x <= max(p3.x, p4.x) &&
  v.y >= min(p1.y, p2.y) &&
  v.y <= max(p1.y, p2.y) &&
  v.y >= min(p3.y, p4.y) &&
  v.y <= max(p3.y, p4.y)

class App extends Base {
  i = 0
  dir = 1
  O = new V(0, 0)

  constructor(canvas) {
    super(canvas)
    this.ctx = extendContext(this.canvas.getContext('2d'))
    this.setupDimensions()
  }

  setupDimensions() {
    super.setupDimensions()
    const {ctx, HW, HH} = this
    ctx.setTransform(1, 0, 0, -1, HW, HH)
    this.UC = min(HW, HH) / 2
  }

  drawAxes = () => {
    const {ctx, HW, HH} = this
    ctx.joinV(new V(-HW, 0), new V(HW, 0), PRI)
    ctx.joinV(new V(0, HH), new V(0, -HH), PRI)
  }

  drawSquare = () => {
    const {ctx, HW} = this,
      big = new Big(ctx, HW / 10)

    big.draw()

    big.forEach((_, i) => {
      switch (i) {
        case 0:
          big.transform(matchTiles([big.a, big.b], [big.a, big.d])).draw()
          break
        case 1:
          big.copy.transform(matchTiles([big.b, big.c], [big.d, big.c])).draw()
          break
        case 2:
          big.copy.transform(matchTiles([big.c, big.d], [big.c, big.b])).draw()
          break
      }
    })
  }

  drawFunc = (p1, p2) => {
    const {HW, HH, W, ctx} = this,
      fn = funcFromPoints(p1, p2)
    let last = null
    for (let x = -HW; x <= HW; x += W / 50) {
      const curr = new V(x, fn(x))
      if (last) {
        ctx.joinV(last, curr)
      }
      last = curr
    }
    ctx.pointV(p1, RED)
    ctx.pointV(p2, GREEN)
  }

  draw = () => {
    const {ctx, HW, HH, W, H} = this
    ctx.fillRect(-HW, HH, W, -H)
    ctx.strokeStyle = PRI
    ctx.lineWidth = 2
    this.i += 0.01 * this.dir
    if (this.i >= TAU || this.i < 0) {
      this.dir *= -1
    }
    this.drawAxes()
    // this.drawSquare()
    const a = new V(rand(-HW, HW), rand(-HH, HH)),
      b = new V(rand(-HW, HW), rand(-HH, HH)),
      c = new V(rand(-HW, HW), rand(-HH, HH)),
      d = new V(rand(-HW, HW), rand(-HH, HH)),
      v = solve(a, b, c, d),
      points = scatter(10, -HW, HW, -HH, HH),
      lines = [],
      start = points[floor(rand(0, points.length - 1))]

    for (let i = 0; i < points.length; i++) {
      const curr = points[i]
      ctx.pointV(curr, curr === start ? RED : PRI)
    }

    walk(start, points.slice(0), lines)

    for (let i = 0; i < lines.length; i++) {
      ctx.joinV(lines[i][0], lines[i][1])
    }

    // requestAnimationFrame(this.draw)
  }
}

const walk = (start, points, lines = []) => {
  if (points.length === 0) {
    return lines
  }

  let closest = new V(Infinity, Infinity)
  for (let i = 0; i < points.length; i++) {
    const curr = points[i]
    // if (
    //   !lines.every(([a, b]) => {
    //     const v = solve(a, b, start, curr)
    //     if (!isNaN(v.x)) {
    //       console.log(checkRange(v, a, b, start, curr))
    //     }
    //     return isNaN(v.x) ? true : !checkRange(v, a, b, start, curr)
    //   })
    // ) {
    //   continue
    // }
    if (magV(start, curr) < magV(start, closest) && curr !== start) {
      closest = curr
    }
  }

  points.splice(points.indexOf(closest), 1)
  lines.push([start, closest])
  return walk(closest, points, lines)
}

void (() => {
  addEventListener('DOMContentLoaded', () => {
    const app = new App(document.querySelector('#canvas'))
    requestAnimationFrame(app.draw)
    addEventListener(
      'resize',
      () => {
        app.setupDimensions()
        app.draw()
      },
      {passive: true}
    )
  })
})()
