export const sort = data => data.sort((a, b) => a - b)

export const range = data => {
  const sorted = sort(data)
  return sorted[sorted.length - 1] - sorted[0]
}

export const midRange = data => {
  const sorted = sort(data)
  return (sorted[0] + sorted[sorted.length - 1]) / 2
}

export const sum = data => {
  const n = data.length
  let x = 0
  for (let i = 0; i < n; i++) {
    x += data[i]
  }
  return x
}

export const mean = data => sum(data) / data.length

export const median = data => {
  const n = data.length,
    sorted = sort(data)
  return n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.round(n / 2) - 1]
}

export const quartiles = data => {
  const n = data.length,
    sorted = sort(data)
  return [
    median(sorted.slice(0, n / 2)),
    median(sorted.slice(n % 2 === 0 ? n / 2 : n / 2 + 1))
  ]
}

export const iqr = data => {
  const [l, r] = quartiles(data)
  return r - l
}

export const MAD = data => {
  const u = mean(data),
    n = data.length
  let x = 0
  for (let i = 0; i < data.length; i++) {
    x += abs(data[i] - u)
  }
  return x / n
}

const variance = (data, divisor, calculatedMean) => {
  const u = calculatedMean || mean(data),
    n = data.length
  let hypot = 0
  for (let i = 0; i < n; i++) {
    hypot += (data[i] - u) ** 2
  }
  return hypot / divisor
}

export const varUnbiased = (data, mean) => variance(data, data.length - 1, mean)
export const varBiased = (data, mean) => variance(data, data.length, mean)

export const stdevUnbiased = (data, mean) =>
  Math.sqrt(variance(data, data.length - 1, mean))
export const stdevBiased = (data, mean) =>
  Math.sqrt(variance(data, data.length, mean))
export const stdev = stdevUnbiased

export const correlationCoefficient = (xs, ys, ctx = {}) => {
  const {length} = xs,
    xMean = ctx?.xMean ?? mean(xs),
    yMean = ctx?.yMean ?? mean(ys),
    xStdev = ctx?.xStdev ?? stdev(xs, xMean),
    yStdev = ctx?.yStdev ?? stdev(ys, yMean)

  ctx.xMean = xMean
  ctx.yMean = yMean
  ctx.xStdev = xStdev

  let cc = 0

  for (let i = 0; i < length; i++) {
    cc += ((xs[i] - xMean) / xStdev) * ((ys[i] - yMean) / yStdev)
  }
  return cc / (length - 1)
}

export const splitXY = data => {
  const xs = [],
    ys = []
  for (let i = 0; i < data.length; i++) {
    xs[i] = data[i][0]
    ys[i] = data[i][1]
  }
  return [xs, ys]
}

export const linReg = (data, ctx = {}) => {
  void ([ctx.xs, ctx.ys] = splitXY(data))
  ctx.xMean = mean(ctx.xs)
  ctx.yMean = mean(ctx.ys)
  ctx.xStdev = stdev(ctx.xs, ctx.xMean)
  ctx.yStdev = stdev(ctx.ys, ctx.yMean)
  ctx.r = correlationCoefficient(ctx.xs, ctx.ys, ctx)
  const m = ctx.r * (ctx.yStdev / ctx.xStdev),
    b = -(m * ctx.xMean) + ctx.yMean
  return [x => m * x + b, m, b]
}

export const rSquared = (data, ctx = {}) => {
  const [fn] = linReg(data, ctx)
  let seLine = 0,
    seTotal = 0
  for (let i = 0; i < data.length; i++) {
    const [x, y] = data[i]
    seLine += (y - fn(x)) ** 2
    seTotal += (y - ctx.yMean) ** 2
  }

  return 1 - seLine / seTotal
}
