import '../common/global.js'
import V from '../common/V.js'
import {PRI} from '../common/style.js'
import {map, joinV} from '../common/utils.js'
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
    this.ctx.setTransform(1, 0, 0, -1, 0, this.H)
  }

  async drawBubbleSort() {
    const {ctx, W, H, arr, bubbleGen} = this,
      {value, done} = bubbleGen.next(),
      barMargin = 2
    let i, j
    if (done) {
      ([i, j] = [0, arr.length - 1])
      this.run = false
    } else {
      ([i, j] = value)
    }
    ctx.lineW = W / sampleSize - barMargin

    for (let [k, e] of arr.entries()) {
      const color = (k === i || k === j) ? '#ff00ff' : PRI,
        x = map(k, 0, sampleSize, 25 + barMargin, W - 25 - barMargin),
        v1 = new V(x, 25),
        v2 = new V(x, map(e, 0, sampleSize, 25, H - 25))
      joinV(v1, v2, ctx, color, false)
    }
  }

  clear = () => {
    const {ctx, W, H} = this
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.fillRect(0, 0, W, H)
    ctx.restore()
  }

  draw = async () => {
    const {ctx} = this
    ctx.fillStyle = '#000000'
    ctx.lineW = 2
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
