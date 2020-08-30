const {min, max, PI} = Math
import V from './V.js'
import M from './M.js'

export const TAU = 2 * PI,
  HALF_PI = PI / 2,
  norm = (n, min, max) => (n - min) / (max - min),
  lerp = (n, min, max) => n * (max - min) + min,
  map = (n, min1, max1, min2, max2) => lerp(norm(n, min1, max1), min2, max2),
  clamp = (n, from, to) => max(min(n, to), from)

export const drawV = ([x, y], ctx, color) => {
  ctx.save()
  ctx.strokeStyle = color
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(x, y)
  ctx.closePath()
  ctx.stroke()
  // drawArrow(0, 0, x, y, ctx, color)
  ctx.restore()
}

export const pointV = ([x, y], ctx, color, r = 3) => {
  ctx.save()
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, r, 0, TAU)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

const drawArrow = (x1, y1, x2, y2, ctx, color) => {
  const triangle = [new V(0, 0), new V(-12, 8), new V(-12, -8)],
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

export const magV = ([x1, y1], [x2, y2]) => hypot(x2 - x1, y2 - y1)

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
