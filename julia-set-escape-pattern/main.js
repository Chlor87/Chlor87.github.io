import '../common/global.js'
import C from '../common/C.js'
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
    const {canvas, W, H} = this,
      {left, top} = canvas.getBoundingClientRect()
    this.mX = map(clientX - left, 0, W, -2, 2)
    this.mY = map(clientY - top, 0, H, -2, 2)
  }

  setupDimensions() {
    super.setupDimensions()
    const {HW, HH, ctx} = this
    ctx.setTransform(1, 0, 0, -1, HW, HH)
    this.axes = {
      x1: new V(-HW, 0),
      x2: new V(HW, 0),
      y1: new V(0, -HH),
      y2: new V(0, HH)
    }
  }

  drawAxes = () => {
    const {ctx, axes: {x1, x2, y1, y2}} = this
    ctx.save()
    ctx.lineW = 1
    joinV(x1, x2, ctx, SEC)
    joinV(y1, y2, ctx, SEC)
    ctx.restore()
  }

  drawComplex() {
    const {ctx, mX, mY, HW, HH} = this
    let z = new C(mX, mY),
      c = new C(mX, mY),
      prev
    ctx.fillStyle = PRI
    ctx.strokeStyle = PRI
    for (let i = 0; i < 100; i++) {
      prev = new C(z)
      z = z.pow(2).add(c)
      if (z.r > 2) {
        break
      }
      const [re, im] = z,
        prevX = map(prev[0], -2, 2, -HW, HW),
        prevY = map(prev[1], -2, 2, HH, -HH),
        x = map(re, -2, 2, -HW, HW),
        y = map(im, -2, 2, HH, -HH),
        v1 = new V(prevX, prevY),
        v2 = new V(x, y)
      pointV(v1, ctx, PRI)
      joinV(v1, v2, ctx, PRI)
    }
  }

  clear = () => {
    const {ctx, W, H} = this
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.fillRect(0, 0, W, H)
    ctx.restore()
  }

  draw = () => {
    const {ctx, clear} = this
    ctx.fillStyle = '#000000'
    ctx.lineW = 2
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
