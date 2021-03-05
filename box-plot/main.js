import '../common/global.js'
import {GREEN, PRI, RED, SEC} from '../common/style.js'
import Base from '../common/Base.js'
import M from '../common/M.js'
import V from '../common/V.js'
import {clamp, joinV, map, pointV} from '../common/utils.js'
import {iqr, median, quartiles, sort} from '../common/statistics.js'

// const randRange = (min, max) => floor(random() * (max - min + 1)) + min,
//   MIN = 1,
//   MAX = 1000

// const data = Array.from({length: 10}).map(() => randRange(MIN, MAX))
let data = sort([1, 2, 3, 4, 5, 17]),
  MIN = 0,
  MAX = data[data.length - 1]

window.setData = v => {
  data = sort(v)
  MAX = data[data.length - 1]
  requestAnimationFrame(window.app.draw)
}

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

  drawPlane = data => {
    const {ctx, HW, HH, W, H} = this,
      sorted = data.sort((a, b) => a - b),
      min = sorted[0],
      max = sorted[sorted.length - 1],
      l = -HW + 50,
      r = HW - 50,
      minPoint = new V(map(min, MIN, MAX, l, r), 0),
      maxPoint = new V(map(max, MIN, MAX, l, r), 0),
      bottomLeft = new V(l, -HH / 2),
      m = map(median(sorted), MIN, MAX, l, r),
      [lq, rq] = quartiles(sorted).map(q => map(q, MIN, MAX, l, r)),
      iqr = (rq - lq) * 1.5,
      lOutlierLimit = clamp(lq - iqr, minPoint.x, maxPoint.x),
      rOutlierLimit = clamp(rq + iqr, minPoint.x, maxPoint.x)

    joinV(bottomLeft, new V(r, -HH / 2), ctx, PRI)
    joinV(bottomLeft, new V(l, HH / 2), ctx, PRI)
    pointV(minPoint, ctx, PRI, 5)
    pointV(maxPoint, ctx, PRI, 5)
    joinV(minPoint, new V(lq, 0), ctx, PRI)
    joinV(new V(rq, 0), maxPoint, ctx, PRI)

    ctx.strokeRect(...new V(lq, 50), rq - lq, -100)

    joinV(new V(lOutlierLimit, -10), new V(lOutlierLimit, 10), ctx, RED)
    joinV(new V(rOutlierLimit, -10), new V(rOutlierLimit, 10), ctx, RED)

    joinV(new V(m, 50), new V(m, -50), ctx, PRI)
    const dist = (r - l) / max

    for (let i = minPoint.x, j = min; i <= r + dist/2; i += dist, j++) {
      joinV(new V(i, -HH / 2 + 8), new V(i, -HH / 2 - 8), ctx, PRI)
      ctx.scale(1, -1)
      ctx.fillText(j, i, HH / 2 + 28)
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
    this.drawPlane(data)
    // requestAnimationFrame(this.draw)
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
