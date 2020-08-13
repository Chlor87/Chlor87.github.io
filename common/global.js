// assign all Math symbols to global namespace
import * as utils from './utils.js'
Object.getOwnPropertyNames(Math).forEach(k => (globalThis[k] = Math[k]))
globalThis.TWO_PI = PI * 2

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
