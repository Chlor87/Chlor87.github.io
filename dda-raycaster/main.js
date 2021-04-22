import '../common/global.js'
import Base from '../common/Base.js'
import {BLACK, BLUE, GREEN, RED, SEC} from '../common/style.js'
import {arcMeasure, joinV, pointV, rand} from '../common/utils.js'
import {fromPolar, vec} from '../common/V.js'
import Particle from './Particle.js'

const getXY = (i, a) => vec(i % a, floor(i / a))

const nTiles = 15
const world = Array.from({length: nTiles ** 2}, (_, i, self) => {
    const [x, y] = getXY(i, nTiles)
    return x === 0 || x === nTiles - 1 || y === 0 || y === nTiles - 1
      ? (x + 1) % 2 === 0 || y % 2 !== 0
        ? 1
        : 2
      : x % 2 === 0 && y % 2 !== 0
      ? x % 4 === 0 || (y + 1) % 4 === 0
        ? 1
        : 2
      : 0
  }),
  toIdx = ([x, y], nTiles) => floor(abs(x)) + floor(abs(y)) * nTiles,
  colorMap = new Map([
    [1, [RED, '#aa0000']],
    [2, [GREEN, '#00aa00']]
  ])

class App extends Base {
  fov = 60
  nRays = 2
  constructor(canvas) {
    super(canvas)
    this.setupDimensions()
    this.setup()
  }

  setup() {
    this.setupDimensions()
    const {ctx, H, HH, HW, W} = this,
      pos = vec(-HW, -HH / 2),
      size = vec(HH / 2, -HH / 2),
      center = pos.mul(2).add(size).div(2)
    this.map = {pos, size, nTiles}
    this.map.tileSize = this.map.size.div(nTiles)
    this.map.screenSize = this.map.pos.add(this.map.size)
    this.p = new Particle({
      pos: pos.add(vec(this.map.tileSize.x, this.map.tileSize.y).mul(1.5)),
      dir: (3 * PI) / 2,
      r: 1,
      mass: 75,
      color: GREEN,
      world,
      map: this.map
    })
    this.nRays = this.W / 2
    this.p.bindCtrl()
    this.sky = ctx.createLinearGradient(0, HH, 0, 0)
    this.sky.addColorStop(0, '#004488')
    this.sky.addColorStop(1, '#0099ff')
    this.floor = '#222'
  }

  setupDimensions() {
    super.setupDimensions()
    const {ctx, HW, HH} = this
    ctx.setTransform(1, 0, 0, -1, HW, HH)
  }

  drawWorld = () => {
    const {
      ctx,
      p,
      map: {pos, size, tileSize, screenSize}
    } = this
    ctx.save()

    for (let i = 0; i < world.length; i++) {
      const [x, y] = getXY(i, nTiles),
        xx = pos.x + x * tileSize.x,
        yy = pos.y + y * tileSize.y

      ctx.fillStyle = world[i] === 0 ? BLUE : colorMap.get(world[i])[0]
      ctx.fillRect(xx, yy, tileSize.x, tileSize.y)
      if (y === nTiles - 1) {
        joinV(vec(xx, pos.y), vec(xx, screenSize.y), ctx, SEC)
      }
      if (x === nTiles - 1) {
        joinV(vec(pos.x, yy), vec(screenSize.x, yy), ctx, SEC)
      }
    }
    ctx.strokeStyle = BLACK
    ctx.lineWidth = 6
    ctx.strokeRect(pos.x + 2, pos.y - 2, size.x - 2, size.y + 2)
    ctx.restore()
  }

