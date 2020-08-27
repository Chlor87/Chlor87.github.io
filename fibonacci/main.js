import '../common/global.js'
import {SEC, PRI} from '../common/style.js'
import Base from '../common/Base.js'
import V from '../common/V.js'
import M from '../common/M.js'
import {joinV, pointV, drawV, arcMeasure} from '../common/utils.js'

class App extends Base {
  UC = 100

  constructor(canvas) {
    super(canvas)
    this.setupDimensions()
    this.ctx.strokeStyle = PRI
  }

  setupDimensions() {
    super.setupDimensions()
    const {ctx, HALF_WIDTH, HALF_HEIGHT, UC, numPoints} = this
    ctx.setTransform(1, 0, 0, -1, HALF_WIDTH, HALF_HEIGHT)
    this.UC = min(HALF_WIDTH, HALF_HEIGHT) * 0.1
  }

  drawAxes = () => {
    const {ctx, HALF_WIDTH, HALF_HEIGHT} = this,
     x1 = new V(-HALF_WIDTH, 0, 1),
     x2 = new V(HALF_WIDTH, 0, 1),
     y1 = new V(0, -HALF_HEIGHT, 1),
     y2 = new V(0, HALF_HEIGHT, 1)
     joinV(x1, x2, ctx, SEC)
     joinV(y1, y2, ctx, SEC)
  }

  squares = () => {
    const {ctx, UC} = this,
      data = [
        {
          o: new V(0, 0, 1),
          p: new V(1, 0, 1),
          seq: 1
        },
        {
          o: new V(0, 0, 1),
          p: new V(0, 1, 1),
          seq: 1
        },
        {
          o: new V(1, 0, 1),
          p: new V(-1, 0, 1),
          seq: 2
        },
        {
          o: new V(1, 1, 1),
          p: new V(1, -2, 1),
          seq: 2
        },
        {
          o: new V(-1, 1, 1),
          p: new V(4, 1, 1),
          seq: 2
        },
        // {
        //   o: new V(-1, -2, 1),
        //   p: new V(-1, 6, 1),
        //   seq: 2
        // }
      ]
    for (let [i, {o, p, seq}] of data.entries()) {
      o = o.mul(UC)
      p = p.mul(UC)
      
      const [ox, oy] = o,
        [x, y] = p

        pointV(o, ctx, PRI)


      // if (data[i + 1]) {
      //   ctx.beginPath()
      //   const [tx, ty] = data[i + 1].p.mul(UC)
      //   ctx.rect(x, y, tx - x, ty - y)
      //   ctx.stroke()
      // }

      ctx.save()
      ctx.beginPath()
      ctx.arc(ox, oy, magV(o, p), arcMeasure(o, p), arcMeasure(o, p) + PI / 2)
      ctx.stroke()
      ctx.restore()
    }
  }

  draw = ts => {
    const {ctx, HALF_WIDTH, HALF_HEIGHT, WIDTH, HEIGHT, run} = this
    ctx.strokeStyle = PRI
    ctx.fillRect(-HALF_WIDTH, -HALF_HEIGHT, WIDTH, HEIGHT)
    this.drawAxes()
    this.squares()
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
