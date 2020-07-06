import Mat from './Mat.js'
import Vec from './Vec.js'
import {TWO_PI, map} from './utils.js'
import {PRI, SEC} from './style.js'

const {round, floor} = Math
let UC = 200,
  WIDTH, HEIGHT, HALF_HEIGHT, HALF_WIDTH

window.sampleSize = 250

function* bubbleSort(arr) {
  const {length} = arr
  for (let i = 0; i < length; i++) {
    for (let j = 0; j < length; j++) {
      if (arr[j] > arr[j + 1]) {
        const tmp = arr[j]
        arr[j] = arr[j + 1]
        arr[j + 1] = tmp
        yield [arr.slice(0), i, j]
      }
    }
  }
  return yield [arr, 0, length - 1]
}

const getArray = n => Array.from({length: n}).map((_, i) => ++i),
  // Fisher-Yates shuffle
  shuffle = arr => {
    let len = arr.length
    while (len) {
      const i = Math.floor(Math.random() * len--),
        tmp = arr[len]
      arr[len] = arr[i]
      arr[i] = tmp
    }
    return arr
  },
  sleep = n => new Promise(resolve => setTimeout(resolve, n))

class App {

  constructor(canvas) {
    this.canvas = canvas
    const ctx = this.ctx = this.canvas.getContext('2d')
    this.setupDimensions()
    this.i = 0
    this.dir = 1
  }

  setupDimensions() {
    const {canvas, ctx} = this
    WIDTH = document.documentElement.clientWidth
    HEIGHT = document.documentElement.clientHeight
    HALF_WIDTH = round(WIDTH / 2)
    HALF_HEIGHT = round(HEIGHT / 2)
    canvas.width = canvas.style.width = WIDTH
    canvas.height = canvas.style.height = HEIGHT
    this.ctx.setTransform(1, 0, 0, -1, 0, HEIGHT)
    this.axes = {
      x1: new Vec(-HALF_WIDTH, 0, 0, ctx, SEC),
      x2: new Vec(HALF_WIDTH, 0, 0, ctx, SEC),
      y1: new Vec(0, -HALF_HEIGHT, 0, ctx, SEC),
      y2: new Vec(0, HALF_HEIGHT, 0, ctx, SEC)
    }

    this.square = [
      new Vec(0, 0, 1, ctx, '#00ff00'),
      new Vec(UC, 0, 1, ctx, '#00ff00'),
      new Vec(UC, UC, 1, ctx, '#00ff00'),
      new Vec(0, UC, 1, ctx, '#00ff00'),
    ]
  }

  drawAxes() {
    const {axes: {x1, x2, y1, y2}} = this
    x1.to(x2)
    y1.to(y2)
  }

  async drawBubbleSort() {
    const {ctx} = this,
      arr = shuffle(getArray(sampleSize))

    ctx.lineWidth = WIDTH / sampleSize - 3
    for (let [next, i, j] of bubbleSort(arr)) {
      this.clear()
      for (let [k, e] of next.entries()) {
        const color = (k === i || k === j) ? '#ff00ff' : PRI,
          x = map(k, 0, sampleSize, 25, WIDTH - 25),
          v1 = new Vec(x, 25, 1, ctx, color),
          v2 = new Vec(x, map(e, 0, sampleSize, 25, HEIGHT - 25), 1, ctx, color)
        v1.to(v2)

      }
      await sleep(1)
    }
  }

  clear = () => {
    const {ctx} = this
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.fillRect(0, 0, WIDTH, HEIGHT)
    ctx.restore()
  }

  draw = async () => {
    const {ctx} = this
    ctx.fillStyle = '#000000'
    ctx.lineWidth = 2
    this.clear()
    // this.drawAxes()
    await this.drawBubbleSort()
  }

}

void (() => {
  addEventListener('DOMContentLoaded', () => {
    const app = new App(document.querySelector('#canvas'))
    app.draw()
    addEventListener('resize', () => {
      app.setupDimensions()
    }, {passive: true})
  })
})()