  dda = offset => {
    const {
        p,
        p: {dir},
        map: {
          screenSize: [sizeX, sizeY],
          pos: [mapX, mapY]
        }
      } = this,
      theta = normalizeAngle(-(dir + offset)),
      pos = vec(
        map(p.x, mapX, sizeX, 0, nTiles),
        map(p.y, mapY, sizeY, 0, nTiles)
      ),
      // unit vector
      uv = fromPolar(1, theta),
      dirX = theta >= (3 * PI) / 2 || theta < PI / 2 ? 1 : -1,
      dirY = theta >= 0 && theta < PI ? 1 : -1,
      dx = vec(1, uv.y / uv.x + Number.EPSILON).mul(dirX),
      dy = vec(uv.x / (uv.y + Number.EPSILON), 1).mul(dirY),
      lenDx = dx.mag,
      lenDy = dy.mag,
      fractX = dirX !== 1 ? fract(pos.x) : 1 - fract(pos.x),
      fractY = dirY !== 1 ? fract(pos.y) : 1 - fract(pos.y),
      scaleX = dx.scale(fractX, fractX),
      scaleY = dy.scale(fractY, fractY)

    let lenX = scaleX.mag,
      lenY = scaleY.mag,
      seenX = false,
      seenY = false,
      posX = pos.add(scaleX),
      posY = pos.add(scaleY),
      idxX = 0,
      idxY = 0

    while (!((seenX && lenY >= lenX) || (seenY && lenX >= lenY))) {
      const x = toIdx(vec(dirX === 1 ? posX.x : posX.x - 1, posX.y), nTiles),
        y = toIdx(vec(posY.x, dirY === 1 ? posY.y : posY.y - 1), nTiles)
      if (world[x] !== 0) {
        seenX = true
        idxX = x
      }
      if (world[y] !== 0) {
        seenY = true
        idxY = y
      }

      if (!seenX && posX) {
        posX = posX.add(dx)
        lenX += lenDx
      }
      if (!seenY && lenY <= lenX) {
        posY = posY.add(dy)
        lenY += lenDy
      }
    }
    const res = min(lenX, lenY)

    return {
      dist: res,
      dir: res === lenX ? 0 : 1,
      offset,
      color: world[res === lenX ? idxX : idxY]
    }
  }

  cast = () => {
    const {
        nRays,
        fov: FOV,
        p: {dir}
      } = this,
      rays = [],
      fov = FOV.rad,
      v1 = fromPolar(1, dir - fov / 2),
      v2 = fromPolar(1, dir + fov / 2),
      uv = fromPolar(magV(v1, v2) / FOV, arcMeasure(v1, v2))

    for (let i = nRays; i > 0; i--) {
      const v = v1.add(uv.mul(map(i, 0, nRays, 0, FOV)))
      rays.push(this.dda(v.dir - dir))
    }
    return rays
  }

  drawRays = rays => {
    const {
        ctx,
        p,
        map: {tileSize}
      } = this,
      longest = rays.reduce((p, {dist}) => max(p, dist), 0),
      grad = ctx.createLinearGradient(
        p.x,
        p.y,
        ...p.add(fromPolar(longest, p.dir).mul(tileSize.x))
      )
    grad.addColorStop(0, `rgba(255, 255, 255, .75)`)
    grad.addColorStop(1, `rgba(255, 255, 255, .5)`)
    ctx.save()
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)

    for (let i = 0; i < rays.length; i++) {
      const {dist, offset} = rays[i]
      ctx.lineTo(...p.add(fromPolar(dist, p.dir + offset).mul(tileSize.x)))
    }
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  drawView = rays => {
    const {ctx, W, HW, H, HH, nRays} = this,
      segW = W / nRays

    ctx.save()
    ctx.fillStyle = this.sky
    ctx.fillRect(-HW, HH, W, -H)
    ctx.fillStyle = this.floor
    ctx.fillRect(-HW, 0, W, -HH)

    ctx.fillStyle = RED

    for (let i = 0; i < rays.length; i++) {
      const {dist, dir, offset, color} = rays[i],
        h = clamp(H / (dist * cos(offset)), 1, H - 1)
      if (h < 0) {
        return
      }
      ctx.fillStyle = colorMap.get(color)[dir]
      ctx.fillRect(-HW + i * segW, h / 2, segW + 1, -h)
    }
    ctx.restore()
  }

  draw = () => {
    const {ctx, HW, HH, W, H, drawWorld, drawRays, drawView, cast, p} = this
    ctx.fillRect(-HW, HH, W, -H)
    ctx.strokeStyle = SEC
    const rays = cast()
    drawView(rays)
    drawWorld()
    drawRays(rays)
    p.draw(ctx)

    requestAnimationFrame(this.draw)
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
      },
      {passive: true}
    )
  })
})()
