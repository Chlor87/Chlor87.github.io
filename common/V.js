export default class V extends Float32Array {
  constructor(...args) {
    super(3)
    switch (args.length) {
      case 1:
        this.set(args[0])
        break
      case 3:
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

  mul(rhs) {
    const v = new V(this)
    if (rhs instanceof Float32Array) {
      v[0] *= rhs[0]
      v[1] *= rhs[1]
    } else {
      v[0] *= rhs
      v[1] *= rhs
    }
    return v
  }

  div(rhs) {
    const v = new V(this)
    if (rhs instanceof Float32Array) {
      throw new Error('not implemented')
    } else {
      v[0] /= rhs
      v[1] /= rhs
    }
    return v
  }

  lerp(rhs, i) {
    return this.mul(1 - i).add(rhs.mul(i))
  }

  get mag() {
    return hypot(this[0], this[1])
  }
}
