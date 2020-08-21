import '../common/global.js'
import {PRI, SEC, RED, GREEN} from '../common/style.js'
import Base from '../common/Base.js'
import V from '../common/V.js'
import M from '../common/M.js'
import {joinV, pointV, arcMeasure, drawV} from '../common/utils.js'
import Cmplx from '../common/Cmplx.js'

class App extends Base {
  UC = 50
  startX = 0
  startY = 0
  isDragging = false
  scale = 1
  i = 0
  dir = 1

  constructor(canvas) {
    super(canvas)
    this.setupDimensions()
    this.T = new M()
  }

  setupDimensions() {
    super.setupDimensions()
    const {ctx, HALF_WIDTH, HALF_HEIGHT} = this
    ctx.setTransform(1, 0, 0, -1, HALF_WIDTH, HALF_HEIGHT)
  }

  drawAxes = () => {
    const {ctx, HALF_WIDTH, HALF_HEIGHT} = this,
      x1 = new V(-HALF_WIDTH, 0, 1),
      x2 = new V(HALF_WIDTH, 0, 1),
      y1 = new V(0, -HALF_HEIGHT, 1),
      y2 = new V(0, HALF_HEIGHT, 1)
    joinV(x1, x2, ctx, SEC)
    joinV(y1, y2, ctx, SEC)
  }

  kochCurve = (start, end, max = 4, depth = 0) => {
    const {ctx} = this,
      theta = arcMeasure(start, end),
      mag = magV(start, end) / 3,
      a = start,
      b = start.lerp(end, 1 / 3),
      c = new M()
        .translate(mag, 0)
        .rotate(theta + PI / 3)
        .translate(b[0], b[1])
        .mul(new V(1, 0, 1)),
      d = start.lerp(end, 2 / 3),
      e = end

    if (depth >= max) {
      joinV(a, b, ctx, PRI)
      joinV(b, c, ctx, PRI)
      joinV(c, d, ctx, PRI)
      joinV(d, e, ctx, PRI)
      return
    }

    this.kochCurve(a, b, max, depth + 1)
    this.kochCurve(b, c, max, depth + 1)
    this.kochCurve(c, d, max, depth + 1)
    this.kochCurve(d, e, max, depth + 1)
  }

  draw = ts => {
    const {ctx, HALF_WIDTH, HALF_HEIGHT, WIDTH, HEIGHT, dir} = this
    ctx.fillRect(-HALF_WIDTH, -HALF_HEIGHT, WIDTH, HEIGHT)
    const v = new V(max(HALF_WIDTH, HALF_HEIGHT) / 3, 0, 1),
      a = new M().rotate(PI / 2).mul(v),
      b = new M().rotate(PI / 2 + (PI * 2) / 3).mul(v),
      c = new M().rotate(PI / 2 + (PI * 4) / 3).mul(v)

    this.i += 0.05 * this.dir
    if (this.i >= 5.49 || this.i < 0) {
      this.dir *= -1
    }
    this.kochCurve(b, a, floor(this.i))
    this.kochCurve(c, b, floor(this.i))
    this.kochCurve(a, c, floor(this.i))
    requestAnimationFrame(this.draw)
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
        app.draw()
      },
      {passive: true}
    )
  })
})()
