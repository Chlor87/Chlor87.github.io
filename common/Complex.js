const inspect = Symbol.for('nodejs.util.inspect.custom'),
  {hypot} = Math

export default class Complex {

  constructor(real, imag, ctx, color) {
    this.re = real
    this.im = imag
    this.ctx = ctx
    this.color = color
  }

  get copy() {
    const cp = Object.create(this)
    Object.assign(cp, this)
    return cp
  }

  add(other) {
    const {copy} = this
    if (typeof other === 'number') {
      copy.re += other
    } else if (other instanceof Complex) {
      copy.re += other.re
      copy.im += other.im
    }
    return copy
  }

  mul(other) {
    const {copy} = this
    if (typeof other === 'number') {
      copy.re *= other
      copy.im *= other
    } else if (other instanceof Complex) {
      const {re: a, im: bi} = copy,
        {re: c, im: di} = other
      copy.re = a * c - bi * di
      copy.im = a * di + c * bi
    }
    return copy
  }

  div(other) {
    const {copy} = this
    if (typeof other === 'number') {
      copy.re /= other
      copy.im /= other
    } else if (other instanceof Complex) {
      const {re: a, im: bi} = copy,
        {re: c, im: di} = other,
        cc = c ** 2,
        dd = di ** 2
      copy.re = (a * c + bi * di) / (cc + dd)
      copy.im = (-(a * di) + c * bi) / (cc + dd)
    }
    return copy
  }

  draw() {
    const {ctx, re, im, color} = this
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(re, im, 5, 0, Math.PI * 2)
    ctx.closePath()
    ctx.fill()
  }

  get mag() {
    const {re, im} = this
    return hypot(re, im)
  }

  [inspect]() {
    const {re, im} = this
    return `${re ? `${re} ` : ''}${im ? im >= 0 ? '+ ' : '- ' : ''}${im ? Math.abs(im) + 'i' : ''}`
  }

}

console.log(new Complex(1, 2).div(new Complex(3, 4)))