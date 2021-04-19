import '../common/global.js'
import Base from '../common/Base.js'
import {BLACK, BLUE, GREEN, RED, SEC} from '../common/style.js'
import {joinV} from '../common/utils.js'
import {fromPolar, vec} from '../common/V.js'
import Particle from './Particle.js'

const getXY = (i, a) => vec(i % a, floor(i / a))

const nTiles = 15
const world = Array.from({length: nTiles ** 2}, (_, i, self) => {
    const [x, y] = getXY(i, nTiles)
    return x === 0 || x === nTiles - 1 || y === 0 || y === nTiles - 1
      ? 1
      : random() > 0.9
      ? 1
      : 0
  }),
  toIdx = ([x, y], nTiles) => floor(abs(x)) + floor(abs(y)) * nTiles

class App extends Base {
  fov = 60
  nRays = 240 * 2
  constructor(canvas) {
    super(canvas)
    this.setupDimensions()
    this.setup()
  }

  setup() {
    this.setupDimensions()
    const {H, HH, HW, W} = this,
      pos = vec(-HW, -HH / 2),
      size = vec(HH / 2, -HH / 2),
      center = pos.mul(2).add(size).div(2)
    this.map = {pos, size, nTiles}
    this.map.tileSize = this.map.size.div(nTiles)
    this.map.screenSize = this.map.pos.add(this.map.size)
    this.p = new Particle({
      pos: center,
      r: 5,
      mass: 75,
      color: GREEN,
      world,
      map: this.map
    })
    this.p.bindCtrl()
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

      ctx.fillStyle = world[i] === 1 ? RED : BLUE
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
      theta = normalizeAngle(-dir - offset),
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
      posY = pos.add(scaleY)

    while (!((seenX && lenY >= lenX) || (seenY && lenX >= lenY))) {
      if (
        world[toIdx(vec(dirX === 1 ? posX.x : posX.x - 1, posX.y), nTiles)] ===
        1
      ) {
        seenX = true
      }

      if (
        world[toIdx(vec(posY.x, dirY === 1 ? posY.y : posY.y - 1), nTiles)] ===
        1
      ) {
        seenY = true
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

    return {dist: res, dir: res === lenX ? 0 : 1, offset}
  }

  cast() {
    const {nRays, fov} = this,
      rays = []

    for (let i = 0; i < nRays; i++) {
      const offset = map(i, 0, nRays, -fov / 2, fov / 2).rad,
        res = this.dda(offset)
      rays.push(res)
    }
    return rays.reverse()
  }

  drawRays = rays => {
    const {
      ctx,
      p,
      map: {tileSize}
    } = this
    for (let i = 0; i < rays.length; i++) {
      const {dist, offset} = rays[i]
      joinV(p, p.add(fromPolar(dist, p.dir + offset).mul(tileSize.x)), ctx, SEC)
    }
  }

  drawView = rays => {
    const {ctx, W, HW, H, HH, nRays} = this,
      segW = W / nRays

    ctx.save()
    ctx.fillStyle = '#0088ff'
    ctx.fillRect(-HW, HH, W, -H)
    ctx.fillStyle = '#222'
    ctx.fillRect(-HW, 0, W, -HH)

    ctx.fillStyle = RED

    for (let i = 0; i < rays.length; i++) {
      const {dist, dir, offset} = rays[i],
        h = map(clamp(dist * cos(offset), 0, nTiles), 0, nTiles, H, 0)
      if (h < 0) {
        return
      }
      ctx.fillStyle = dir === 0 ? RED : '#aa0000'
      ctx.fillRect(-HW + i * segW, HH - (H - h) / 2, segW + 1, -h)
    }
    ctx.restore()
  }

  draw = () => {
    const {ctx, HW, HH, W, H, drawWorld, drawAxes, drawRays} = this
    ctx.fillRect(-HW, HH, W, -H)
    ctx.strokeStyle = SEC
    const rays = this.cast()
    this.drawView(rays)
    drawWorld()
    drawRays(rays)
    this.p.draw(ctx)

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
