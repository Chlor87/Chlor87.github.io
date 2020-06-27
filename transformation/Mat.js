import Vec from "./Vec.js"

export default class Mat {
  /**
   * @description 2x2 only
   */
  constructor(a, b, c, d) {
    this.a = a
    this.b = b
    this.c = c
    this.d = d
  }

  mul(vecOrScalar) {
    switch (typeof vecOrScalar) {
      case 'number':
        const cp = Object.create(this)
        cp.a *= vecOrScalar
        cp.b *= vecOrScalar
        cp.c *= vecOrScalar
        cp.d *= vecOrScalar
        return cp
      default:
        return new Vec(
          this.a * vecOrScalar.x + this.b * vecOrScalar.y,
          this.c * vecOrScalar.x + this.d * vecOrScalar.y,
          vecOrScalar.ctx,
          vecOrScalar.color,
        )
    }
  }

}