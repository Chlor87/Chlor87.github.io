import './global.js'
import V from './V.js'

const I = new Float32Array(9)
I[0] = 1
I[4] = 1
I[8] = 1

export default class M extends Float32Array {
  constructor(...args) {
    super(9)
    switch (args.length) {
      case 0:
        this.set(I)
        break
      case 1:
        this.set(args[0])
        break
      case 9:
        this.set(args)
        break
    }
  }

  add(rhs) {
    const m = new M(this)
    return rhs instanceof Float32Array ? m.addMatrix(rhs) : m.addScalar(rhs)
  }

  addScalar(rhs) {
    for (let i = 0; i < this.length; i++) {
      this[i] += rhs
    }
    return this
  }

  addMatrix(rhs) {
    for (let i = 0; i < this.length; i++) {
      this[i] = rhs[i]
    }
    return this
  }

  mul(rhs) {
    const m = new M(this)
    if (rhs instanceof Number) {
      return m.mulScalar(rhs)
    } else if (rhs instanceof V) {
      return m.mulVec(rhs)
    } else if (rhs instanceof M) {
      return m.mulMatrix(rhs)
    }
  }

  mulScalar(rhs) {
    for (let i = 0; i < this.length; i++) {
      this[i] *= rhs
    }
    return this
  }

  // prettier-ignore
  mulVec(rhs) {
    const [
      a, b, c,
      d, e, f,
      g, h, i
    ] = this,
    [
      x,
      y,
      z
    ] = rhs
    return new V(
      a * x + b * y + c * z,
      d * x + e * y + f * z,
      g * x + h * y + i * z
    )
  }

  // prettier-ignore
  mulMatrix(rhs) {
    const [
      aa, ab, ac,
      ad, ae, af,
      ag, ah, ai
    ] = this,
    [
      ba, bb, bc,
      bd, be, bf,
      bg, bh, bi
    ] = rhs

    this[0] = aa * ba + ab * bd + ac * bg
    this[1] = aa * bb + ab * be + ac * bh
    this[2] = aa * bc + ab * bf + ac * bi

    this[3] = ad * ba + ae * bd + af * bg
    this[4] = ad * bb + ae * be + af * bh
    this[5] = ad * bc + ae * bf + af * bi

    this[6] = ag * ba + ah * bd + ai * bg
    this[7] = ag * bb + ah * be + ai * bh
    this[8] = ag * bc + ah * bf + ai * bi

    return this
  }

  translate(x, y) {
    const m = new M()
    m[2] = x
    m[5] = y
    return m.mul(this)
  }

  rotate(θ) {
    const m = new M(),
      c = Math.cos(θ),
      s = Math.sin(θ)

    m[0] = c
    m[1] = -s
    m[3] = s
    m[4] = c
    return m.mul(this)
  }

  scale(x, y) {
    const m = new M()
    m[0] = x
    m[4] = y
    return m.mul(this)
  }

  shear(x, y) {
    const m = new M()
    m[1] = x
    m[3] = y
    return m.mul(this)
  }

  // prettier-ignore
  /**
   * compute the determinant using faster method, without calculating
   * subdeterminants
   */
  get det() {
    const [
  //  +  -  +
      a, b, c, // a, b
      d, e, f, // d, e
      g, h, i  // g  h
    ] = this
    return a * e * i + b * f * g + c * d * h - (g * e * c + h * f * a + i * d * b)
  }

  get transpose() {
    const m = new M(this),
      [, b, c, d, , f, g, h] = this
    m[1] = d
    m[2] = g
    m[3] = b
    m[5] = h
    m[6] = c
    m[7] = f
    return m
  }

  // prettier-ignore
  get minors() {
    const [
      a, b, c,
      d, e, f,
      g, h, i
    ] = this
    return new M(
      det2(e, f, h, i), det2(d, f, g, i), det2(d, e, g, h),
      det2(b, c, h, i), det2(a, c, g, i), det2(a, b, g, h),
      det2(b, c, e, f), det2(a, c, d, f), det2(a, b, d, e)
    )
  }

  // prettier-ignore
  // checkerboard pattern inverse
  // + - +
  // - + -
  // + - +
  get cofactor() {
    const m = new M(this)
    m[1] *= -1
    m[3] *= -1
    m[5] *= -1
    m[7] *= -1
    return m
  }

  // prettier-ignore
  get inverse() {
    let det = this.det
    if (det === 0) {
      return null
    }
    det = 1/det

    // transposed cofactor of matrix of minors
    const adjugate = this.minors.cofactor.transpose  
    return new M(
      det * adjugate[0], det * adjugate[1], det * adjugate[2],
      det * adjugate[3], det * adjugate[4], det * adjugate[5],
      det * adjugate[6], det * adjugate[7], det * adjugate[8]
    )
  }

  // prettier-ignore
  toString() {
    const [a, b, c, d, e, f, g, h, i] = this
    return `| ${a} ${b} ${c} |
| ${d} ${e} ${f} |
| ${g} ${h} ${i} |
`
  }
}

// prettier-ignore
const det2 = (
  a, b,
  c, d
) =>  a * d - c * b
