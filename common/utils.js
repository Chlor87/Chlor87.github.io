const {min, max, PI, log, cos, sin} = Math
import V from './V.js'
import M from './M.js'
import {PRI} from './style.js'
import C from './C.js'

export const TAU = 2 * PI,
  HALF_PI = PI / 2,
  norm = (n, min, max) => (n - min) / (max - min),
  lerp = (n, min, max) => n * (max - min) + min,
  map = (n, min1, max1, min2, max2) => lerp(norm(n, min1, max1), min2, max2),
  clamp = (n, from, to) => max(min(n, to), from),
  rand = (min, max) => lerp(random(), min, max)

export const drawV = ([x, y], ctx, color = PRI) => {
  ctx.save()
  ctx.strokeStyle = color
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(x, y)
  ctx.closePath()
  ctx.stroke()
  drawArrow(0, 0, x, y, ctx, color)
  ctx.restore()
}

export const pointV = ([x, y], ctx, color, r = 5) => {
  ctx.save()
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, r, 0, TAU)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

const drawArrow = (x1, y1, x2, y2, ctx, color) => {
  const triangle = [new V(1, 0), new V(-8, 4), new V(-8, -4)],
    θ = normalizeAngle(atan2(y2 - y1, x2 - x1)),
    T = new M().rotate(θ).translate(x2, y2)
  triangle.push(triangle[0])

  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(triangle[0], triangle[1])
  for (let i = 0; i < triangle.length - 1; i++) {
    const [x2, y2] = T.mul(triangle[i + 1])
    ctx.lineTo(x2, y2)
  }
  ctx.closePath()
  ctx.fill()
}

export const normalizeAngle = a => (a + TAU) % TAU

export const arcMeasure = ([ox, oy], [x, y]) => {
  const dx = x - ox,
    dy = y - oy
  return normalizeAngle(atan2(dy, dx))
}

export const joinV = ([x1, y1], [x2, y2], ctx, color, arrow = false) => {
  ctx.save()
  ctx.strokeStyle = color
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.closePath()
  ctx.stroke()
  arrow && drawArrow(x1, y1, x2, y2, ctx, color)
  ctx.restore()
}

export const magV = (v1, v2) => hypot(v2.x - v1.x, v2.y - v1.y)

export const arc = ([x, y], a, b, r, ctx, color) => {
  ctx.save()
  ctx.lineWidth = 2
  ctx.strokeStyle = color
  ctx.beginPath()
  ctx.arc(x, y, r, a, b)
  ctx.stroke()
  ctx.restore()
}

export const text = ([x, y], text, ctx, color) => {
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.font = '16px sans'
  ctx.fillText(text, x, -y)
  ctx.restore()
}

export const defer = () => {
  const deferred = {},
    p = new Promise((resolve, reject) => {
      deferred.resolve = resolve
      deferred.reject = reject
    })
  deferred.promise = p
  return deferred
}

// format color component
const fcc = c =>
  round(c * 255)
    .toString(16)
    .padStart(2, '0')

// convert a complex number to color
export const zToColor = Z => {
  const H = Z.dir.deg,
    V = Z.mag === 0 ? 0 : 1,
    S = 1,
    C = V * S,
    X = C * (1 - abs(((H / 60) % 2) - 1)),
    m = V - C

  let R, G, B
  if (H < 60) {
    ;[R, G, B] = [C, X, 0]
  } else if (H < 120) {
    ;[R, G, B] = [X, C, 0]
  } else if (H < 180) {
    ;[R, G, B] = [0, C, X]
  } else if (H < 240) {
    ;[R, G, B] = [0, X, C]
  } else if (H < 300) {
    ;[R, G, B] = [X, 0, C]
  } else {
    ;[R, G, B] = [C, 0, X]
  }
  return [(R + m) * 255, (G + m) * 255, (B + m) * 255, 255]
}

export const cmplxPow = (a, z) => {
  const b = z.re,
    c = z.im,
    mul = a ** b,
    l = log(a)
  return new C(mul * cos(c * l), mul * sin(c * l))
}

export const cmplxDiv = (a, [b, c]) => {
  const divisor = b ** 2 + c ** 2
  return new C((a * b) / divisor, (a * c) / divisor)
}

const fib = n => {
  const PHI = (1 + sqrt(5)) / 2,
    phi = (1 - sqrt(5)) / 2
  return (PHI ** n - phi ** n) / sqrt(5)
}
