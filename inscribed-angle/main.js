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
  startX = 0
  startY = 0
  isDragging = false
  P = null
  points = []

  constructor(canvas) {
    super(canvas)
    this.setupDimensions()
    canvas.addEventListener('mousemove', this.handleMouseMove)
    canvas.addEventListener('mousedown', () => {
      this.isDragging = true
      requestAnimationFrame(this.draw)
    })
    canvas.addEventListener('mouseup', e => {
      this.isDragging = true
      this.handleMouseMove(e)
      this.handleMouseUp(e)
    })

    canvas.addEventListener('click', this.handleMouseUp)
    canvas.addEventListener('dblclick', () => {
      this.points = []
      this.isDragging = false
      requestAnimationFrame(this.draw)
    })
  }

  setupDimensions = () => {
    super.setupDimensions()
    this.T = new M().translate(this.HALF_WIDTH, -this.HALF_HEIGHT)
    this.O = this.T.mul(new V(0, 0, 1))
  }

  handleMouseMove = ({offsetX, offsetY, shiftKey}) => {
    if (!this.isDragging) {
      return
    }

    const {T, UC, O} = this,
      [ox, oy] = O,
      dx = offsetX - ox,
      dy = offsetY + oy
    let Θ = (atan2(dy, dx) + TWO_PI) % TWO_PI

    if (shiftKey) {
      Θ = (round(Θ / (TWO_PI / 24)) * TWO_PI) / 24
    }
    this.P = T.mul(new V(cos(Θ), -sin(Θ), 1).mul(UC))

    if (this.points.length === 3) {
      this.points[2] = this.P
    }
    requestAnimationFrame(this.draw)
  }

  handleMouseUp = () => {
    this.isDragging = false
    if (this.points.length < 3 && this.P) {
      this.points.push(this.P)
    }
    this.P = null
    requestAnimationFrame(this.draw)
  }

  drawAxes = () => {
    const {ctx, HALF_WIDTH, HALF_HEIGHT, T} = this,
      x1 = new V(-HALF_WIDTH, 0, 1),
      x2 = new V(HALF_WIDTH, 0, 1),
      y1 = new V(0, HALF_HEIGHT, 1),
      y2 = new V(0, -HALF_HEIGHT, 1)
    joinV(T.mul(x1), T.mul(x2), ctx, SEC)
    joinV(T.mul(y1), T.mul(y2), ctx, SEC)
  }

  drawCircle = () => {
    const {ctx, UC, O} = this
    arc(O, 0, TWO_PI, UC, ctx, PRI)
  }

  drawMouse = () => {
    const {O, P, ctx} = this
    if (!P || this.points.length === 3) {
      return
    }
    joinV(O, P, ctx, PRI, true)
  }

  drawPoints = () => {
    const {ctx, UC, T, O, points} = this,
      {length} = points,
      [a, b, c] = points,
      [x, y] = O
    let minTheta, maxTheta, minPsi, maxPsi

    if (length === 0) {
      return
    }

    if (length > 0) {
      minTheta = arcMeasure(O, a)
      pointV(a, ctx, RED)
    }

    if (length > 1) {
      maxTheta = arcMeasure(O, b)
      pointV(b, ctx, RED)
      joinV(O, a, ctx, RED)
      joinV(O, b, ctx, RED)
      arc(O, minTheta, maxTheta, UC, ctx, RED)
      arc(O, minTheta, maxTheta, UC / 5, ctx, RED)
      text(
        x + 15,
        y + 15,
        `${normalizeAngle(maxTheta - minTheta).deg.toFixed(2)}`,
        ctx,
        '#fff'
      )
    }

    if (length > 2) {
      minPsi = arcMeasure(c, a)
      maxPsi = arcMeasure(c, b)
      const curr = arcMeasure(O, c),
        reverse = minTheta > maxTheta
      let inArc =
        curr > min(minTheta, maxTheta) && curr < max(minTheta, maxTheta)

      if (reverse) {
        inArc = !inArc
      }

      if (inArc) {
        void ([minPsi, maxPsi] = [maxPsi, minPsi])
      }

      pointV(c, ctx, GREEN)
      joinV(a, c, ctx, GREEN)
      joinV(b, c, ctx, GREEN)
      arc([c[0], c[1]], minPsi, maxPsi, UC / 4, ctx, inArc ? RED : GREEN)
      text(
        c[0] + 15,
        c[1] + 15,
        normalizeAngle(maxPsi - minPsi).deg.toFixed(2),
        ctx,
        '#fff'
      )
    }
  }

  draw = ts => {
    const {ctx, WIDTH, HEIGHT} = this
    ctx.setTransform(1, 0, 0, -1, 0, 0)
    ctx.fillRect(0, 0, WIDTH, -HEIGHT)
    ctx.lineWidth = 2
    // this.drawAxes()
    this.drawCircle()
    this.drawMouse()
    this.drawPoints()
  }
}

Object.defineProperties(Number.prototype, {
  deg: {
    get() {
      return (this * 180) / PI
    }
  },
  rad: {
    get() {
      return (this * PI) / 180
    }
  }
})

void (() => {
  addEventListener('DOMContentLoaded', () => {
    const app = new App(document.querySelector('#canvas'))
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
