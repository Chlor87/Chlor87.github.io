import V from './V.js'
export default class Base {
  UC = 100
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
    const {canvas} = this
    this.WIDTH = document.documentElement.clientWidth
    this.HEIGHT = document.documentElement.clientHeight
    this.HALF_WIDTH = round(this.WIDTH / 2)
    this.HALF_HEIGHT = round(this.HEIGHT / 2)
    this.UC = (1 / 2) * this.HALF_HEIGHT
    const {WIDTH, HEIGHT} = this
    canvas.width = canvas.style.width = WIDTH
    canvas.height = canvas.style.height = HEIGHT
  }
}
