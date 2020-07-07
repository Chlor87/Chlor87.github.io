import Vec from '../common/Vec.js'
import {PRI} from '../common/style.js'
import {map} from '../common/utils.js'
import Base from '../common/Base.js'
import {getArray, shuffle, bubbleSort} from './algos.js'

window.sampleSize = 250

class App extends Base {

  constructor(canvas) {
    super(canvas)
    this.arr = shuffle(getArray(sampleSize))
    this.bubbleGen = bubbleSort(this.arr, 5)
  }

  setupDimensions() {
    super.setupDimensions()
    this.ctx.setTransform(1, 0, 0, -1, 0, this.HEIGHT)
  }

  async drawBubbleSort() {
    const {ctx, WIDTH, HEIGHT, arr, bubbleGen} = this,
      {value, done} = bubbleGen.next(),
      barMargin = 2
    let i, j
    if (done) {
      ([i, j] = [0, arr.length - 1])
      this.run = false
    } else {
      ([i, j] = value)
    }
    ctx.lineWidth = WIDTH / sampleSize - barMargin

    for (let [k, e] of arr.entries()) {
      const color = (k === i || k === j) ? '#ff00ff' : PRI,
        x = map(k, 0, sampleSize, 25 + barMargin, WIDTH - 25 - barMargin),
        v1 = new Vec(x, 25, 1, ctx, color),
        v2 = new Vec(x, map(e, 0, sampleSize, 25, HEIGHT - 25), 1, ctx, color)
      v1.to(v2)
    }
  }

  clear = () => {
    const {ctx, WIDTH, HEIGHT} = this
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
    await this.drawBubbleSort()
    requestAnimationFrame(this.draw)
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
