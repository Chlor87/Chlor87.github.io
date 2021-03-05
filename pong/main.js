import '../common/global.js'
import Base from '../common/Base.js'
import M from '../common/M.js'
import V from '../common/V.js'
import {PRI, RED, SEC} from '../common/style.js'
import {pointV, norm, drawV} from '../common/utils.js'

class Point {
  constructor(pos, velocity, ctx, r) {
    this.ctx = ctx
    this.pos = pos
    this.r = r
    this.V = velocity
    const theta = this.pos.dir
    this.step = new V(cos(theta), sin(theta))
  }

  reflect(vertical) {
    if (vertical) {
      this.step.x = -this.step.x
    } else {
      this.step.y = -this.step.y
    }
  }

  render() {
    this.pos = this.pos.add(this.step.mul(this.V))
    pointV(this.pos, this.ctx, SEC, this.r)
  }
}

class Paddle {
  constructor(pos, velocity, boundingBox, ctx) {
    this.pos = pos
    this.V = velocity
    this.ctx = ctx
    this.boundingBox = boundingBox
  }

  move(v) {
    const {pos, V} = this
    this.pos = pos.add(v.mul(V))
  }

  render() {
    const {ctx, pos} = this
    ctx.save()
    ctx.beginPath()
    ctx.strokeStyle = SEC
    ctx.lineWidth = 20
    ctx.moveTo(pos.x, pos.y + 50)
    ctx.lineTo(pos.x, pos.y - 50)
    ctx.stroke()
    ctx.restore()
  }
}

class App extends Base {
  i = 0
  dir = 1
  startX = 0
  startY = 0
  isDragging = false
  scale = 1
  path = []

  constructor(canvas) {
    super(canvas)
    this.setupDimensions()
    this.T = new M()
    const theta = lerp(Math.random(), 0, 1, 0, TAU)
    this.P = new Point(new V(cos(theta), sin(theta)), 10, this.ctx, 10)
    this.paddles = [
      new Paddle(new V(-this.HW / 2 + 50, 0), 10, this.rectPath, this.ctx)
    ]

    addEventListener(
      'keydown',
      ({key}) => {
        const {
            paddles: [paddle]
          } = this,
          check = offset =>
            this.ctx.isPointInPath(
              this.rectPath,
              paddle.pos.x + this.HW,
              paddle.pos.y + this.HH + offset
            )

        switch (key) {
          case 'ArrowUp':
            check(50) && paddle.move(new V(0, 1))
            break
          case 'ArrowDown':
            check(-50) && paddle.move(new V(0, -1))
            break
        }
      },
      {
        passive: true
      }
    )
  }

  setupDimensions() {
    super.setupDimensions()
    const {ctx, HW, HH} = this
    ctx.setTransform(1, 0, 0, -1, HW, HH)
    this.UC = 0.5 * min(HW, HH)

    this.bounds = {
      a: new V(-HW / 2, HH / 2),
      b: new V(HW / 2, -HH / 2)
    }
    this.rectPath = new Path2D()
    this.rectPath.rect(...this.bounds.a, ...this.bounds.b.mul(2))
  }

  detectCollisions = () => {
    let {
      bounds: {a, b},
      P,
      P: {pos},
      paddles: [{pos: paddle}]
    } = this

    if (pos.x - P.r < a.x || pos.x + P.r > b.x) {
      P.reflect(true)
      // this.path.push(new V(pos))
    } else if (pos.y + P.r > a.y || pos.y - P.r < b.y) {
      P.reflect(false)
      // this.path.push(new V(pos))
    } else if (pos.x - P.r < paddle.x + 10 && pos.y > paddle.y - 50 && pos.y < paddle.y + 50) {
      P.reflect(true)
    }
  }

  drawRect = () => {
    const {ctx, rectPath} = this
    ctx.fillStyle = PRI
    ctx.stroke(rectPath)
  }

  drawPath = () => {
    const {ctx, path, P} = this,
      {length} = path
    if (length < 1) {
      return
    }
    ctx.save()
    ctx.beginPath()
    ctx.strokeStyle = PRI
    for (let i = 0; i < length; i++) {
      ctx.lineTo(...path[i])
    }
    ctx.lineTo(...P.pos)
    ctx.stroke()
    for (let i = 0; i < length; i++) {
      ctx.beginPath()
      ctx.arc(...path[i], 3, 0, TAU)
      ctx.fill()
    }
    ctx.restore()
  }

  draw = ts => {
    const {ctx, HW, HH, W, H} = this
    ctx.save()
    ctx.fillStyle = '#000'
    ctx.fillRect(-HW, -HH, W, H)
    ctx.restore()
    ctx.strokeStyle = SEC
    this.drawRect()
    // this.drawPath()
    this.P.render()
    this.paddles[0].render()
    this.detectCollisions()
    requestAnimationFrame(this.draw)
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
      },
      {passive: true}
    )
  })
})()
