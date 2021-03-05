import '../common/global.js'
import {SEC, PRI, RED, GREEN} from '../common/style.js'
import Base from '../common/Base.js'
import V from '../common/V.js'
import M from '../common/M.js'

/**
 * set some other irrational numbers for other spirals
 */
const GOLDEN_ANGLE = TAU * 1.61803398875

class App extends Base {
  i = 0
  dir = 1
  numSeeds = 1e3

  constructor(canvas) {
    super(canvas)
    this.setupDimensions()
    this.ctx.strokeStyle = PRI
  }

  setupDimensions() {
    super.setupDimensions()
    const {ctx, HW, HH} = this
    ctx.setTransform(1, 0, 0, -1, HW, HH)
    this.shorterSide = min(this.W, this.H) / 2
  }

  drawPetals = () => {
    const {numSeeds} = this
    let theta = 0
    for (let i = numSeeds; i >= 0; i--) {
      this.drawPetal(theta, i)
      theta += GOLDEN_ANGLE
    }
  }

  drawPetal(theta, i) {
    const {ctx, shorterSide} = this,
      t = new M()
        .scale(map(i, 0, this.numSeeds, 1, 4), 1)
        .translate(map(i, 0, this.numSeeds, 0, 0.75 * shorterSide), 0)
        .rotate(i % 2 === 0 ? theta - TAU * this.i : theta + TAU * this.i),
      [ax, ay] = t.mul(new V(0, 0)),
      [bx, by] = t.mul(new V(8, 4)),
      [cx, cy] = t.mul(new V(16, 0)),
      [dx, dy] = t.mul(new V(8, -4))

    ctx.save()
    ctx.lineW = 4
    ctx.fillStyle = i % 2 === 0 ? GREEN : PRI
    ctx.strokeStyle = '#000'
    ctx.beginPath()
    ctx.moveTo(ax, ay)
    ctx.lineTo(bx, by)
    ctx.lineTo(cx, cy)
    ctx.lineTo(dx, dy)
    ctx.stroke()
    ctx.fill()
    ctx.restore()
  }

  draw = ts => {
    const {ctx, HW, HH, W, H} = this
    ctx.strokeStyle = PRI
    ctx.fillRect(-HW, -HH, W, H)
    this.drawPetals()
    this.i += 0.001 * this.dir
    if (this.i >= 1) {
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
      },
      {passive: true}
    )
  })
})()
