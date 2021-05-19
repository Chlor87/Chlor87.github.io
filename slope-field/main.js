import '../common/global.js'
import Base from '../common/Base.js'
import {joinV, pointV, text} from '../common/utils.js'
import {fromPolar, vec} from '../common/V.js'
import {RED, SEC} from '../common/style.js'

const nTiles = 12

class App extends Base {
  fn = (x, y) => y / x

  constructor(canvas) {
    super(canvas)
    this.setupDimensions()
    this.setup()
  }

  setup() {
    this.setupDimensions()
    const {HW, HH} = this
    this.ratio = HH / HW
    this.tileSize = min(HW, HH) / nTiles
  }

  setupDimensions() {
    super.setupDimensions()
    const {ctx, HW, HH} = this
    ctx.setTransform(1, 0, 0, -1, HW, HH)
  }

  setFn(fn) {
    this.fn = fn
    requestAnimationFrame(this.draw)
  }

  drawAxes = () => {
    const {ctx, HW, HH} = this
    joinV(vec(-HW, 0), vec(HW, 0), ctx, SEC)
    joinV(vec(0, HH), vec(0, -HH), ctx, SEC)
  }

  drawGrid = () => {
    const {ctx, HW, HH, H, W, ratio, tileSize} = this,
      xSpan = nTiles / ratio,
      color = '#777',
      font = '11pt ubuntu',
      fontColor = '#aaa'
    for (let x = -HW + (HW % tileSize); x <= HW; x += tileSize) {
      joinV(vec(x, HH), vec(x, -HH), ctx, color)
      const label = round(map(x, -HW, HW, -xSpan, xSpan))
      if (label !== 0) {
        text(vec(x + HW + 10, -H / 2 - 18), label, ctx, fontColor, font)
      }
    }

    for (let y = -HH + (HH % tileSize); y < HH; y += tileSize) {
      joinV(vec(-HW, y), vec(HW, y), ctx, color)
      const label = round(map(y, -HH, HH, -nTiles, nTiles))
      if (label !== 0) {
        text(vec(HW - 10, y - HH), label, ctx, fontColor, font)
      }
    }
  }

  drawField = fn => {
    const {tileSize, HW, HH, ctx} = this,
      xSpan = HW / tileSize,
      ySpan = HH / tileSize

    for (let x = -floor(xSpan); x <= xSpan; x++) {
      for (let y = -floor(ySpan); y <= ySpan; y++) {
        const dir = atan(fn(x, y)),
          v = vec(
            map(x, -xSpan, xSpan, -HW, HW),
            map(y, -ySpan, ySpan, -HH, HH)
          ),
          a = fromPolar(tileSize / 2, dir - PI)
        joinV(
          v.sub(a),
          v.add(a),
          ctx,
          `rgba(${zToColor(fromPolar(1, (dir + PI) % PI)).join(',')})`
        )
      }
    }
  }

  draw = () => {
    const {ctx, HW, HH, W, H, drawAxes, drawGrid} = this
    ctx.fillRect(-HW, HH, W, -H)
    drawGrid()
    // drawAxes()
    this.drawField(this.fn)
    // requestAnimationFrame(this.draw)
  }
}

void (() => {
  addEventListener('DOMContentLoaded', () => {
    const app = (window.app = new App(document.querySelector('#canvas')))
    requestAnimationFrame(app.draw)
    addEventListener(
      'resize',
      () => {
        app.setup()
        requestAnimationFrame(app.draw)
      },
      {passive: true}
    )
  })
})()
