import './global.js'
import {normalizeAngle} from './utils.js'

export default class Cmplx extends Float64Array {
  constructor(...args) {
    super(2)
    switch (args.length) {
      case 1:
        this.set(args[0])
        break
      case 2:
        this.set(args)
        break
    }
  }

  get r() {
    return hypot(this[0], this[1])
  }

  get θ() {
    return normalizeAngle(atan2(this[1], this[0]))
  }

  get re() {
    return this[0]
  }

  get im() {
    return this[1]
  }

  get polar() {
    const z = new Float64Array(2)
    z[0] = this.r
    z[1] = this.θ
    return z
  }

  // in place
  fromPolar(r, θ) {
    this[0] = r * cos(θ)
    this[1] = r * sin(θ)
    return this
  }

  add(rhs) {
    const z = new Cmplx(this)
    if (typeof rhs === 'number') {
      z[0] += rhs
      z[1] += rhs
    } else {
      z[0] += rhs[0]
      z[1] += rhs[1]
    }
    return z
  }

  mul(rhs) {
    const z = new Cmplx(this)
    if (typeof rhs === 'number') {
      z[0] *= rhs
      z[1] *= rhs
    } else {
      const [r1, θ1] = this.polar,
        [r2, θ2] = rhs.polar
      z.fromPolar(r1 * r2, θ1 + θ2)
    }
    return z
  }

  div(rhs) {
    const z = new Cmplx(this)
    if (typeof rhs === 'number') {
      z[0] /= rhs
      z[1] /= rhs
    } else {
      const [a, bi] = z,
        [c, di] = rhs,
        div = c ** 2 + di ** 2
      z[0] = (a * c + bi * di) / div
      z[1] = (-(a * di) + bi * c) / div
    }
    return z
  }

  pow(n) {
    const [r, θ] = this.polar
    return new Cmplx().fromPolar(pow(r, n), θ * n)
  }
}

console.log(new Cmplx(2, 2).div(new Cmplx(2, 2)))
