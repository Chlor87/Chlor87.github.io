import '../common/global.js'
import Base from '../common/Base.js'
import M from '../common/M.js'
import V from '../common/V.js'
import {pointV, rand, zToColor} from '../common/utils.js'

const randV = (minX, maxX, minY, maxY) =>
  new V(rand(minX, maxX), rand(minY, maxY))

class Particle {
  p = new V()
  v = new V()
  a = new V()
  m = 5

  constructor(ctx, HW, HH) {
    this.p = randV(-HW, HW, -HH, HH)
    this.v = randV(-1, 1, -1, 1)
    this.ctx = ctx
  }

  applyForce(f) {
    this.a = f.div(this.m / 100)
    this.c = `rgba(${zToColor(this.a).join(', ')})`
  }

  update() {
    this.v = this.v.add(this.a).limit(15)
    this.p = this.p.add(this.v)
    this.a.set(0, 0)
  }

  draw() {
    this.update()
    const {ctx, p, m, c} = this
    pointV(p, ctx, c, m)
  }
}

class App extends Base {
  mouse = new V()
  ps = []

  constructor(canvas) {
    super(canvas)
    this.T = new M()
    this.setupDimensions()
    this.setup()
    canvas.addEventListener(
      'mousemove',
      ({offsetX, offsetY}) => {
        this.mouse = new V(offsetX - this.HW, -offsetY + this.HH)
      },
      false
    )

    canvas.addEventListener('click', ({offsetX, offsetY}) => {
      this.mouse = new V(offsetX - this.HW, -offsetY + this.HH)
    })

    canvas.addEventListener('touchmove', e => {
      e.preventDefault()
      const {pageX, pageY} = e.touches[0]
      this.mouse = new V(pageX - this.HW, -pageY + this.HH)
    })
  }

  setup() {
    const MAX = 300
    this.setupDimensions()
    for (let i = 0; i < MAX; i++) {
      this.ps[i] = new Particle(this.ctx, this.HW, this.HH)
      this.ps[i].m = map(i, 0, MAX, 5, 25)
    }
  }

  setupDimensions() {
    super.setupDimensions()
    const {ctx, HW, HH} = this
    ctx.setTransform(1, 0, 0, -1, HW, HH)
  }

  draw = () => {
    const {ctx, HW, HH, W, H} = this
    ctx.fillRect(-HW, HH, W, -H)
    for (let p of this.ps) {
      p.applyForce(this.mouse.sub(p.p).norm().mul(0.1))
      p.draw()
    }
    requestAnimationFrame(this.draw)
  }
}

void (() => {
  addEventListener('DOMContentLoaded', () => {
    const app = (window.app = new App(document.querySelector('#canvas')))
    requestAnimationFrame(app.draw)
    addEventListener(
      'resize',
      () => {
        app.setupDimensions()
        // app.draw()
      },
      {passive: true}
    )
  })
})()
