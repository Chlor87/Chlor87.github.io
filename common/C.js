import './global.js'
import {normalizeAngle} from './utils.js'

export default class C extends Float32Array {
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

  get mag() {
    return hypot(this[0], this[1])
  }

  get dir() {
    return normalizeAngle(atan2(this[1], this[0]))
  }

  get re() {
    return this[0]
  }

  set re(v) {
    this[0] = v
    return this
  }

  get im() {
    return this[1]
  }

  set im(v) {
    this[1] = v
    return this
  }

  get polar() {
    const z = new Float32Array(2)
    z[0] = this.mag
    z[1] = this.dir
    return z
  }

  // in place
  fromPolar(r, θ) {
    this[0] = r * cos(θ)
    this[1] = r * sin(θ)
    return this
  }

  map(a, b, c, d, e, f, g, h) {
    this.re = map(this.re, a, b, c, d)
    this.im = map(this.im, e, f, g, h)
    return this
  }

  add(rhs) {
    const z = new C(this)
    if (typeof rhs === 'number') {
      z[0] += rhs
      z[1] += rhs
    } else {
      z[0] += rhs[0]
      z[1] += rhs[1]
    }
    return z
  }

  sub(rhs) {
    const z = new C(this)
    if (typeof rhs === 'number') {
      z[0] -= rhs
      z[1] -= rhs
    } else {
      z[0] -= rhs[0]
      z[1] -= rhs[1]
    }
    return z
  }

  mul(rhs) {
    const z = new C(this)
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
    const z = new C(this)
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
    return new C().fromPolar(pow(r, n), θ * n)
  }

  rot(θ) {
    const cp = new C(this),
      {mag: r, dir: srcθ} = cp
    cp.fromPolar(r, θ + srcθ)
    return cp
  }
}
