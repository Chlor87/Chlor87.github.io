import '../common/global.js'
import Base from '../common/Base.js'

class App extends Base {

  constructor(canvas) {
    super(canvas)
    this.setupDimensions()
    this.setup()
  }

  setup() {
    this.setupDimensions()
  }

  setupDimensions() {
    super.setupDimensions()
    const {ctx, HW, HH} = this
    ctx.setTransform(1, 0, 0, -1, HW, HH)
  }

  draw = () => {
    const {ctx, HW, HH, W, H} = this
    ctx.fillRect(-HW, HH, W, -H)
    requestAnimationFrame(this.draw)
  }
}

void (() => {
  addEventListener('DOMContentLoaded', () => {
    const app = (window.app = new App(document.querySelector('#canvas')))
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
