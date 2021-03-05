import '../common/global.js'
import {PRI, SEC, RED, GREEN} from '../common/style.js'
import Base from '../common/Base.js'
import V from '../common/V.js'
import M from '../common/M.js'
import {joinV} from '../common/utils.js'

class App extends Base {
  i = 0
  dir = 1

  constructor(canvas) {
    super(canvas)
    this.setupDimensions()
    this.T = new M()
  }

  setupDimensions() {
    super.setupDimensions()
    const {ctx, HW, HH} = this
    ctx.setTransform(1, 0, 0, -1, HW, HH)
    this.UC = (min(HW, HH) * 2) / 3
  }

  draw = ts => {
    const {ctx, HW, HH, W, H, UC} = this
    ctx.fillRect(-HW, -HH, W, H)
    ctx.strokeStyle = PRI
    ctx.lineWidth = (1 / 20) * UC

    this.i = this.i + 0.005
    if (this.i >= 1) {
      this.i = 0
    }

    const a = new V(UC, 0).rotate(PI / 2 + TAU * this.i),
      b = a.rotate((2 / 3) * PI),
      c = b.rotate((2 / 3) * PI),
      r = magV(a, b) / 2,
      pivotAB = a.add(b).div(2),
      pivotBC = b.add(c).div(2),
      pivotCA = c.add(a).div(2),
      thetaAB = pivotAB.dir,
      thetaBC = pivotBC.dir,
      thetaCA = pivotCA.dir

    ctx.beginPath()
    ctx.arc(pivotCA.x, pivotCA.y, r, thetaCA + PI / 2, thetaCA - PI / 2)
    ctx.arc(pivotBC.x, pivotBC.y, r, thetaBC + PI / 2, thetaBC - PI / 2)
    ctx.arc(pivotAB.x, pivotAB.y, r, thetaAB + PI / 2, thetaAB - PI / 2)
    ctx.stroke()

    // joinV(pivotAB, pivotBC, ctx, PRI)
    // joinV(pivotBC, pivotCA, ctx, PRI)
    // joinV(pivotCA, pivotAB, ctx, PRI)

    // joinV(a, b, ctx, PRI)
    // joinV(b, c, ctx, PRI)
    // joinV(c, a, ctx, PRI)

    ctx.beginPath()
    ctx.arc(0, 0, 2/3*UC, 0, TAU)
    ctx.stroke()

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
