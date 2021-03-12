import {PRI, RED, SEC} from '../common/style.js'
import {joinV, pointV} from '../common/utils.js'
import V from '../common/V.js'

export default class Particle {
  pos = new V()
  vel = new V()
  acc = new V()
  mass = 5
  color = ''

  constructor(ctx, HW, HH) {
    this.pos = V.rand(-HW, HW, -HH, HH)
    this.vel = V.rand(-1, 1, -1, 1)
    this.ctx = ctx
  }

  applyForce(f) {
    const {mass, acc} = this
    this.acc = acc.add(f.div(mass * 10))
  }

  update() {
    this.vel = this.vel.add(this.acc)
    this.pos = this.pos.add(this.vel.limit(15))
    this.acc.set(0, 0)
  }

  draw() {
    this.update()
    const {ctx, pos, vel, mass} = this
      // color = `rgba(${zToColor(acc).join(', ')})`
    pointV(pos, ctx, SEC, mass)
    joinV(pos, vel.norm().mul(50).translate(pos.x, pos.y), ctx, RED, true)
  }
}
