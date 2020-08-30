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
    const {ctx, HALF_WIDTH, HALF_HEIGHT} = this
    ctx.setTransform(1, 0, 0, -1, HALF_WIDTH, HALF_HEIGHT)
    this.shorterSide = min(this.WIDTH, this.HEIGHT) / 2
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
        .rotate(
          i % 2 === 0 ? theta - TAU * this.i : theta + TAU * this.i
        ),
      [ax, ay] = t.mul(new V(0, 0)),
      [bx, by] = t.mul(new V(8, 4)),
      [cx, cy] = t.mul(new V(16, 0)),
      [dx, dy] = t.mul(new V(8, -4))

    ctx.save()
    ctx.lineWidth = 4
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
    const {ctx, HALF_WIDTH, HALF_HEIGHT, WIDTH, HEIGHT} = this
    ctx.strokeStyle = PRI
    ctx.fillRect(-HALF_WIDTH, -HALF_HEIGHT, WIDTH, HEIGHT)
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
