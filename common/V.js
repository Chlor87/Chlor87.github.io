export default class V extends Float32Array {
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

  add(rhs) {
    const v = new V(this)
    if (rhs instanceof Float32Array) {
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
    if (rhs instanceof Float32Array) {
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

  lerp(rhs, i) {
    return this.mul(1 - i).add(rhs.mul(i))
  }

  get mag() {
    return hypot(this[0], this[1])
  }
}
