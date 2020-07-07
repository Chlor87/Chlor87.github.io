import Vec from "./Vec.js"

export default class Mat {
  /**
   * @description 2x2 only
   */
  constructor(a, b, c, d, e, f, g, h, i) {
    Object.assign(this, {a, b, c, d, e, f, g, h, i})
  }

  mul(rhs) {
    switch (true) {
      case typeof rhs === 'number': {
        const cp = Object.create(this)
        cp.a *= rhs
        cp.b *= rhs
        cp.c *= rhs
        cp.d *= rhs
        cp.e *= rhs
        cp.f *= rhs
        cp.g *= rhs
        cp.h *= rhs
        cp.i *= rhs
        return cp
      }
      case rhs instanceof Vec: {
        const cp = Object.create(rhs),
          {x, y, z} = rhs,
          {a, b, c, d, e, f, g, h, i} = this
        cp.x = a * x + b * y + c * z
        cp.y = d * x + e * y + f * z
        cp.z = g * x + h * y + i * z
        return cp
      }
      case rhs instanceof Mat: {
        const cp = Object.create(this),
          {
            a: aa, b: ab, c: ac,
            d: ad, e: ae, f: af,
            g: ag, h: ah, i: ai
          } = this,
          {
            a: ba, b: bb, c: bc,
            d: bd, e: be, f: bf,
            g: bg, h: bh, i: bi
          } = rhs
        // aaba, abbd, acbg
        // aabb, abbe, acbh
        // aabc, abbf, acbi
        // adba, aebd, afbg
        // adbb, aebe, afbh
        // adbc, aebf, afbi
        // agba, ahbd, aibg
        // agbb, ahbe, aibh
        // agbc, ahbf, aibi
        cp.a = aa * ba + ab * bd + ac * bg
        cp.b = aa * bb + ab * be + ac * bh
        cp.c = aa * bc + ab * bf + ac * bi
        cp.d = ad * ba + ae * bd + af * bg
        cp.e = ad * bb + ae * be + af * bh
        cp.f = ad * bc + ae * bf + af * bi
        cp.g = ag * ba + ah * bd + ai * bg
        cp.h = ag * bb + ah * be + ai * bh
        cp.i = ag * bc + ah * bf + ai * bi
        return cp
      }
    }
  }

}