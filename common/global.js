// assign all Math symbols to global namespace
import * as utils from './utils.js'
Object.getOwnPropertyNames(Math).forEach(k => (globalThis[k] = Math[k]))
globalThis.TAU = PI * 2

Object.entries(utils).forEach(([k, v]) => {
  globalThis[k] = v
})

Object.defineProperties(Number.prototype, {
  deg: {
    get() {
      return (this * 180) / PI
    }
  },
  rad: {
    get() {
      return (this * PI) / 180
    }
  }
})

globalThis.cot = theta => 1 / tan(theta)
globalThis.sec = theta => 1 / cos(theta)
globalThis.csc = theta => 1 / sin(theta)

globalThis.PHI = (1 + sqrt(5)) / 2
