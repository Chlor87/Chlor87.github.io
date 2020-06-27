const {min, max, PI} = Math

export const TWO_PI = 2 * PI,
  HALF_PI = PI / 2,
  norm = (n, min, max) => (n - min) / (max - min),
  lerp = (n, min, max) => n * (max - min) + min,
  map = (n, min1, max1, min2, max2) => lerp(norm(n, min1, max1), min2, max2),
  clamp = (n, from, to) => max(min(n, to), from)