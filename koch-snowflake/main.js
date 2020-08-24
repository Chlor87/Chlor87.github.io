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
  max = 0

  constructor(canvas) {
    super(canvas)
    this.setupDimensions()
    this.T = new M()
    canvas.addEventListener('mousedown', ({offsetX, offsetY}) => {
      this.startX = offsetX
      this.startY = offsetY
      this.isDragging = true
    })

    canvas.addEventListener('mouseup', () => {
      this.isDragging = false
    })

    canvas.addEventListener('mousemove', this.handleMouseMove, {passive: true})

    canvas.addEventListener(
      'wheel',
      ({offsetX, offsetY, deltaY}) => {
        const {HALF_WIDTH, HALF_HEIGHT} = this,
          s = deltaY < 0 ? 1.1 : 0.9,
          dx = (offsetX - HALF_WIDTH) * s,
          dy = -(offsetY - HALF_HEIGHT) * s
        this.scale *= s
        if (this.scale < 0.1 || this.scale > 1000) {
          this.scale /= s
          return
        }
        this.T = this.T.translate(-dx, -dy).scale(s, s).translate(dx, dy)
        requestAnimationFrame(this.draw)
      },
      {passive: true}
    )
  }

  setupDimensions() {
    super.setupDimensions()
    const {ctx, HALF_WIDTH, HALF_HEIGHT} = this
    ctx.setTransform(1, 0, 0, -1, HALF_WIDTH, HALF_HEIGHT)
    this.max = hypot(HALF_WIDTH, HALF_HEIGHT)
  }

  handleMouseMove = ({offsetX, offsetY}) => {
    if (!this.isDragging) {
      return
    }
    const {startX, startY} = this,
      dx = offsetX - startX,
      dy = -(offsetY - startY)
    this.startX = offsetX
    this.startY = offsetY
    this.T = this.T.translate(dx, dy)
    requestAnimationFrame(this.draw)
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
    if (this.test(start, end)) {
      return
    }
    const {ctx, T} = this,
      theta = arcMeasure(start, end),
      mag = magV(start, end) / 3,
      a = start,
      b = start.lerp(end, 1 / 3),
      c = new M()
        .rotate(theta + PI / 3)
        .translate(b[0], b[1])
        .mul(new V(mag, 0, 1)),
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

  test = (a, b) => {
    const {ctx, HALF_WIDTH, HALF_HEIGHT} = this,
      [x1, x2] = a[0] > b[0] ? [b[0], a[0]] : [a[0], b[0]],
      [y1, y2] = a[1] > b[1] ? [b[1], a[1]] : [a[1], b[1]],
      hw = HALF_WIDTH * 2,
      hh = HALF_HEIGHT * 2
    return !(x1 < hw && x2 > -hw && y1 < hh && y2 > -hh)
  }

  draw = ts => {
    const {ctx, HALF_WIDTH, HALF_HEIGHT, WIDTH, HEIGHT, scale, T} = this
    ctx.fillRect(-HALF_WIDTH, -HALF_HEIGHT, WIDTH, HEIGHT)
    const v = new V(max(HALF_WIDTH, HALF_HEIGHT) / 3, 0, 1),
      a = T.mul(new M().rotate(PI / 2).mul(v)),
      b = T.mul(new M().rotate(PI / 2 + (PI * 2) / 3).mul(v)),
      c = T.mul(new M().rotate(PI / 2 + (PI * 4) / 3).mul(v)),
      s = floor(log2(scale))

    this.kochCurve(b, a, s)
    this.kochCurve(c, b, s)
    this.kochCurve(a, c, s)
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
