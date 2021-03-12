import '../common/global.js'
import Base from '../common/Base.js'
import M from '../common/M.js'
import V, {vec} from '../common/V.js'
import Particle from './Particle.js'
import {joinV, pointV} from '../common/utils.js'
import {PRI} from '../common/style.js'

class Attractor {
  ctx = null
  pos = vec()
  color = PRI
  force = 1

  constructor(ctx, pos, HW, HH) {
    Object.assign(this, {ctx, pos, HW, HH})
  }

  attract(p) {
    const {pos, HW, HH} = this,
      f = pos.sub(p.pos)
    f.mag = sqrt(f.mag)
    p.applyForce(f)
  }

  draw() {
    const {ctx, pos, color, force} = this
    pointV(pos, ctx, color, abs(force))
  }
}

class App extends Base {
  mouse = vec()
  attractors = []

  constructor(canvas) {
    super(canvas)
    this.T = new M()
    this.setupDimensions()
    this.setup()
  }

  setupListeners = () => {
    this.canvas.addEventListener('click', ({offsetX, offsetY}) => {
      const {HW, HH} = this
      const a = new Attractor(
        this.ctx,
        vec(offsetX - HW, -offsetY + HH),
        HW,
        HH
      )
      a.force = rand(-25, 25)
      this.attractors.push(a)
    })
  }

  setup() {
    this.setupListeners()
    const {ctx, HW, HH} = this
    this.attractors = [new Attractor(ctx, V.rand(-HW, HW, -HH, HH), HW, HH)]
    for (let a of this.attractors) {
      a.force = rand(0, 15)
    }
    this.particle = new Particle(ctx, HW, HH)
    this.particle.mass = 10
    this.particle.vel = V.rand(-1, 1, -1, 1)
  }

  setupDimensions() {
    super.setupDimensions()
    const {ctx, HW, HH, W, H} = this
    ctx.setTransform(1, 0, 0, -1, HW, HH)
    // ctx.fillRect(-HW, HH, W, -H)
  }

  draw = () => {
    requestAnimationFrame(this.draw)
    const {ctx, HW, HH, W, H, attractors} = this
    ctx.fillRect(-HW, HH, W, -H)
    for (let a of attractors) {
      a.draw()
      a.attract(this.particle)
    }
    this.particle.draw()
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
