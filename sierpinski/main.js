import '../common/global.js'
import {PRI, SEC, RED, GREEN} from '../common/style.js'
import Base from '../common/Base.js'
import V from '../common/V.js'
import M from '../common/M.js'
import {joinV, arcMeasure, drawV, pointV} from '../common/utils.js'

class App extends Base {
  startX = 0
  startY = 0
  isDragging = false
  scale = 1
  i = 0
  dir = 1
  max = 0

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
        requestAnimationFrame(this.draw)
      },
      {passive: true}
    )
  }

  setupDimensions() {
    super.setupDimensions()
    const {ctx, HALF_WIDTH, HALF_HEIGHT} = this
    ctx.setTransform(1, 0, 0, -1, HALF_WIDTH, HALF_HEIGHT)
    this.max = hypot(HALF_WIDTH, HALF_HEIGHT)
    this.UC = 0.4 * this.max
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
    requestAnimationFrame(this.draw)
  }

  drawSierpinski = (v1, v2, v3, i = 0) => {
    const {ctx} = this,
      v1v2 = v1.lerp(v2, 0.5),
      v2v3 = v2.lerp(v3, 0.5),
      v3v1 = v3.lerp(v1, 0.5),
      [x1, y1] = v1,
      [x2, y2] = v2,
      [x3, y3] = v3,
      [x4, y4] = v1v2,
      [x5, y5] = v2v3,
      [x6, y6] = v3v1

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.lineTo(x3, y3)
    ctx.lineTo(x1, y1)
    ctx.moveTo(x4, y4)
    ctx.lineTo(x5, y5)
    ctx.lineTo(x6, y6)
    ctx.lineTo(x4, y4)
    ctx.stroke()

    if (i > log(this.scale ** 2)) {
      return
    }
    i++

    this.drawSierpinski(v1, v1v2, v3v1, i)
    this.drawSierpinski(v2, v1v2, v2v3, i)
    this.drawSierpinski(v3, v2v3, v3v1, i)
  }

  draw = ts => {
    const {ctx, HALF_WIDTH, HALF_HEIGHT, WIDTH, HEIGHT} = this
    ctx.fillRect(-HALF_WIDTH, -HALF_HEIGHT, WIDTH, HEIGHT)

    ctx.strokeStyle = PRI
    ctx.lineWidth = 2

    const v = new M().rotate(-PI / 6).mul(new V(this.UC, 0)),
      T = new M().rotate((2 / 3) * PI),
      v1 = T.mul(v),
      v2 = T.mul(v1),
      v3 = T.mul(v2)

    this.drawSierpinski(this.T.mul(v1), this.T.mul(v2), this.T.mul(v3))
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
        app.draw()
      },
      {passive: true}
    )
  })
})()
