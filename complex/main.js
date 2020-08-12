import '../common/global.js'
import Complex from '../common/Complex.js'
import {SEC, PRI} from '../common/style.js'
import Base from '../common/Base.js'
import {map, joinV} from '../common/utils.js'

class App extends Base {
  mX = 0
  mY = 0
  UC = 100
  constructor(canvas) {
    super(canvas)
    canvas.addEventListener('mousemove', this.setMousePos, {passive: true})
  }

  setMousePos = ({clientX, clientY}) => {
    const {canvas, WIDTH, HEIGHT} = this,
      {left, top} = canvas.getBoundingClientRect()
    this.mX = map(clientX - left, 0, WIDTH, -2, 2)
    this.mY = map(clientY - top, 0, HEIGHT, -2, 2)
  }

  drawAxes() {
    const {
        axes: {x1, x2, y1, y2},
        ctx,
        WIDTH,
        HEIGHT,
        UC
      } = this,
      size = floor(UC),
      offsetX = WIDTH % size,
      offsetY = HEIGHT % size

    joinV(x1, x2, ctx, PRI)
    joinV(y1, y2, ctx, PRI)

    ctx.beginPath()
    for (let i = -WIDTH + offsetX; i < WIDTH + offsetX; i += size) {
      ctx.moveTo(i, -10)
      ctx.lineTo(i, 10)
    }
    for (let i = -HEIGHT + offsetY; i < HEIGHT + offsetY; i += size) {
      ctx.moveTo(-10, i)
      ctx.lineTo(10, i)
    }
    ctx.closePath()
    ctx.stroke()
  }

  drawComplex() {
    const {ctx, mX, mY, HALF_WIDTH, HALF_HEIGHT, UC} = this
    let Z = new Complex(0, 0),
      C = new Complex(mX, mY),
      prev = Object.create(Z)
    ctx.fillStyle = PRI
    ctx.strokeStyle = PRI

    for (let i = 0; i < 100; i++) {
      prev = Object.create(Z)
      Z = Z.pow(2).add(C)
      if (Z.mag > 2) {
        break
      }
      const {re, im} = Z,
        prevX = map(prev.re, -2, 2, -HALF_WIDTH, HALF_WIDTH),
        prevY = map(prev.im, -2, 2, -HALF_HEIGHT, HALF_HEIGHT),
        x = map(re, -2, 2, -HALF_WIDTH, HALF_WIDTH),
        y = map(im, -2, 2, -HALF_HEIGHT, HALF_HEIGHT)
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, TWO_PI)
      ctx.closePath()
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(prevX, prevY)
      ctx.lineTo(x, y)
      ctx.closePath()
      ctx.stroke()
    }
  }

  clear = () => {
    const {ctx, WIDTH, HEIGHT} = this
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.fillRect(0, 0, WIDTH, HEIGHT)
    ctx.restore()
  }

  draw = () => {
    const {ctx, clear} = this
    ctx.fillStyle = '#000000'
    ctx.lineWidth = 2
    clear()
    this.drawAxes()
    this.drawComplex()
    requestAnimationFrame(this.draw)
  }
}

void (() => {
  addEventListener('DOMContentLoaded', () => {
    const app = new App(document.querySelector('#canvas'))
    app.draw()
    addEventListener(
      'resize',
      () => {
        app.setupDimensions()
      },
      {passive: true}
    )
  })
})()
