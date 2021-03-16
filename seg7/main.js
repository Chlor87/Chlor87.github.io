import '../common/global.js'
import Base from '../common/Base.js'
import Seg7 from './Seg7.js'
import {vec} from '../common/V.js'
import {BASE_LENGTH} from './Tile.js'
import {BLACK, PRI} from '../common/style.js'

const splitDigits = n => {
  const tens = floor(n * 0.1)
  return [tens, n - tens * 10]
}

const getTime = () => {
  const now = new Date()
  return [now.getHours(), now.getMinutes(), now.getSeconds()].flatMap(
    splitDigits
  )
}

class App extends Base {
  segments = []
  colons = []
  i = 0

  constructor(canvas) {
    super(canvas)
    this.setup()
  }

  setup() {
    this.setupDimensions()
    this.colons = []
    const {ctx, HW, HH} = this,
      len = min(HW, HH) * 0.025,
      screenLen = BASE_LENGTH * len,
      margin = screenLen * 0.2,
      clockLen = 6 * (screenLen + margin) + 2 * margin,
      lo = -0.5 * (clockLen + screenLen),
      hi = 0.5 * (clockLen - screenLen),
      colonOffsetX = (hi - lo) / 5,
      colonOffsetY = screenLen * 0.25

    for (let i = 0; i < 6; i++) {
      const isSpace = (i + 1) % 2 === 0,
        offset = (isSpace ? margin : -margin) / 2,
        pos = vec(map(i, 0, 5, lo, hi) - offset, -screenLen)
      this.segments[i] = new Seg7({
        ctx,
        pos,
        len,
        openColor: PRI,
        closeColor: BLACK
      })
    }

    for (let i = 0; i < 2; i++) {
      const x = map(i, 0, 1, -colonOffsetX, colonOffsetX)
      this.colons.push(vec(x, colonOffsetY), vec(x, -colonOffsetY))
    }
  }

  setupDimensions() {
    super.setupDimensions()
    const {ctx, HW, HH} = this
    ctx.setTransform(1, 0, 0, -1, HW, HH)
  }

  draw = () => {
    const {ctx, HW, HH, W, H, segments, colons} = this,
      now = getTime()
    ctx.fillRect(-HW, HH, W, -H)

    requestAnimationFrame(this.draw)

    for (let i = 0; i < segments.length; i++) {
      segments[i].setDigit(now[i])
      segments[i].draw()
    }
    for (let i = 0; i < colons.length; i++) {
      pointV(this.colons[i], ctx, PRI, min(HW, HH) * 0.025)
    }
  }
}

void (() => {
  addEventListener('DOMContentLoaded', () => {
    const app = (window.app = new App(document.querySelector('#canvas')))
    requestAnimationFrame(app.draw)
    addEventListener(
      'resize',
      () => {
        app.setup()
      },
      {passive: true}
    )
  })
})()

const riemannSum = (fn, range, divs) => {
  const [lo, hi] = range,
    x = (hi - lo) / divs
  let left = 0,
    right = 0
  for (let i = lo; i <= hi; i += x) {
    const y = fn(i)
    i < hi && (left += y)
    i > 0 && (right += y)
  }
  return 0.5 * x * (left + right)
}

console.log(riemannSum(x => x ** 2, vec(1, 3), 1e3))
