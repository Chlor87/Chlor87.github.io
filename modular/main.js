/**
 * inspired by Mathologer
 */

import '../common/global.js'
import {PRI} from '../common/style.js'
import Base from '../common/Base.js'
import V from '../common/V.js'
import {joinV, pointV} from '../common/utils.js'

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
    this.setupControls()
  }

  setupDimensions() {
    super.setupDimensions()
    const {ctx, HW, HH, UC, numPoints} = this
    ctx.setTransform(1, 0, 0, -1, HW, HH)
    this.UC = min(HW, HH) * 0.75
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
        requestAnimationFrame(this.draw)
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
    !this.run && requestAnimationFrame(this.draw)
  }

  setupControls = () => {
    const {maxStep, step, maxPoints} = this,
      $step = (this.$step = document.querySelector('#step')),
      $stepValue = (this.$stepValue = document.querySelector('#step-value')),
      $numPoints = this.$numPoints = document.querySelector('#num-points')
    $step.min = 0
    $step.max = maxStep
    $step.step = 0.001
    $step.value = step
    $stepValue.textContent = step.toFixed(3)

    $numPoints.min = 1
    $numPoints.max = maxPoints
    $numPoints.step = 1
    $numPoints.value = $numPoints.dataset.value = this.numPoints

    $step.addEventListener('input', ({target: {value}}) => {
      this.step = Number(value)
      !this.run && requestAnimationFrame(this.draw)
    })

    $numPoints.addEventListener('input', ({target: {value}}) => {
      this.numPoints = Number(value)
      $numPoints.dataset.value = value
      !this.run && requestAnimationFrame(this.draw)
    })
  }

  drawUC = () => {
    const {ctx, UC} = this
    pointV(new V(0, 0), ctx, PRI)
    ctx.save()
    ctx.strokeStyle = PRI
    ctx.beginPath()
    ctx.arc(0, 0, UC, 0, TAU)
    ctx.stroke()
    ctx.restore()
  }

  drawPoints = () => {
    const {ctx, UC, step, numPoints} = this
    for (let i = 0; i < numPoints; i++) {
      const srcTheta = (TAU / numPoints) * i,
        dstTheta = (((i * step) % numPoints) / numPoints) * TAU,
        src = new V(UC * cos(srcTheta), UC * sin(srcTheta)),
        dst = new V(UC * cos(dstTheta), UC * sin(dstTheta))
      pointV(src, ctx, PRI, 2)
      joinV(src, dst, ctx, PRI)
    }

    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.fillStyle = PRI
    ctx.textAlign = 'center'
    ctx.font = '24px sans'
    ctx.restore()
  }

  draw = ts => {
    const {ctx, HW, HH, W, H, run} = this
    ctx.fillRect(-HW, -HH, W, H)
    this.step = clamp(this.step, 0, this.maxStep)
    this.drawPoints()
    if (run) {
      this.step += 0.01 * this.dir
      if (this.step >= this.maxStep || this.step <= 0) {
        this.dir *= -1
      }
      requestAnimationFrame(this.draw)
    }
    this.$step.value = this.step
    this.$stepValue.textContent = this.step.toFixed(3)
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
