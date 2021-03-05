import V from './V.js'
export default class Base {
  UC = 100
  W = 0
  H = 0
  HW = 0
  HH = 0

  constructor(canvas) {
    this.canvas = canvas
    this.ctx = this.canvas.getContext('2d')
    this.setupDimensions()
  }

  setupDimensions() {
    const {canvas} = this
    this.W = document.documentElement.clientWidth
    this.H = document.documentElement.clientHeight
    this.HW = round(this.W / 2)
    this.HH = round(this.H / 2)
    this.UC = (1 / 2) * this.HH
    const {W, H} = this
    canvas.width = canvas.style.width = W
    canvas.height = canvas.style.height = H
  }
}
