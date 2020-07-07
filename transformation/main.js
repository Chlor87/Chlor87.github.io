import '../common/global.js'
import Mat from '../common/Mat.js'
import Vec from '../common/Vec.js'
import {PRI, SEC} from '../common/style.js'
import Base from '../common/Base.js'
import {TWO_PI} from '../common/utils.js'


class App extends Base {

  constructor(canvas) {
    super(canvas)
    this.i = 0
    this.dir = 1

    this.T = new Mat(
      0, 1, 0,
      -1, 0, 0,
      0, 0, 0
    )
  }

  drawAxes() {
    const {axes: {x1, x2, y1, y2}} = this
    x1.to(x2)
    y1.to(y2)
  }

  drawUC = () => {
    const {ctx, UC} = this
    this.ctx.strokeStyle = PRI
    ctx.beginPath()
    ctx.arc(0, 0, UC, 0, TWO_PI)
    ctx.closePath()
    ctx.stroke()
  }

  drawUnitVectors() {
    const {ctx, i, T, UC} = this,
      x1 = new Vec(UC, 0, 1, ctx, '#ff0000'),
      y1 = new Vec(0, UC, 1, ctx, '#00ff00')
    x1.draw()
    y1.draw()
    x1.lerp(T.mul(x1), i).draw()
    y1.lerp(T.mul(y1), i).draw()
  }


  drawGrid() {
    const {ctx, i, T, WIDTH, HEIGHT, UC} = this,
      size = floor(UC / 2),
      xOffset = HEIGHT % size,
      yOffset = WIDTH % size
    for (let j = -HEIGHT + xOffset; j < HEIGHT + xOffset; j += size) {
      const main = j / size % 2 === 0,
        color = main ? SEC : PRI,
        x1 = new Vec(-WIDTH, j, 1, ctx, color),
        x2 = new Vec(WIDTH, j, 1, ctx, color)
      ctx.lineWidth = main ? 2 : 1
      x1.to(x2)
      x1.lerp(T.mul(x1), i).to(x2.lerp(T.mul(x2), i))
    }

    for (let j = -WIDTH + yOffset; j < WIDTH; j += size) {
      const main = j / size % 2 === 0,
        color = main ? SEC : PRI,
        y1 = new Vec(j, -WIDTH, 1, ctx, color),
        y2 = new Vec(j, WIDTH, 1, ctx, color)
      ctx.lineWidth = main ? 2 : 1
      y1.to(y2)
      y1.lerp(T.mul(y1), i).to(y2.lerp(T.mul(y2), i))
    }
  }

  draw = () => {
    const {ctx, dir, WIDTH, HEIGHT} = this
    ctx.fillStyle = '#000000'
    ctx.lineWidth = 2
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.fillRect(0, 0, WIDTH, HEIGHT)
    ctx.restore()
    this.drawAxes()
    // this.drawUC()
    this.drawGrid()
    this.drawUnitVectors()

    this.i += 0.01 * dir
    if (this.i < 0 || this.i >= 1) {
      this.dir *= -1
    }
    requestAnimationFrame(this.draw)
  }

}

void (() => {
  addEventListener('DOMContentLoaded', () => {
    const app = new App(document.querySelector('#canvas'))
    app.draw()
    addEventListener('resize', () => {
      app.setupDimensions()
    }, {passive: true})
  })
})()
