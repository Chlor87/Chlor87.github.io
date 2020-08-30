import '../common/global.js'
import {PRI, SEC, RED, GREEN} from '../common/style.js'
import Base from '../common/Base.js'
import V from '../common/V.js'
import M from '../common/M.js'
import {norm, drawV, joinV, clamp, pointV} from '../common/utils.js'

class App extends Base {
  UC = 50
  startX = 0
  startY = 0
  isDragging = false
  scale = 1

  constructor(canvas) {
    super(canvas)

    this.setupDimensions()

    const {HALF_WIDTH, HALF_HEIGHT} = this

    this.T = new M().rotate(PI / 4, PI / 4).translate(HALF_WIDTH, HALF_HEIGHT)

    canvas.addEventListener('mousedown', ({offsetX, offsetY}) => {
      this.startX = offsetX
      this.startY = offsetY
      this.isDragging = true
    })
    canvas.addEventListener('mouseleave', () => {
      this.isDragging = false
    })
    canvas.addEventListener('mouseup', () => {
      this.isDragging = false
    })
    canvas.addEventListener('mousemove', this.handleDrag)
    canvas.addEventListener('wheel', this.handleZoom)
  }

  handleZoom = ({deltaY, offsetX: x, offsetY: y}) => {
    const {T} = this,
      s = deltaY < 0 ? 1.1 : 0.9
    this.scale *= s
    if (this.scale < 0.001 || this.scale > 1000) {
      this.scale /= s
      return
    }
    this.T = T.translate(-x, -y).scale(s, s).translate(x, y)
    requestAnimationFrame(this.draw)
  }

  handleDrag = ({offsetX, offsetY, shiftKey}) => {
    if (!this.isDragging) {
      return
    }
    const {startX, startY, T, draw} = this,
      dx = offsetX - startX,
      dy = offsetY - startY
    this.startX = offsetX
    this.startY = offsetY
    this.T = T.translate(dx, dy)
    requestAnimationFrame(draw)
  }

  drawSquare = () => {
    const {ctx, T} = this,
      size = 25,
      space = 100,
      square = [
        new V(size, size),
        new V(-size, size),
        new V(-size, -size),
        new V(size, -size)
      ],
      ne = [space, space],
      nw = [-space, space],
      se = [-space, -space],
      sw = [space, -space],
      colors = [RED, GREEN, '#0000ff', '#ff00ff']

    void [ne, nw, se, sw].forEach(([x, y], idx) => {
      const m = new M().translate(x, y),
        pr = new PolygonRenderer(ctx, colors[idx], ...square.map(v => m.mul(v)))
      pr.transform = T
      pr.render()
    })
  }

  drawAxes = () => {
    const {ctx, WIDTH, HALF_WIDTH, HEIGHT, HALF_HEIGHT, T} = this,
      x1 = new V(-HALF_WIDTH, 0),
      x2 = new V(HALF_WIDTH, 0),
      y1 = new V(0, HALF_HEIGHT),
      y2 = new V(0, -HALF_HEIGHT),
      tx = new M().translate(HALF_WIDTH, T[5]),
      ty = new M().translate(T[2], HALF_HEIGHT),
      c = new M().translate(HALF_WIDTH, HALF_HEIGHT)

    joinV(c.mul(x1), c.mul(x2), ctx, SEC)
    joinV(c.mul(y1), c.mul(y2), ctx, SEC)
    joinV(tx.mul(x1), tx.mul(x2), ctx, PRI)
    joinV(ty.mul(y1), ty.mul(y2), ctx, PRI)
  }

  draw = ts => {
    const {ctx, WIDTH, HEIGHT} = this
    ctx.fillRect(0, 0, WIDTH, HEIGHT)
    this.drawAxes()
    this.drawSquare()
    // requestAnimationFrame(this.draw)
  }
}

class PolygonRenderer {
  transform = new M()
  points = []
  ctx = null
  color = null

  constructor(ctx, color, ...points) {
    this.ctx = ctx
    this.color = color
    this.points = points
  }

  render() {
    const {points, ctx, transform, color} = this,
      {length} = points
    ctx.save()
    ctx.beginPath()
    for (let i = 0; i < length; i++) {
      const [x, y] = transform.mul(points[i])
      ctx.lineTo(x, y)
      ctx.fillStyle = '#fff'
    }
    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()
    ctx.restore()
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
