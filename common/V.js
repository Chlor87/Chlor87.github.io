import {normalizeAngle} from './utils.js'
import M from './M.js'

const {isView} = ArrayBuffer
export default class V extends Float32Array {
  constructor(...args) {
    super(2)
    switch (args.length) {
      case 1:
        super.set(args[0])
        break
      case 2:
        super.set(args)
        break
    }
  }

  set(...args) {
    super.set(args.length === 1 ? args[0] : args)
  }

  get x() {
    return this[0]
  }

  set x(x) {
    this[0] = x
  }

  get y() {
    return this[1]
  }

  set y(y) {
    this[1] = y
  }

  get n() {
    const v = new V(this)
    v[0] *= -1
    v[1] *= -1
    return v
  }

  add(rhs) {
    const v = new V(this)
    if (isView(rhs)) {
      v[0] += rhs[0]
      v[1] += rhs[1]
    } else {
      v[0] += rhs
      v[1] += rhs
    }
    return v
  }

  sub(rhs) {
    const v = new V(this)
    if (isView(rhs)) {
      v[0] -= rhs[0]
      v[1] -= rhs[1]
    } else {
      v[0] -= rhs
      v[1] -= rhs
    }
    return v
  }

  mul(scalar) {
    const v = new V(this)
    v[0] *= scalar
    v[1] *= scalar
    return v
  }

  div(scalar) {
    const v = new V(this)
    v[0] /= scalar
    v[1] /= scalar
    return v
  }

  dot(rhs) {
    return this[0] * rhs[0] + this[1] * rhs[1]
  }

  lerp(rhs, i) {
    return this.mul(1 - i).add(rhs.mul(i))
  }

  round() {
    this.x = round(this.x)
    this.y = round(this.y)
    return this
  }

  get mag() {
    return hypot(this[0], this[1])
  }

  get dir() {
    return normalizeAngle(atan2(this[1], this[0]))
  }

  translate(x, y) {
    return new M().translate(x, y).mul(this)
  }

  scale(x, y) {
    return new M().scale(x, y).mul(this)
  }

  rotate(theta) {
    return new M().rotate(theta).mul(this)
  }

  norm() {
    const {mag} = this
    return mag != 0 ? new V(this).div(this.mag) : this
  }

  limit(scalar) {
    const v = new V(this)
    return this.mag <= scalar ? v : v.norm().mul(scalar)
  }
}
