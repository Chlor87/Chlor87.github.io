import {sleep, getColor} from './utils.js'
import FieldEditor from './FieldEditor.js'

const {PI, sin, cos, max, round} = Math

const WIDTH = document.documentElement.clientWidth,
  HEIGHT = document.documentElement.clientHeight,
  HALF_WIDTH = round(WIDTH / 2),
  HALF_HEIGHT = round(HEIGHT / 2),
  TWO_PI = 2 * PI

class App {

  constructor(canvas) {
    this.canvas = canvas
    this.fe = new FieldEditor(new Map([
      ['UC', {type: Number, value: 400}],
      ['SPOKES', {type: Number, value: 24}],
      ['STEP', {type: Number, value: 0.05}],
      ['DRAW_SPOKES', {type: Boolean, value: false}],
      ['DRAW_UNIT_CIRCLE', {type: Boolean, value: false}],
      ['DRAW_AXES', {type: Boolean, value: true}],

    ]))
    this.fe.run()
    canvas.width = canvas.style.width = WIDTH
    canvas.height = canvas.style.height = HEIGHT
    this.ctx = this.canvas.getContext('2d')
    this.ctx.setTransform(1, 0, 0, -1, HALF_WIDTH, HALF_HEIGHT)
    this.i = 0
  }

  async run() {
    while (true) {
      requestAnimationFrame(this.draw)
      await sleep(1e3 / 60)
    }
  }

  drawAxes = () => {
    const {ctx} = this
    ctx.beginPath()
    ctx.moveTo(-HALF_WIDTH, 0)
    ctx.lineTo(HALF_WIDTH, 0)
    ctx.moveTo(0, -HALF_HEIGHT)
    ctx.lineTo(0, HALF_HEIGHT)
    ctx.closePath()
    ctx.stroke()
  }

  drawUnitCircle = () => {
    const {ctx, fe} = this,
      UC = fe.get('UC')
    ctx.beginPath()
    ctx.arc(0, 0, UC, 0, TWO_PI)
    ctx.closePath()
    ctx.stroke()
  }

  drawPoints = () => {
    const {ctx, fe} = this,
      UC = fe.get('UC'),
      SPOKES = fe.get('SPOKES'),
      STEP = fe.get('STEP')
    this.i = max(this.i + STEP, TWO_PI)
    for (let i = 1; i <= SPOKES; i++) {
      const radialOffset = PI / SPOKES * i,
        x = cos(this.i + radialOffset) * UC,
        theta = TWO_PI / SPOKES * i

      ctx.save()
      ctx.fillStyle = getColor(theta)
      ctx.rotate(radialOffset)
      ctx.beginPath()
      ctx.arc(x, 0, 10, 0, TWO_PI)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }
  }

  drawSpokes = () => {
    const {ctx, fe} = this,
      UC = fe.get('UC'),
      SPOKES = fe.get('SPOKES')
    for (let i = 1; i <= SPOKES; i++) {
      const radialOffset = PI / SPOKES * i,
        x = round(cos(radialOffset) * UC),
        y = round(sin(radialOffset) * UC)
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(-x, -y)
      ctx.closePath()
      ctx.stroke()
    }
  }

  draw = () => {
    const {ctx, fe} = this,
      DRAW_SPOKES = fe.get('DRAW_SPOKES'),
      DRAW_UNIT_CIRCLE = fe.get('DRAW_UNIT_CIRCLE'),
      DRAW_AXES = fe.get('DRAW_AXES')

    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, WIDTH, HEIGHT)
    ctx.restore()
    ctx.strokeStyle = '#666'
    ctx.lineWidth = 2
    DRAW_AXES && this.drawAxes()
    DRAW_SPOKES && this.drawSpokes()
    DRAW_UNIT_CIRCLE && this.drawUnitCircle()
    this.drawPoints()
  }
}

void (() => {
  addEventListener('DOMContentLoaded', () => {
    const app = new App(document.querySelector('#canvas'))
    app.run()
  })
})()
