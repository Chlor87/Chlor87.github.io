const {PI, cos, abs, round} = Math

export const sleep = n => new Promise(resolve => setTimeout(resolve, n))
export const getColor = theta => {
  theta *= 180 / PI
  const r = abs(round(255 * cos(theta + 60))),
    g = abs(round(255 * cos(theta + 180))),
    b = abs(round(255 * cos(theta - 180)))
  return `#${(r << 16 | g << 8 | b).toString(16)}`
}

export const linearConversion = (x, a1, a2, b1, b2) => (((x - a1) / (a2 - a1)) * (b2 - b1)) + b1