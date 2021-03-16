import {BLACK, GREEN, PRI} from '../common/style.js'
import {joinV, pointV} from '../common/utils.js'
import {fromPolar, vec} from '../common/V.js'
import {Circle} from './shapes.js'

const MAX_STEPS = 25

export default class Ray {
  pos = vec()
  vel = 0
  acc = 0

  dirAcc = 0
  dirVel = 0
  dir = 0

  constructor({ctx, pos, dir, world, HW, HH, offset, maxLength}) {
    Object.assign(this, {ctx, pos, dir, world, HW, HH, offset, maxLength})
  }

  march() {
    const {ctx, world, pos, dir, offset = 0, maxLength} = this,
      path = []

    let dist = 0,
      currPos = pos,
      color = [0, 0, 0]
    for (let i = 0; i < MAX_STEPS; i++) {
      let shapeDist = Infinity
      for (let shape of world) {
        const d = shape.distTo(currPos)
        if (d !== undefined) {
          if (d < shapeDist) {
            shapeDist = d
            color = shape.constructor === Circle ? [0, 255, 0] : [52, 235, 225]
          }
          shapeDist = min(shapeDist, d)
        }
      }
      path.push(new Circle(ctx, currPos, shapeDist, GREEN))
      dist += shapeDist
      currPos = fromPolar(dist, dir + offset).add(pos)
      if (dist <= 1 || dist > maxLength) {
        break
      }
    }

    return [dist, color, path]
  }

  draw() {
    const {ctx, pos, dir, offset} = this,
      [dist, color, path] = this.march()
    path.forEach(p => p.draw())
    joinV(pos, fromPolar(dist, dir + offset).add(pos), ctx, PRI)
    pointV(pos, ctx, PRI)
  }
}
