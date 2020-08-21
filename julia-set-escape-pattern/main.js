import '../common/global.js'
import Cmplx from '../common/Cmplx.js'
import {PRI, SEC} from '../common/style.js'
import Base from '../common/Base.js'
import {map, joinV, pointV} from '../common/utils.js'
import V from '../common/V.js'

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

  setupDimensions() {
    super.setupDimensions()
    const {HALF_WIDTH, HALF_HEIGHT, ctx} = this
    ctx.setTransform(1, 0, 0, -1, HALF_WIDTH, HALF_HEIGHT)
    this.axes = {
      x1: new V(-HALF_WIDTH, 0, 1),
      x2: new V(HALF_WIDTH, 0, 1),
      y1: new V(0, -HALF_HEIGHT, 1),
      y2: new V(0, HALF_HEIGHT, 1)
    }
  }

  drawAxes = () => {
    const {ctx, axes: {x1, x2, y1, y2}} = this
    ctx.save()
    ctx.lineWidth = 1
    joinV(x1, x2, ctx, SEC)
    joinV(y1, y2, ctx, SEC)
    ctx.restore()
  }

  drawComplex() {
    const {ctx, mX, mY, HALF_WIDTH, HALF_HEIGHT} = this
    let Z = new Cmplx(mX, mY),
      C = new Cmplx(mX, mY),
      prev
    ctx.fillStyle = PRI
    ctx.strokeStyle = PRI
    for (let i = 0; i < 100; i++) {
      prev = new Cmplx(Z)
      Z = Z.pow(2).add(C)
      if (Z.r > 2) {
        break
      }
      const [re, im] = Z,
        prevX = map(prev[0], -2, 2, -HALF_WIDTH, HALF_WIDTH),
        prevY = map(prev[1], -2, 2, HALF_HEIGHT, -HALF_HEIGHT),
        x = map(re, -2, 2, -HALF_WIDTH, HALF_WIDTH),
        y = map(im, -2, 2, HALF_HEIGHT, -HALF_HEIGHT),
        v1 = new V(prevX, prevY, 1),
        v2 = new V(x, y, 1)
      pointV(v1, ctx, PRI)
      joinV(v1, v2, ctx, PRI)
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
