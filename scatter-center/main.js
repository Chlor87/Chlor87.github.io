import '../common/global.js'
import Base from '../common/Base.js'
import V from '../common/V.js'
import {BLUE, GREEN, PRI, RED, YELLOW} from '../common/style.js'
import extendContext from '../common/extendContext.js'

const COLORS = [RED, GREEN, BLUE, YELLOW]

const angleSort = center => (l, r) =>
  arcMeasure(center, l) - arcMeasure(center, r)
class App extends Base {
  i = 0
  dir = 1
  points = []

  constructor(canvas) {
    super(canvas)
    this.ctx = extendContext(this.canvas.getContext('2d'))
    this.setupDimensions()
    this.init()
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

  init() {
    const {HW, HH} = this
    this.points = Array.from({length: 100}).map(
      () =>
        new V(
          lerp(random(), -HW * 0.9, HW * 0.9),
          lerp(random(), -HH * 0.9, HH * 0.9)
        )
    )
    this.extrema = this.findExtrema()
    this.center = this.findCenter()
    this.points = this.points.sort(angleSort(this.center))
    this.extrema = this.extrema.sort(angleSort(this.center))
  }

  drawPoints = () => {
    const {ctx, points} = this
    for (let i = 0; i < points.length; i++) {
      ctx.pointV(points[i], PRI, 3)
    }
  }

  findExtrema = () => {
    const {points} = this
    let a = new V(-Infinity, 0),
      b = new V(0, -Infinity),
      c = new V(Infinity, 0),
      d = new V(0, Infinity)
    for (let i = 0; i < points.length; i++) {
      const curr = points[i]
      switch (true) {
        case curr.x > a.x:
          a = curr
          break
        case curr.y > b.y:
          b = curr
          break
        case curr.x < c.x:
          c = curr
          break
        case curr.y < d.y:
          d = curr
          break
      }
    }
    return [a, b, c, d]
  }

  findCenter = () => {
    const [a, b, c, d] = this.findExtrema()
    return new V((a.x + c.x) / 2, (b.y + d.y) / 2)
  }

  drawCenter = () => {
    const {ctx} = this,
      [a, b, c, d] = this.findExtrema(),
      center = new V((a.x + c.x) / 2, (b.y + d.y) / 2)
    void [a, b, c, d].forEach((v, i) => {
      ctx.joinV(center, v, COLORS[i], true)
      ctx.pointV(v, COLORS[i], 3)
    })
    ctx.pointV(center, RED, 5)
  }

  drawOutline = () => {
    const {extrema, center, ctx, points} = this,
      start = extrema.reduce(
        (p, c) => (c.translate(...center.n).mag > p.mag ? c : p),
        new V()
      )
    let curr = start

    do {
      let dir = TAU,
        next
      for (let v of points) {
        const dir2 = normalizeAngle(v.sub(curr).dir - curr.dir)
        if (curr !== v && dir2 < dir) {
          dir = dir2
          next = v
        }
      }
      ctx.joinV(curr, next, RED)
      curr = next
    } while (curr !== start)
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
    this.drawPoints()
    // this.drawCenter()
    this.drawOutline()
    // requestAnimationFrame(this.draw)
  }
}

void (() => {
  addEventListener('DOMContentLoaded', () => {
    const app = new App(document.querySelector('#canvas'))
    requestAnimationFrame(app.draw)
    addEventListener(
      'resize',
      () => {
        app.setupDimensions()
        app.init()
        app.draw()
      },
      {passive: true}
    )
  })
})()
