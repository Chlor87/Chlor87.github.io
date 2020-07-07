// assign all Math symbols to global namespace
Object.getOwnPropertyNames(Math).forEach(k => globalThis[k] = Math[k])
globalThis.TWO_PI = PI * 2