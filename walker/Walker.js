import {PRI} from '../common/style.js'
import {pointV} from '../common/utils.js'
import {fromDir, fromPolar, vec} from '../common/V.js'

export default class Walker {
  pos = vec()
  vel = 0
  acc = 0

  rot = 0
  rotVel = 0
  rotAcc = 0

  constructor({ctx, pos}) {
    Object.assign(this, {ctx, pos})
  }

  applyAcc(f) {
    this.acc += f
  }

  applyRotAcc(f) {
    this.rotAcc += f
  }

  update() {
    this.rotVel = clamp(this.rotVel + this.rotAcc, -.1, .1)
    this.rot += this.rotVel

    this.vel = clamp(this.vel + this.acc, -5, 5)
    this.pos = this.pos.add(fromPolar(this.vel, this.rot))

    this.acc = 0
    this.rotAcc = 0
    this.vel *= 0.9
    this.rotVel *= 0.9
  }

  draw() {
    this.update()
    const {ctx, pos} = this
    pointV(pos, ctx, PRI)
    joinV(pos, fromPolar(this.vel, this.rot).mul(5).add(pos), ctx, PRI, true)
  }
}
