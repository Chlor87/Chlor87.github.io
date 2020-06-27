import Mat from './Mat.js'
import Vec from './Vec.js'
import {TWO_PI, HALF_PI} from './utils.js'
import {PRI, SEC} from './style.js'

const {PI, round, cos, sin, floor} = Math

let UC = 200,
  WIDTH, HEIGHT, HALF_HEIGHT, HALF_WIDTH


class App {

  constructor(canvas) {
    this.canvas = canvas
    this.ctx = this.canvas.getContext('2d')
    this.setupDimensions()
    this.i = 0
    this.dir = 1
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

  run = () => {
    this.draw()
  }

  getTransform(i) {
    const xTheta = i * HALF_PI
    return new Mat(
      cos(xTheta), -sin(xTheta),
      sin(xTheta), cos(xTheta)
    ).mul(2 ** i)
  }

  drawAxes() {
    const {ctx} = this,
      x1 = new Vec(-HALF_WIDTH, 0, ctx, SEC),
      x2 = new Vec(HALF_WIDTH, 0, ctx, SEC),
      y1 = new Vec(0, -HALF_HEIGHT, ctx, SEC),
      y2 = new Vec(0, HALF_HEIGHT, ctx, SEC)
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
    const {ctx, i} = this,
      T = this.getTransform(i),
      x = new Vec(UC / 4, 0, ctx, '#ff0000'),
      y = new Vec(0, UC / 4, ctx, '#00ff00')
    ctx.lineWidth = 3
    x.draw()
    y.draw()
    T.mul(x).draw()
    T.mul(y).draw()
  }

  drawGrid() {
    const {ctx, i} = this,
      size = floor(UC / 4),
      T = this.getTransform(i),
      xOffset = HALF_HEIGHT % size,
      yOffset = HALF_WIDTH % size

    for (let i = -HALF_HEIGHT + xOffset; i < HALF_HEIGHT; i += size) {
      const main = i % 8 === 0,
        color = main ? SEC : PRI,
        x1 = new Vec(-WIDTH, i, ctx, color),
        x2 = new Vec(WIDTH, i, ctx, color),
        x3 = T.mul(x1),
        x4 = T.mul(x2)
      ctx.lineWidth = main ? 2 : 1
      x1.to(x2)
      x3.to(x4)
    }

    for (let i = -HALF_WIDTH + yOffset; i < HALF_WIDTH; i += size) {
      const main = i % 8 === 0,
        color = main ? SEC : PRI,
        y1 = new Vec(i, -HEIGHT, ctx, color),
        y2 = new Vec(i, HEIGHT, ctx, color),
        y3 = T.mul(y1),
        y4 = T.mul(y2)
      ctx.lineWidth = main ? 2 : 1
      y1.to(y2)
      y3.to(y4)
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
    app.run()
    addEventListener('resize', () => {
      app.setupDimensions()
    }, {passive: true})
  })
})()
