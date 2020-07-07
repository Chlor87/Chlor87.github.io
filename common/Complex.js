import '../common/global.js'
const inspect = Symbol.for('nodejs.util.inspect.custom')

export default class Complex {
  constructor(re, im) {
    Object.assign(this, {re, im})
  }

  add(other) {
    const cp = Object.create(this)
    switch (true) {
      case typeof other === 'number':
        cp.re += other
        break
      case other instanceof Complex:
        cp.re += other.re
        cp.im += other.im
    }
    return cp
  }

  get mag() {
    return hypot(this.re, this.im)
  }

  get dir() {
    return (TWO_PI + atan2(this.im, this.re)) % TWO_PI
  }

  get polar() {
    return [this.mag, this.dir]
  }

  fromPolar(m, t) {
    this.re = m * cos(t)
    this.im = m * sin(t)
    return this
  }

  mul(other) {
    const cp = Object.create(this)
    switch (true) {
      case typeof other === 'number':
        this.re *= other
        this.im *= other
        break
      case other instanceof Complex:
        const [m1, t1] = this.polar,
          [m2, t2] = other.polar
        cp.fromPolar(m1 * m2, t1 + t2)
        break
    }
    return cp
  }

  pow(n) {
    const cp = Object.create(this),
      [m, t] = cp.polar
    return cp.fromPolar(pow(m, n), t * n)
  }

  inspect() {
    return 'dupa'
  }
}
