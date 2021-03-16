import {RED} from '../common/style.js'
import {fromPolar, vec} from '../common/V.js'
import Ray from './Ray.js'

export default class Camera {
  acc = 0
  vel = 0
  pos = vec()

  rotAcc = 0
  rotVel = 0
  rot = 0

  rays = []

  constructor({ctx, pos, dir, fov, world, HW, HH, maxLength}) {
    Object.assign(this, {ctx, pos, rot: dir, fov, world, HW, HH})
    this.numSteps = 2
    const div = fov / 2,
      upper = (fov - 1) * this.numSteps
    for (let i = 0; i < fov * this.numSteps; i++) {
      this.rays[i] = new Ray({
        ctx,
        pos,
        dir,
        world,
        HW,
        HH,
        offset: map(i, 0, upper, -div, div).rad,
        rot: dir,
        maxLength
      })
    }
  }

  applyAcc(f) {
    const s = sign(f)
    if (this.getDist(s) + f <= 5 * f * s) {
      return
    }
    this.acc += f
  }

  applyAngAcc(f) {
    this.rotAcc += f
  }

  update() {
    this.rotVel += this.rotAcc
    this.rot += this.rotVel

    this.vel += this.acc

    this.pos = this.pos.add(fromPolar(this.vel, this.rot))

    this.rotVel *= 0.1
    this.vel *= 0.1

    this.rotAcc = 0
    this.acc = 0

    for (let ray of this.rays) {
      ray.pos = this.pos
      ray.dir = this.rot
    }
  }

  getDist(dir) {
    const {rays, numSteps} = this
    let minDist = Infinity
    for (let i = 0; i < rays.length; i += numSteps * 2) {
      const ray = rays[i]
      if (dir === -1) {
        ray.dir += PI
      }
      minDist = min(minDist, ray.march()[0])
      if (dir === -1) {
        ray.dir -= PI
      }
    }
    return minDist
  }

  draw() {
    const {rays, numSteps} = this
    this.update()
    for (let i = 0; i < rays.length; i++) {
      if (i % (3 * numSteps) === 0) {
        rays[i].draw()
      }
    }
  }
}
