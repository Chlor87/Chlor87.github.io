import '../common/global.js'
import Base from '../common/Base.js'
import Walker from './Walker.js'
import {fromDir, vec} from '../common/V.js'
import {pointV} from '../common/utils.js'
import {PRI} from '../common/style.js'

const keys = {
  ArrowUp: true,
  ArrowDown: true,
  ArrowLeft: true,
  ArrowRight: true
}

class App extends Base {
  keyMap = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
  }

  tail = []
  constructor(canvas) {
    super(canvas)
    this.setupDimensions()
    this.setup()
    addEventListener(
      'keydown',
      ({key}) => {
        if (keys[key]) {
          this.keyMap[key] = true
        }
        return
      },
      {passive: true}
    )

    addEventListener('keyup', ({key}) => {
      if (keys[key]) {
        this.keyMap[key] = false
      }
    })
  }

  setup() {
    this.setupDimensions()
    this.w = new Walker({ctx: this.ctx, pos: vec()})
  }

  setupDimensions() {
    super.setupDimensions()
    const {ctx, W, H, HW, HH} = this
    ctx.setTransform(1, 0, 0, -1, HW, HH)
    // ctx.fillRect(-HW, HH, W, -H)
  }

  draw = () => {
    const {ctx, HW, HH, W, H, w, keyMap, tail} = this
    ctx.fillRect(-HW, HH, W, -H)
    requestAnimationFrame(this.draw)
    for (let k of Object.keys(keyMap)) {
      if (!keyMap[k]) {
        continue
      }
      switch (k) {
        case 'ArrowUp':
          // w.applyAcc(2)
          break
        case 'ArrowDown':
          // w.applyAcc(-2)
          break
        case 'ArrowLeft':
          w.applyRotAcc(PI / 360)
          break
        case 'ArrowRight':
          w.applyRotAcc(-(PI / 360))
          break
      }
    }
    tail.push(w.pos)
    for (let i = 0; i < tail.length; i++) {
      pointV(tail[i], ctx, PRI)
    }
    this.tail = tail.slice(-500)
    w.applyAcc(.5)
    if (w.pos.x > HW || w.pos.x < -HW) {
      this.w.pos.x *= -1
    }
    if (w.pos.y > HH || w.pos.y < -HH) {
      this.w.pos.y *= -1
    }
    w.draw()
  }
}

void (() => {
  addEventListener('DOMContentLoaded', () => {
    const app = (window.app = new App(document.querySelector('#canvas')))
    requestAnimationFrame(app.draw)
    addEventListener(
      'resize',
      () => {
        app.setupDimensions()
      },
      {passive: true}
    )
  })
})()
