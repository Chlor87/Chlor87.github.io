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

  constructor({ctx, pos, dir, fov, world, HW, HH}) {
    Object.assign(this, {ctx, pos, rot: dir, fov, world})
    for (let i = 0; i < fov; i++) {
      this.rays[i] = new Ray({
        ctx,
        pos,
        dir,
        world,
        HW,
        HH,
        offset: (i - fov / 2).rad,
        rot: dir
      })
    }
  }

  applyAcc(f) {
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

    this.rotVel = 0
    this.vel = 0

    this.rotAcc = 0
    this.acc = 0

    for (let ray of this.rays) {
      ray.pos = this.pos
      ray.dir = this.rot
    }
  }

  draw() {
    const {rays} = this
    this.update()
    for (let i = 0; i < rays.length; i++) {
      if (i % 3 === 0) {
        rays[i].draw()
      }
    }
  }
}
