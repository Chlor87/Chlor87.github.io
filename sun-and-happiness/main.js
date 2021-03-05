import '../common/global.js'
import WorkerDispatcher from '../common/WorkerDispatcher.js'
import {PRI} from '../common/style.js'
import Base from '../common/Base.js'
import V from '../common/V.js'
import M from '../common/M.js'
import {norm} from '../common/utils.js'

const memo = fn => {
  const store = new Map()
  return (...args) => {
    const [[x1, y1], [x2, y2]] = args,
      k = x1.toFixed(2) + y1.toFixed(2) + x2.toFixed(2) + y2.toFixed(2)
    if (store.has(k)) {
      return store.get(k)
    }
    const res = fn(...args)
    store.set(k, res)
    return res
  }
}

class App extends Base {
  i = 0
  dir = 1
  startX = 0
  startY = 0
  isDragging = false
  scale = 1

  colors = [
    'red',
    'orange',
    'yellow',
    'green',
    'blue',
    'indigo',
    'violet'
  ].reverse()
  colorSteps = this.colors.map((_, i) => norm(i, 0, this.colors.length))

  constructor(canvas) {
    super(canvas)
    this.setupDimensions()
    this.T = new M()

    this.wd = new WorkerDispatcher()
    this.wd.register('mul', './matrixWorker.js')

    canvas.addEventListener('mousedown', ({offsetX, offsetY}) => {
      this.startX = offsetX
      this.startY = offsetY
      this.isDragging = true
    })

    canvas.addEventListener('mouseup', () => {
      this.isDragging = false
    })

    canvas.addEventListener('mousemove', this.handleMouseMove, {passive: true})

    canvas.addEventListener(
      'wheel',
      ({offsetX, offsetY, deltaY}) => {
        const {HW: HALF_WIDTH, HH: HALF_HEIGHT} = this,
          s = deltaY < 0 ? 1.1 : 0.9,
          dx = (offsetX - HALF_WIDTH) * s,
          dy = -(offsetY - HALF_HEIGHT) * s
        this.scale *= s
        if (this.scale < 0.1 || this.scale > 1000) {
          this.scale /= s
          return
        }
        this.T = this.T.translate(-dx, -dy).scale(s, s).translate(dx, dy)
      },
      {passive: true}
    )
  }

  setupDimensions() {
    super.setupDimensions()
    const {ctx, HW: HALF_WIDTH, HH: HALF_HEIGHT} = this
    ctx.setTransform(1, 0, 0, -1, HALF_WIDTH, HALF_HEIGHT)
    this.UC = 0.5 * min(HALF_WIDTH, HALF_HEIGHT)
  }

  handleMouseMove = ({offsetX, offsetY}) => {
    if (!this.isDragging) {
      return
    }
    const {startX, startY} = this,
      dx = offsetX - startX,
      dy = -(offsetY - startY)
    this.startX = offsetX
    this.startY = offsetY
    this.T = this.T.translate(dx, dy)
  }

  getRainbow = memo((a, b, radial = false) => {
    const {ctx, colors, colorSteps} = this,
      {length} = colors
    let g

    if (radial) {
      const [x, y] = a.lerp(b, 0.5)
      g = ctx.createRadialGradient(x, y, 0, x, y, magV(a, b) / 2)
    } else {
      g = ctx.createLinearGradient(...a, ...b)
    }

    for (let i = 0; i < length; i++) {
      i > 0 && g.addColorStop(colorSteps[i], colors[i - 1])
      g.addColorStop(colorSteps[i], colors[i])
    }
    return g
  })

  drawInternal = async (a, b, c, d, e, f, g, h, gradient) => {
    const {ctx, T, wd} = this

    void ([a, b, c, d, e, f, g, h] = await wd.send('mul', {
      vectors: [a, b, c, d, e, f, g, h],
      matrix: T
    }))

    // a = T.mul(a)
    // b = T.mul(b)
    // c = T.mul(c)
    // d = T.mul(d)
    // e = T.mul(e)
    // f = T.mul(f)
    // g = T.mul(g)
    // h = T.mul(h)
    ctx.beginPath()
    gradient && (ctx.strokeStyle = this.getRainbow(a, d))
    ctx.moveTo(a[0], a[1])
    ctx.lineTo(b[0], b[1])
    ctx.lineTo(c[0], c[1])
    ctx.lineTo(d[0], d[1])
    ctx.moveTo(e[0], e[1])
    ctx.lineTo(f[0], f[1])
    ctx.lineTo(g[0], g[1])
    ctx.lineTo(h[0], h[1])
    ctx.stroke()
  }

  drawHappiness = async (v, r, step = 1) => {
    const {ctx, i, scale} = this,
      [x, y] = v,
      theta = TAU * (step % 2 === 1 ? i : -i),
      p = (0.2 * this.UC * scale) / step,
      hp = p / 2 / scale,
      t = new M().rotate(theta).translate(x, y),
      a = t.mul(new V(-r, r)),
      a1 = t.mul(new V(-r, r).sub(new V(0, -hp))),
      b = t.mul(new V(-r, 0)),
      c = t.mul(new V(r, 0)),
      d = t.mul(new V(r, -r)),
      d1 = t.mul(new V(r, -r).add(new V(0, -hp))),
      e = t.mul(new V(r, r)),
      e1 = t.mul(new V(r, r).sub(new V(-hp, 0))),
      f = t.mul(new V(0, r)),
      g = t.mul(new V(0, -r)),
      h = t.mul(new V(-r, -r)),
      h1 = t.mul(new V(-r, -r).add(new V(-hp, 0))),
      cpstep = step + 1

    // r /= PHI
    // if (step <= log(scale ** 2) + 2) {
    //   await Promise.all([
    //     this.drawHappiness(a, r, cpstep),
    //     this.drawHappiness(d, r, cpstep),
    //     this.drawHappiness(e, r, cpstep),
    //     this.drawHappiness(h, r, cpstep)
    //   ])
    // }

    ctx.save()
    ctx.strokeStyle = '#000'
    ctx.lineWidth = (((1 / 4) * this.UC) / step) * scale + p

    // await this.drawInternal(a1, b, c, d1, e1, f, g, h1, false)

    ctx.lineWidth = (((1 / 4) * this.UC) / step) * scale
    await this.drawInternal(a, b, c, d, e, f, g, h, true)
    ctx.restore()
  }

  draw = async ts => {
    const {ctx, HW: HALF_WIDTH, HH: HALF_HEIGHT, W: WIDTH, H: HEIGHT} = this
    ctx.fillStyle = this.getRainbow(
      new V(-HALF_WIDTH, HALF_HEIGHT),
      new V(HALF_WIDTH, -HALF_HEIGHT),
      true
    )
    ctx.fillRect(-HALF_WIDTH, -HALF_HEIGHT, WIDTH, HEIGHT)
    ctx.strokeStyle = PRI
    ctx.fillStyle = PRI
    ctx.lineWidth = 2
    this.i += 0.002 * this.dir
    if (this.i >= 1) {
      this.i = 0
    }
    await this.drawHappiness(new V(0, 0), this.UC)

    requestAnimationFrame(this.draw)
  }
}

void (() => {
  // addEventListener('DOMContentLoaded', () => {
  const app = new App(document.querySelector('#canvas'))
  requestAnimationFrame(app.draw)
  addEventListener(
    'resize',
    () => {
      app.setupDimensions()
    },
    {passive: true}
  )
  // })
})()
