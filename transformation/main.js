import Mat from './Mat.js'
import Vec from './Vec.js'
import {TWO_PI} from './utils.js'
import {PRI, SEC} from './style.js'
const {PI, round, cos, sin, floor} = Math

let UC = 200,
  WIDTH, HEIGHT, HALF_HEIGHT, HALF_WIDTH


class App {

  constructor(canvas) {
    this.canvas = canvas
    const ctx = this.ctx = this.canvas.getContext('2d')
    this.setupDimensions()
    this.i = 0
    this.dir = 1
    this.T = window.T = new Mat(
      0, -1,
      1, 0
    ).mul(2)

    this.axes = {
      x1: new Vec(-HALF_WIDTH, 0, ctx, SEC),
      x2: new Vec(HALF_WIDTH, 0, ctx, SEC),
      y1: new Vec(0, -HALF_HEIGHT, ctx, SEC),
      y2: new Vec(0, HALF_HEIGHT, ctx, SEC)
    }
  }

  setupDimensions() {
    const {canvas} = this
    WIDTH = document.documentElement.clientWidth
    HEIGHT = document.documentElement.clientHeight
    HALF_WIDTH = round(WIDTH / 2)
    HALF_HEIGHT = round(HEIGHT / 2)
    canvas.width = canvas.style.width = WIDTH
    canvas.height = canvas.style.height = HEIGHT
    this.ctx.setTransform(1, 0, 0, -1, HALF_WIDTH, HALF_HEIGHT)
    this.xPath = []
  }

  drawAxes() {
    const {axes: {x1, x2, y1, y2}} = this
    x1.to(x2)
    y1.to(y2)
  }

  drawUC = () => {
    const {ctx} = this
    this.ctx.strokeStyle = PRI
    ctx.beginPath()
    ctx.arc(0, 0, UC, 0, TWO_PI)
    ctx.closePath()
    ctx.stroke()
  }

  drawUnitVectors() {
    const {ctx, i, T} = this,
      x1 = new Vec(UC, 0, ctx, '#ff0000'),
      y1 = new Vec(0, UC, ctx, '#00ff00')
    x1.draw()
    y1.draw()
    x1.lerp(T.mul(x1), i).draw()
    y1.lerp(T.mul(y1), i).draw()
  }

  drawGrid() {
    const {ctx, i, T} = this,
      size = floor(UC / 2),
      xOffset = HEIGHT % size,
      yOffset = WIDTH % size
    for (let j = -HEIGHT + xOffset; j < HEIGHT + xOffset; j += size) {
      const main = j / size % 2 === 0,
        color = main ? SEC : PRI,
        x1 = new Vec(-WIDTH, j, ctx, color),
        x2 = new Vec(WIDTH, j, ctx, color)
      ctx.lineWidth = main ? 2 : 1
      x1.to(x2)
      x1.lerp(T.mul(x1), i).to(x2.lerp(T.mul(x2), i))
    }

    for (let j = -WIDTH + yOffset; j < WIDTH; j += size) {
      const main = j / size % 2 === 0,
        color = main ? SEC : PRI,
        y1 = new Vec(j, -WIDTH, ctx, color),
        y2 = new Vec(j, WIDTH, ctx, color)
      ctx.lineWidth = main ? 2 : 1
      y1.to(y2)
      y1.lerp(T.mul(y1), i).to(y2.lerp(T.mul(y2), i))
    }
  }

  draw = () => {
    const {ctx, dir} = this
    ctx.fillStyle = '#000000'
    ctx.lineWidth = 2
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.fillRect(0, 0, WIDTH, HEIGHT)
    ctx.restore()
    this.drawAxes()
    // this.drawUC()
    this.drawGrid()
    this.drawUnitVectors()

    this.i += 0.01 * dir
    if (this.i < 0 || this.i >= 1) {
      this.dir *= -1
    }
    requestAnimationFrame(this.draw)
  }
}

void (() => {
  addEventListener('DOMContentLoaded', () => {
    const app = new App(document.querySelector('#canvas'))
    app.draw()
    addEventListener('resize', () => {
      app.setupDimensions()
    }, {passive: true})
  })
})()
