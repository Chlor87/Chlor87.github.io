import Vec from './Vec.js'
import {SEC} from './style.js'
const {round} = Math

export default class Base {

  UC = 200
  WIDTH = 0
  HEIGHT = 0
  HALF_WIDTH = 0
  HALF_HEIGHT = 0

  constructor(canvas) {
    this.canvas = canvas
    this.ctx = this.canvas.getContext('2d')
    this.setupDimensions()
  }

  setupDimensions() {
    const {canvas, ctx} = this
    this.WIDTH = document.documentElement.clientWidth
    this.HEIGHT = document.documentElement.clientHeight
    this.HALF_WIDTH = round(this.WIDTH / 2)
    this.HALF_HEIGHT = round(this.HEIGHT / 2)

    const {WIDTH, HEIGHT, HALF_WIDTH, HALF_HEIGHT, UC} = this
    canvas.width = canvas.style.width = WIDTH
    canvas.height = canvas.style.height = HEIGHT

    this.ctx.setTransform(1, 0, 0, -1, HALF_WIDTH, HALF_HEIGHT)
    this.axes = {
      x1: new Vec(-HALF_WIDTH, 0, 0, ctx, SEC),
      x2: new Vec(HALF_WIDTH, 0, 0, ctx, SEC),
      y1: new Vec(0, -HALF_HEIGHT, 0, ctx, SEC),
      y2: new Vec(0, HALF_HEIGHT, 0, ctx, SEC)
    }
  }
}