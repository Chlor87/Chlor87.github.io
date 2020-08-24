import '../common/global.js'
import {SEC, PRI} from '../common/style.js'
import Base from '../common/Base.js'
import V from '../common/V.js'
import M from '../common/M.js'
import {joinV, pointV, drawV} from '../common/utils.js'

class App extends Base {
  UC = 100
  startX = 0
  startY = 0
  isDragging = false
  run = true
  scale = 1
  dir = 1

  numPoints = 256
  maxPoints = 512
  step = 0
  maxStep = 100

  constructor(canvas) {
    super(canvas)
    this.setupDimensions()
    canvas.addEventListener('mousedown', this.handleMouseDown)
    canvas.addEventListener('mouseup', this.handleMouseUp)
    canvas.addEventListener('mouseleave', this.handleMouseUp)
    canvas.addEventListener('mousemove', this.handleMouseMove)
    window.addEventListener('keydown', this.handleKeyPress)
  }

  setupDimensions() {
    super.setupDimensions()
    const {ctx, HALF_WIDTH, HALF_HEIGHT, UC, numPoints} = this
    ctx.setTransform(1, 0, 0, -1, HALF_WIDTH, HALF_HEIGHT)
    this.UC = min(HALF_WIDTH, HALF_HEIGHT) * 0.75
  }

  handleMouseDown = ({offsetX, offsetY}) => {
    this.isDragging = true
    this.startX = offsetX
    this.startY = offsetY
    !this.run && requestAnimationFrame(this.draw)
  }

  handleMouseUp = () => {
    this.isDragging = false
    !this.run && requestAnimationFrame(this.draw)
  }

  handleMouseMove = ({offsetX, offsetY}) => {
    if (!this.isDragging) {
      return
    }
    const {startX, startY} = this,
      dx = offsetX - startX
    this.startX = offsetX
    this.step += dx / 100
    !this.run && requestAnimationFrame(this.draw)
  }

  handleKeyPress = ({key, shiftKey, ctrlKey}) => {
    switch (key) {
      case ' ':
        this.run = !this.run
        break
      case 'ArrowLeft':
        this.step -= ctrlKey ? 0.001 : shiftKey ? 0.1 : 0.01
        break
      case 'ArrowRight':
        this.step += ctrlKey ? 0.001 : shiftKey ? 0.1 : 0.01
        break
      default:
        return
    }
    requestAnimationFrame(this.draw)
  }

  drawUC = () => {
    const {ctx, UC} = this
    pointV(new V(0, 0), ctx, PRI)
    ctx.save()
    ctx.strokeStyle = PRI
    ctx.beginPath()
    ctx.arc(0, 0, UC, 0, TWO_PI)
    ctx.stroke()
    ctx.restore()
  }

  drawPoints = () => {
    const {ctx, UC, step, numPoints} = this
    for (let i = 0; i < numPoints; i++) {
      const srcTheta = (TWO_PI / numPoints) * i,
        dstTheta = (((i * step) % numPoints) / numPoints) * TWO_PI,
        src = new V(UC * cos(srcTheta), UC * sin(srcTheta), 1),
        dst = new V(UC * cos(dstTheta), UC * sin(dstTheta), 1)
      pointV(src, ctx, PRI, 2)
      joinV(src, dst, ctx, PRI)
    }
  }

  draw = ts => {
    const {ctx, HALF_WIDTH, HALF_HEIGHT, WIDTH, HEIGHT, run} = this
    ctx.fillRect(-HALF_WIDTH, -HALF_HEIGHT, WIDTH, HEIGHT)
    this.step = clamp(this.step, 0, this.maxStep)
    this.drawPoints()
    if (run) {
      this.step += 0.01 * this.dir
      if (this.step > this.maxStep || this.step <= 0) {
        this.dir *= -1
      }
      requestAnimationFrame(this.draw)
    }
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
