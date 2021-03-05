import '../common/global.js'
import {PRI} from '../common/style.js'
import Base from '../common/Base.js'
import M from '../common/M.js'

import WorkerDispatcher from '../common/WorkerDispatcher.js'

class App extends Base {
  i = 0

  constructor(canvas) {
    super(canvas)
    this.setupDimensions()
    this.T = new M()
  }

  setupDimensions() {
    super.setupDimensions()
    const {ctx, HW: HALF_WIDTH, HH: HALF_HEIGHT} = this
    ctx.setTransform(1, 0, 0, -1, HALF_WIDTH, HALF_HEIGHT)
    this.UC = 0.5 * min(HALF_WIDTH, HALF_HEIGHT)
  }

  draw = ts => {
    const {ctx, HW, HH, W, H} = this
    ctx.fillRect(-HW, -HH, W, H)
    ctx.strokeStyle = PRI
    ctx.fillStyle = PRI
    ctx.lineWidth = 2
    requestAnimationFrame(this.draw)
  }
}

void (async () => {
  const wd = new WorkerDispatcher()
  wd.register('test', './worker.js', 5)

  console.log(
    await Promise.all(
      Array.from({length: 10}).map(() => wd.send('test', {data: 'abc'}))
    )
  )

  // addEventListener('DOMContentLoaded', () => {
  //   const app = new App(document.querySelector('#canvas'))
  //   requestAnimationFrame(app.draw)
  //   addEventListener(
  //     'resize',
  //     () => {
  //       app.setupDimensions()
  //     },
  //     {passive: true}
  //   )
  // })
})()
