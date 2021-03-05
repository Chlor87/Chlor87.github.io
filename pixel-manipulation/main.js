import '../common/global.js'
import {PRI} from '../common/style.js'
import Base from '../common/Base.js'
import M from '../common/M.js'
import V from '../common/V.js'

class App extends Base {
  startX = 0
  startY = 0
  isDragging = false

  constructor(canvas) {
    super(canvas)
    this.T = new M()
    this.canvas.addEventListener('mousedown', ({offsetX, offsetY}) => {
      this.startX = offsetX
      this.startY = offsetY
      this.isDragging = true
    })

    this.canvas.addEventListener('mouseup', () => {
      this.isDragging = false
    })

    this.canvas.addEventListener('mousemove', ({offsetX, offsetY}) => {
      if (!this.isDragging) {
        return
      }
      const {startX, startY, HW, HH} = this,
        dx = offsetX - startX,
        dy = -(offsetY - startY)
      this.startX = offsetX
      this.startY = offsetY
      this.T = this.T.translate(dx, dy)
      requestAnimationFrame(this.draw)
    })
    // this.setupDimensions()
  }

  setupDimensions() {
    super.setupDimensions()
    const {ctx, HW, HH} = this
    ctx.setTransform(1, 0, 0, -1, HW, HH)
  }

  draw = () => {
    const {ctx, HW, HH, W, H, T} = this,
      ratio = HW / HH,
      size = W,
      xDist = size * ratio,
      dist = hypot(2, xDist)

    ctx.fillRect(-HW, HH, W, -H)
    ctx.strokeStyle = PRI

    const imageData = new ImageData(W, H)

    for (let x = 0; x < W; x++) {
      for (let y = 0; y < H; y++) {
        let i = (y * W + x) * 4,
          xx = HW - x,
          yy = -(HH - y),
          v = T.mul(new V(xx, yy))

        if ((xx > -2 && xx < 2) || (yy > -2 && yy < 2)) {
          imageData.data[i] = 255
          imageData.data[i + 1] = 255
          imageData.data[i + 2] = 255
          imageData.data[i + 3] = 255
        } else if (v.mag < 100) {
          imageData.data[i] = 255
          imageData.data[i + 1] = 0
          imageData.data[i + 2] = 0
          imageData.data[i + 3] = 255
        } else {
          imageData.data[i] = 0
          imageData.data[i + 1] = 0
          imageData.data[i + 2] = 0
          imageData.data[i + 3] = 255
        }
      }
    }

    ctx.putImageData(imageData, 0, 0)

    // requestAnimationFrame(this.draw)
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
