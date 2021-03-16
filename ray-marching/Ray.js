import {GREEN, PRI, RED} from '../common/style.js'
import {circleV, joinV, pointV} from '../common/utils.js'
import {fromDir, fromPolar, vec} from '../common/V.js'
import {Circle, Line} from './shapes.js'

const MAX_STEPS = 25

const circleDist = (a, b, br) => abs(magV(a, b) - br)

export default class Ray {
  pos = vec()
  vel = 0
  acc = 0

  dirAcc = 0
  dirVel = 0
  dir = 0

  constructor({ctx, pos, dir, world, HW, HH, offset}) {
    Object.assign(this, {ctx, pos, dir, world, HW, HH, offset})
    this.setMaxLength()
  }

  march() {
    const {ctx, world, pos, dir, offset = 0, MAX_LENGTH} = this,
      path = []

    let dist = 0,
      currPos = pos
    for (let i = 0; i < MAX_STEPS; i++) {
      let shapeDist = Infinity
      for (let shape of world) {
        const d = shape.distTo(currPos)
        if (d !== undefined) {
          shapeDist = min(shapeDist, d)
        }
      }
      path.push(new Circle(ctx, currPos, shapeDist, GREEN))
      dist += shapeDist
      currPos = fromPolar(dist, dir + offset).add(pos)
      if (dist <= 1 || dist > MAX_LENGTH) {
        break
      }
    }

    return [dist, path]
  }

  setMaxLength = () => {
    const {pos, HW, HH} = this
    this.MAX_LENGTH = hypot(
      max(abs(pos.x + HW), abs(pos.x - HW)),
      max(abs(pos.y + HH), abs(pos.y - HH))
    )
  }

  applyAcc = f => {
    this.acc += f
    this.setMaxLength()
  }

  applyAngAcc = f => {
    this.dirAcc += f
    this.setMaxLength()
  }

  update() {
    this.vel += this.acc
    this.dirVel += clamp(this.dirAcc, -0.5, 0.5)

    this.dir += this.dirVel

    this.pos = this.pos.add(fromPolar(this.vel, this.dir))

    this.vel *= 0
    this.dirVel = 0

    this.acc = 0
    this.dirAcc = 0
  }

  draw() {
    const {ctx, pos, dir, offset} = this,
      [dist, path] = this.march()
    // this.update()
    pointV(pos, ctx, PRI)
    path.forEach(p => p.draw())
    joinV(pos, fromPolar(dist, dir + offset).add(pos), ctx, PRI)
  }
}
