import '../common/global.js'
import {PRI} from '../common/style.js'
import Base from '../common/Base.js'
import C from '../common/C.js'
import {pointV, zToColor} from '../common/utils.js'
import M from '../common/M.js'
import V from '../common/V.js'

const mandel = (xy, max) => {
  let z = new C(0, 0),
    c = xy,
    diverges = false,
    i = 0

  for (; i < max; i++) {
    z = z.pow(2).add(c)
    if (z.mag > 2) {
      diverges = true
      break
    }
  }
  return diverges
    ? new C().fromPolar(1, map(i, 0, max, 0, TAU)).rot((3 / 2) * PI)
    : z
}

const zeta = (s, max) => {
  let Z = new C()
  for (let i = 1; i < max; i++) {
    const next = Z.add(cmplxDiv(1, cmplxPow(i, s)))
    if (Z.re === next.re && Z.im === next.im) {
      break 
    }
    Z = next
  }
  return Z
}

class App extends Base {
  i = 1
  dir = 1
  constructor(canvas) {
    super(canvas)
    this.setupDimensions()
  }

  setupDimensions() {
    super.setupDimensions()
    const {ctx, HW, HH} = this
    ctx.setTransform(1, 0, 0, -1, HW, HH)
  }

  draw = () => {
    const {ctx, HW, HH, W, H} = this,
      ratio = HW / HH,
      size = 2,
      xDist = size * ratio,
      dist = hypot(2, xDist)

    ctx.fillRect(-HW, HH, W, -H)
    ctx.strokeStyle = PRI

    const imageData = new ImageData(W, H)

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4,
          xx = map(x, 0, W, -xDist, xDist),
          yy = map(y, H, 0, -size, size),
          z = new C(xx, yy),
          res = mandel(z, 20),
          [r, g, b, a] = zToColor(
            res.fromPolar(norm(res.mag, 0, dist), res.dir)
          )

        imageData.data[i + 0] = r
        imageData.data[i + 1] = g
        imageData.data[i + 2] = b
        imageData.data[i + 3] = a
      }
      // ctx.putImageData(imageData, 0, 0)
    }

    ctx.putImageData(imageData, 0, 0)

    // requestAnimationFrame(this.draw)
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

const drawDir = (z, theta, max, ctx) => {
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
    // PRI,
    zToColor(new C(z).fromPolar(map(z.mag, 0, max, 0, 1), theta)),
    true
  )
}
