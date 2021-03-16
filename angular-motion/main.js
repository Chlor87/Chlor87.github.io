import '../common/global.js'
import Base from '../common/Base.js'
import {vec} from '../common/V.js'

const pointsToFunc = (a, b) => {
  const m = (b.y - a.y) / (b.x - a.x),
    b = -m * a.x + a.y,
    fn = x => m * x + b
  return [fn, m, b]
}

const dist = (x, fn) => sqrt(x ** 2 + fn(x) ** 2)

console.log(pointsToFunc(vec(0, 0), vec(1, 1)))

class Ray {
  constructor(dir, maxR, map) {}

  march() {
    // return  ???
  }
}

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
    const {ctx, W, H, HW, HH} = this
    ctx.setTransform(1, 0, 0, -1, HW, HH)
  }

  draw = () => {
    const {ctx, HW, HH, W, H, p} = this
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
