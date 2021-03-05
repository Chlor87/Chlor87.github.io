import '../common/global.js'
import {PRI, YELLOW} from '../common/style.js'
import Base from '../common/Base.js'
import V from '../common/V.js'
import M from '../common/M.js'
import C from '../common/C.js'
import {joinV, map, pointV, zToColor} from '../common/utils.js'

const mandel = (z, x1, x2, y1, y2) => {
  let Z = new C(0, 0),
    c = cosine(z.map(x1, x2, -2, 2, y1, y2, -2, 2))
  for (let i = 0; i < 20; i++) {
    Z = Z.pow(2).add(c)
    if (Z.mag > 2) {
      // break
      return null
    }
  }
  return Z
}

const sine = ([re, im]) => new C(sin(re) * cos(im), cos(re) * sin(im)),
  cosine = ([re, im]) => new C(cos(re) * cos(im), -(sin(re) * sin(im)))

class App extends Base {
  i = 0
  dir = 1
  numPoints = +localStorage.getItem('numPoints') || 10

  constructor(canvas) {
    super(canvas)
    this.setupDimensions()
  }

  setupDimensions() {
    super.setupDimensions()
    const {ctx, HW, HH} = this
    ctx.setTransform(1, 0, 0, -1, HW, HH)
  }

  drawWheel = () => {
    const {ctx, i} = this,
      r = 400
    for (let j = 0; j < 360; j++) {
      const Z = new C(cos(j.rad), sin(j.rad))
      pointV(Z.mul(r).rot(i.rad), ctx, zToColor(Z), 25)
    }
  }

  draw = ts => {
    const {ctx, HW, HH, W, H} = this
    ctx.fillRect(-HW, -HH, W, H)
    ctx.strokeStyle = PRI
    this.drawWheel()
    this.i += 10
    if (this.i >= 360) {
      this.i = 0
    }
    requestAnimationFrame(this.draw)
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
