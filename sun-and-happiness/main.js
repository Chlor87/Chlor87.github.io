import '../common/global.js'
import {PRI, SEC} from '../common/style.js'
import Base from '../common/Base.js'
import V from '../common/V.js'
import M from '../common/M.js'

class App extends Base {
  i = 0
  dir = 1
  startX = 0
  startY = 0
  isDragging = false
  scale = 1

  constructor(canvas) {
    super(canvas)
    this.setupDimensions()
    this.T = new M()

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
        const {HALF_WIDTH, HALF_HEIGHT} = this,
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
    const {ctx, HALF_WIDTH, HALF_HEIGHT} = this
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

  drawInternal = (a, b, c, d, e, f, g, h) => {
    const {ctx, T} = this
    a = T.mul(a)
    b = T.mul(b)
    c = T.mul(c)
    d = T.mul(d)
    e = T.mul(e)
    f = T.mul(f)
    g = T.mul(g)
    h = T.mul(h)
    ctx.beginPath()
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

  drawTrig = (v, r, step = 1) => {
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

    r /= PHI
    if (step <= log(scale ** 2) + 2) {
      this.drawTrig(a, r, cpstep)
      this.drawTrig(d, r, cpstep)
      this.drawTrig(e, r, cpstep)
      this.drawTrig(h, r, cpstep)
    }

    ctx.save()
    ctx.strokeStyle = '#000'
    ctx.lineWidth = (((1 / 4) * this.UC) / step) * scale + p
    this.drawInternal(a1, b, c, d1, e1, f, g, h1)

    ctx.strokeStyle = SEC
    ctx.lineWidth = (((1 / 4) * this.UC) / step) * scale
    this.drawInternal(a, b, c, d, e, f, g, h)
    ctx.restore()
  }

  draw = ts => {
    const {ctx, HALF_WIDTH, HALF_HEIGHT, WIDTH, HEIGHT} = this
    ctx.fillStyle = '#000'
    ctx.fillRect(-HALF_WIDTH, -HALF_HEIGHT, WIDTH, HEIGHT)
    ctx.strokeStyle = PRI
    ctx.fillStyle = PRI
    ctx.lineWidth = 2
    this.i += 0.002 * this.dir
    if (this.i >= 1) {
      this.i = 0
    }
    this.drawTrig(new V(0, 0), this.UC)

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
