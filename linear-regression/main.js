import '../common/global.js'
import {GREEN, PRI, RED, SEC} from '../common/style.js'
import Base from '../common/Base.js'
import M from '../common/M.js'
import V from '../common/V.js'
import {joinV, map, pointV, rand} from '../common/utils.js'
import extendContext from '../common/extendContext.js'
import {
  correlationCoefficient,
  linReg,
  rSquared,
  varUnbiased
} from '../common/statistics.js'

const scatter = (n, xMin, xMax, yMin, yMax) => {
  const res = []
  for (let i = 0; i < n; i++) {
    res.push(new V(rand(xMin, xMax), rand(yMin, yMax)))
  }
  return res
}

const linearScatter = (n, xMin, xMax, yMin, yMax, threshold) => {
  const res = [],
    m = rand(-1.5, 1.5),
    b = rand(yMin, yMax),
    fn = x => m * x + b

  for (let i = 0; i < n; i++) {
    const x = rand(xMin, xMax),
      y = fn(x) + rand(yMin * threshold, yMax * threshold)
    res.push(new V(x, y))
  }
  return res
}

class App extends Base {
  startX = 0
  startY = 0
  isDragging = false
  points = []

  constructor(canvas) {
    super(canvas)
    this.ctx = extendContext(this.canvas.getContext('2d'))
    this.T = new M()
    this.setupDimensions()

    canvas.addEventListener('click', ({offsetX, offsetY}) => {
      const {W, H, HW, HH} = this
      this.points.push(
        new V(map(offsetX, 0, W, -HW, HW), map(offsetY, 0, H, HH, -HH))
      )
      requestAnimationFrame(app.draw)
    })
  }

  setupDimensions() {
    super.setupDimensions()
    const {ctx, HW, HH} = this
    ctx.setTransform(1, 0, 0, -1, HW, HH)
    // this.points = linearScatter(100, -HW, HW, -HH, HH, 0.25)
  }

  drawAxes = () => {
    const {ctx, HW, HH} = this
    ctx.joinV(new V(-HW, 0), new V(HW, 0), PRI)
    ctx.joinV(new V(0, HH), new V(0, -HH), PRI)
  }

  scatter() {
    const {ctx, points, HW, HH} = this
    points.forEach(v => ctx.pointV(v, PRI, 3))
  }

  linearRegression() {
    const {points, ctx, HH, HW} = this,
      data = {},
      [fn, m, b] = linReg(points, data),
      start = fn(-HW),
      end = fn(HW)

    if (points.length < 2) {
      return
    }
    ctx.joinV(new V(-HW, start), new V(HW, end), GREEN)
    ctx.pointV(new V(data.xMean, data.yMean), RED)

    for (let i = 0; i < points.length; i++) {
      const actual = points[i],
        expected = fn(actual.x)
      ctx.pointV(new V(actual.x, actual.y - expected), RED, 3)
      ctx.joinV(new V(actual.x, 0), new V(actual.x, actual.y - expected), RED)
    }

    ctx.save()
    ctx.scale(1, -1)
    ctx.fillStyle = SEC
    ctx.font = '16pt monospace'
    const lines = [
      `x̄ = ${data.xMean.toFixed(2)}`,
      `ȳ = ${data.yMean.toFixed(2)}`,
      '',
      `σx = ${data.xStdev.toFixed(2)}`,
      `σy = ${data.yStdev.toFixed(2)}`,
      '',
      `r = ${(data.r * 100).toFixed(2)}%`,
      `r² = ${(data.r ** 2 * 100).toFixed(2)}%`,
      `ŷ = ${m.toFixed(2)}x + ${b.toFixed(2)}`,
    ]
    lines.forEach((l, i) => {
      ctx.fillText(l, -HW * 0.9, -HH * 0.9 + 24 * i)
    })
    ctx.restore()
  }

  draw = () => {
    const {ctx, HW, HH, W, H} = this
    ctx.fillStyle = '#000'
    ctx.fillRect(-HW, HH, W, -H)
    this.drawAxes()
    this.linearRegression()
    this.scatter()
  }
}

void (() => {
  addEventListener('DOMContentLoaded', () => {
    const app = (window.app = new App(document.querySelector('#canvas')))
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
