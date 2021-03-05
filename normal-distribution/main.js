import '../common/global.js'
import {GREEN, PRI, RED, SEC} from '../common/style.js'
import Base from '../common/Base.js'
import M from '../common/M.js'
import V from '../common/V.js'
import {clamp, joinV, map, pointV} from '../common/utils.js'
import {iqr, median, quartiles, sort} from '../common/statistics.js'

const randRange = (min, max) => floor(random() * (max - min + 1)) + min,
  MIN = 1,
  MAX = 6,
  data = Array.from({length: 1e6}).reduce((p, c, i) => {
    p[i] = randRange(MIN, MAX) + randRange(MIN, MAX)
    return p
  }, [])

class App extends Base {
  startX = 0
  startY = 0
  isDragging = false

  constructor(canvas) {
    super(canvas)
    this.T = new M()
    this.setupDimensions()
  }

  setupDimensions() {
    super.setupDimensions()
    const {ctx, HW, HH} = this
    ctx.setTransform(1, 0, 0, -1, HW, HH)
  }

  drawPlane = () => {
    const {ctx, HW, HH} = this,
      h = HW / 2,
      v = (HH * 3) / 4,
      m = data.reduce((p, c) => {
        if (!p.has(c)) {
          p.set(c, 0)
        }
        p.set(c, p.get(c) + 1)
        return p
      }, new Map())

    joinV(new V(-h, -v), new V(h, -v), ctx, PRI)
    joinV(new V(-h, v), new V(-h, -v), ctx, PRI)

    for (let [bucket, occurences] of m.entries()) {
      pointV(
        new V(
          map(bucket, MIN * 2, MAX * 2, -h, h),
          map(occurences, 0, data.length, -v, v)
        ),
        ctx,
        PRI
      )
      ctx.scale(1, -1)
      ctx.fillText(`${bucket}`, map(bucket, MIN * 2, MAX * 2, -h, h), v + 22)
      ctx.scale(1, -1)
    }
  }

  draw = () => {
    const {ctx, HW, HH, W, H, T} = this
    ctx.fillStyle = '#000'
    ctx.fillRect(-HW, HH, W, -H)
    ctx.fillStyle = SEC
    ctx.strokeStyle = PRI
    ctx.font = '16px sans'
    ctx.lineWidth = 2
    ctx.textAlign = 'center'
    this.drawPlane()
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
        app.draw()
      },
      {passive: true}
    )
  })
})()
