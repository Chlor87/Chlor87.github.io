import '../common/global.js'
import {SEC, PRI} from '../common/style.js'
import Base from '../common/Base.js'
import V from '../common/V.js'
import M from '../common/M.js'
import {joinV, pointV, drawV} from '../common/utils.js'

class App extends Base {
  UC = 50
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

    canvas.addEventListener('mousemove', this.handleMouseMove)

    canvas.addEventListener('wheel', ({offsetX, offsetY, deltaY}) => {
      const {HALF_WIDTH, HALF_HEIGHT} = this,
        s = deltaY < 0 ? 1.1 : 0.9,
        dx = (offsetX - HALF_WIDTH) * s,
        dy = -(offsetY - HALF_HEIGHT) * s
      this.scale *= s
      if (this.scale < 0.1 || this.scale > 10) {
        this.scale /= s
        return
      }
      this.T = this.T.translate(-dx, -dy)
        .scale(s, s)
        .translate(dx, dy)
      requestAnimationFrame(this.draw)
    })
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

  setupDimensions() {
    super.setupDimensions()
    const {ctx, HALF_WIDTH, HALF_HEIGHT} = this
    ctx.setTransform(1, 0, 0, -1, HALF_WIDTH, HALF_HEIGHT)
  }

  drawSquare = () => {
    const {ctx, T} = this,
      v1 = T.mul(new V(1, 0, 1).mul(25)),
      v2 = T.mul(new V(0, 1, 1).mul(25)),
      v3 = T.mul(new V(-1, 0, 1).mul(25)),
      v4 = T.mul(new V(0, -1, 1).mul(25)),
      squares = [v1, v2, v3, v4]

    ctx.save()
    ctx.beginPath()
    ctx.fillStyle = PRI
    for (let i = 0; i < squares.length; i++) {
      ctx.lineTo(...squares[i])
    }
    ctx.fill()
    ctx.restore()
  }

  draw = ts => {
    const {ctx, HALF_WIDTH, HALF_HEIGHT, WIDTH, HEIGHT} = this
    ctx.fillRect(-HALF_WIDTH, -HALF_HEIGHT, WIDTH, HEIGHT)
    this.drawSquare()
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
