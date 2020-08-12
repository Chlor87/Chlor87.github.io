import '../common/global.js'

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
    return atan2(this[1], this[0]) + (TWO_PI % TWO_PI)
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
    if (rhs instanceof Number) {
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
    if (rhs instanceof Number) {
      z[0] *= rhs
      z[1] *= rhs
    } else {
      const [r1, θ1] = this.polar,
        [r2, θ2] = rhs.polar
      z.fromPolar(r1 * r2, θ1 + θ2)
    }
    return z
  }

  pow(n) {
    const [r, θ] = this.polar
    return new Cmplx().fromPolar(pow(r, n), θ * n)
  }
}
