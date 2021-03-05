import '../common/global.js'
import {PRI, YELLOW} from '../common/style.js'
import Base from '../common/Base.js'
import V from '../common/V.js'
import M from '../common/M.js'
import C from '../common/C.js'
import {joinV, map, pointV, zToColor} from '../common/utils.js'

const hash = ([re, im]) => `${re}${im}`

const memo = fn => {
  const cache = new Map()
  return (...args) => {
    const k = hash(args[0])
    if (cache.has(k)) {
      return cache.get(k)
    }
    const res = fn(...args)
    cache.set(k, res)
    return res
  }
}

const mandel = memo((z, x1, x2, y1, y2) => {
  let Z = new C(0, 0),
    c = z.map(x1, x2, -2, 2, y1, y2, -2, 2)
  for (let i = 0; i < 20; i++) {
    Z = Z.pow(5).add(c)
    if (Z.mag > 2) {
      // break
      return null
    }
  }
  return Z
})

const sine = ([re, im]) => new C(sin(re) * cos(im), cos(re) * sin(im)),
  cosine = ([re, im]) => new C(cos(re) * cosh(im), -sin(re) * sinh(im))

class App extends Base {
  i = 0
  dir = 1
  numPoints = +localStorage.getItem('numPoints') || 10

  constructor(canvas) {
    super(canvas)
    this.setupDimensions()
    this.$numPoints = document.querySelector('#num-points')
    this.$numPoints.min = 2
    this.$numPoints.max = 150
    this.$numPoints.value = this.numPoints
    this.$numPoints.addEventListener('input', ({target: {value}}) => {
      this.numPoints = value
      this.src.numPoints = value
      this.dst.numPoints = value
      localStorage.setItem('numPoints', value)
      requestAnimationFrame(this.draw)
    })
  }

  setupDimensions() {
    super.setupDimensions()
    const {ctx, HW, HH, W, H, numPoints} = this
    ctx.setTransform(1, 0, 0, -1, HW, HH)
    this.src = new Plane(ctx, new V(HW / 2, HH), HW, H, numPoints, (...args) =>
      rcosine(mandel(...args))
    )
    this.dst = new Plane(
      ctx,
      new V(HW, HH),
      W,
      H,
      numPoints,
      (z, i, ...rest) => {
        const res = cosine(z)
        // return cosine(z)
        return mandel(z.mul(i), ...rest)
      }
    )
  }

  draw = ts => {
    const {ctx, HW, HH, W, H, UC} = this
    ctx.fillRect(-HW, -HH, W, H)
    ctx.strokeStyle = PRI
    this.i += 0.01 * this.dir
    if (this.i > 1 || this.i < 0) {
      this.dir *= -1
      // this.i = 0
    }
    // this.src.draw()
    this.dst.draw(this.i)
    requestAnimationFrame(this.draw)
  }
}

void (() => {
  addEventListener('DOMContentLoaded', () => {
    const app = new App(document.querySelector('#canvas'))
    requestAnimationFrame(app.draw)
    addEventListener(
      'resize',
      () => {
        app.setupDimensions()
        app.draw()
      },
      {passive: true}
    )
  })
})()

class Plane {
  constructor(ctx, origin, W, H, numPoints, f) {
    this.ctx = ctx
    this.o = origin
    this.W = W
    this.H = H
    this.HW = W / 2
    this.HH = H / 2
    this.f = f
    this.numPoints = numPoints
    this.max = hypot(this.HW, this.HH)
  }

  drawAxes = () => {
    const {ctx, W, H} = this
    ctx.lineWidth = 1
    joinV(new V(-W / 2, 0), new V(W / 2, 0), ctx, YELLOW)
    joinV(new V(0, H / 2), new V(0, -H / 2), ctx, YELLOW)
  }

  drawPoints = i => {
    /**
     * @todo use min and max like a normal person
     */
    const {ctx, W, H, HW, HH, numPoints, max} = this,
      xN = W > H ? numPoints * (W / H) : numPoints,
      yN = H > W ? numPoints * (H / W) : numPoints,
      hXN = xN / 2,
      hYN = yN / 2,
      xOffset = HW % (W / xN),
      yOffset = HH % (H / yN)

    for (let x = -hXN; x < hXN; x++) {
      for (let y = -hYN; y < hYN; y++) {
        const offset = new C(xOffset, yOffset),
          z1 = new C(x, y)
            .map(-hXN, hXN, -HW, HW, -hYN, hYN, -HH, HH)
            .add(offset),
          z2 = this.f(new C(x, y), i, -hXN, hXN, -hYN, hYN)
        if (
          z1.re <= -HW + 6 ||
          z1.re >= HW - 6 ||
          z1.im <= -HH + 6 ||
          z1.im >= HH - 6
        ) {
          continue
        }
        z2 && drawDir(z1, z2.dir, max, Math.max(W, H), Math.max(xN, yN), ctx)
      }
    }
  }

  drawMandelUC = () => {
    const {ctx, W, H} = this
    ctx.save()
    ctx.strokeStyle = YELLOW
    ctx.beginPath()
    ctx.ellipse(0, 0, W / 2, H / 2, 0, 0, TAU)
    ctx.stroke()
    ctx.restore()
  }

  draw(i) {
    const {ctx, o, W, H} = this
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, o.x, H / 2)
    ctx.lineWidth = 1
    ctx.strokeRect(-W / 2, -H / 2, W, H)
    // this.drawMandelUC()
    this.drawPoints(i)
    // this.drawAxes()
    ctx.restore()
  }
}

const drawDir = (z, theta, max, dim, numPoints, ctx) => {
  // pointV(z, ctx, zToColor(new C().fromPolar(norm(z.mag, 0, max), theta)), 10)
  // return
  joinV(
    z,
    new M()
      .translate(-z.re + map(z.dir, 0, max, 10, 20), -z.im)
      .rotate(theta)
      .translate(z.re, z.im)
      .mul(new V(z.re, z.im)),
    ctx,
    zToColor(new C(z).fromPolar(map(z.mag, 0, max, 0, 1), theta)),
    true
  )
}
