import {joinV, pointV} from './utils.js'


const proxyBody = {
  get(self, k) {
    switch (k) {
      case 'joinV':
        return (a, b, c) => joinV(a, b, self, c)
      case 'pointV':
      case 'drawV':
        return (a, ...rest) => globalThis[k](a, self, ...rest)
    }
    return typeof self[k] === 'function' ? self[k].bind(self) : self[k]
  },
  set(self, k, v) {
    self[k] = v
    return true
  }
}

export default ctx => new Proxy(ctx, proxyBody)
