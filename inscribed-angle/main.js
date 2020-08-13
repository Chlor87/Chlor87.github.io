import '../common/global.js'
import {PRI, SEC, GREEN, RED} from '../common/style.js'
import Base from '../common/Base.js'
import V from '../common/V.js'
import M from '../common/M.js'
import {
  joinV,
  pointV,
  arcMeasure,
  arc,
  text,
  normalizeAngle
} from '../common/utils.js'

class App extends Base {
  UC = 200
  isDragging = false
  P = null
  points = []

  constructor(canvas) {
    super(canvas)
    this.setupDimensions()
    this.bindListeners()
  }

  setupDimensions() {
    super.setupDimensions()
    // prettier-ignore
    this.T = new M(
      1, 0, this.HALF_WIDTH,
      0, 1, -this.HALF_HEIGHT,
      0, 0, 1
    )

    this.O = this.T.mul(new V(0, 0, 1))
    this.ctx.setTransform(1, 0, 0, -1, 0, 0)
  }

  bindListeners = () => {
    this.canvas.addEventListener('mousemove', this.handleMouseMove)
    this.canvas.addEventListener('mousedown', this.handleMouseDown)
    this.canvas.addEventListener('mouseup', this.handleMouseUp)
    this.canvas.addEventListener('dblclick', this.handleDblClick)
    addEventListener('resize', this.handleResize, {passive: true})
  }

  handleResize = () => {
    // use old origin
    const {O} = this
    this.setupDimensions()
    const {T, UC} = this

    // scale points so they stick to the circle
    this.points = this.points.map(p =>
      T.mul(new M().translate(UC, 0).rotate(arcMeasure(O, p))).mul(
        new V(0, 0, 1)
      )
    )
    requestAnimationFrame(this.draw)
  }

  handleMouseDown = e => {
    this.isDragging = true
    this.setPoint(e)
    requestAnimationFrame(this.draw)
  }

  handleMouseMove = e => {
    if (!this.isDragging) {
      return
    }
    this.setPoint(e)
    requestAnimationFrame(this.draw)
  }

  handleMouseUp = e => {
    const {points} = this
    this.setPoint(e)
    if (points.length < 3) {
      points.push(this.P)
    }
    this.P = null
    this.isDragging = false
    requestAnimationFrame(this.draw)
  }

  handleDblClick = e => {
    this.points = []
    requestAnimationFrame(this.draw)
  }

  setPoint = ({offsetX, offsetY, shiftKey}) => {
    const {
        O: [ox, oy],
        T,
        UC,
        points
      } = this,
      dx = offsetX - ox,
      dy = offsetY + oy
    let θ = normalizeAngle(atan2(dy, dx))

    if (shiftKey) {
      θ = round(θ / (PI / 12)) * (PI / 12)
    }
    this.P = T.mul(new V(cos(θ), -sin(θ), 1).mul(UC))
    if (points.length === 3) {
      this.points[2] = this.P
    }
  }

  drawCircle = () => {
    const {ctx, UC, O} = this
    arc(O, 0, TWO_PI, UC, ctx, PRI)
    pointV(O, ctx, PRI)
  }

  drawMouse = () => {
    const {
      O,
      P,
      points: {length},
      ctx,
      T,
      UC
    } = this
    if (!P || length > 2) {
      return
    }
    const θ = arcMeasure(O, P),
      v = T.mul(new M().translate(UC + 25, 0).rotate(θ)).mul(new V(0, 0, 1))
    joinV(O, P, ctx, PRI, true)
    this.typeAngle(v, arcMeasure(O, P))
  }

  drawPoints = () => {
    const {ctx, UC, O, points, T} = this,
      {length} = points,
      [a, b, c] = points
    let θmin, θmax, φmin, φmax

    if (length === 0) {
      return
    }

    if (length > 0) {
      θmin = arcMeasure(O, a)
      pointV(a, ctx, RED)
    }

    if (length > 1) {
      θmax = arcMeasure(O, b)
      pointV(b, ctx, RED)
      joinV(O, a, ctx, RED)
      joinV(O, b, ctx, RED)
      arc(O, θmin, θmax, UC, ctx, RED)
      arc(O, θmin, θmax, UC / 5, ctx, RED)
      this.typeAngle(O.add(25), θmax - θmin)
    }

    if (length > 2) {
      φmin = arcMeasure(c, a)
      φmax = arcMeasure(c, b)
      const curr = arcMeasure(O, c),
        reverse = θmin > θmax
      let inArc = curr > min(θmin, θmax) && curr < max(θmin, θmax)

      if (reverse) {
        inArc = !inArc
      }

      if (inArc) {
        void ([φmin, φmax] = [φmax, φmin])
      }

      pointV(c, ctx, GREEN)
      joinV(a, c, ctx, GREEN)
      joinV(b, c, ctx, GREEN)
      arc([c[0], c[1]], φmin, φmax, UC / 4, ctx, inArc ? RED : GREEN)
      this.typeAngle(
        T.mul(new M().translate(UC + 50, 0).rotate(arcMeasure(O, c))).mul(
          new V(0, 0, 1)
        ),
        φmax - φmin
      )
    }
  }

  typeAngle = (v, θ) => {
    const {ctx} = this,
      n = normalizeAngle(θ)
    text(v, `${n.toFixed(2)}π (${n.deg.toFixed(0)}°)`, ctx, SEC)
  }

  draw = () => {
    const {ctx, WIDTH, HEIGHT} = this
    ctx.fillRect(0, 0, WIDTH, -HEIGHT)
    ctx.lineWidth = 2
    this.drawCircle()
    this.drawMouse()
    this.drawPoints()
  }
}

void (() => {
  addEventListener('DOMContentLoaded', () => {
    const app = new App(document.querySelector('#canvas'))
    requestAnimationFrame(app.draw)
  })
})()