import {SEC} from '../common/style.js'
import {joinV, normalizeAngle, pointV} from '../common/utils.js'
import V, {fromPolar, vec} from '../common/V.js'

const TURN = PI / (360 * 3),
  listeners = {}

export default class Particle extends V {
  acc = vec()
  vel = vec()

  dirAcc = 0
  dirVel = 0
  dir = 0

  keyMap = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    w: false,
    s: false,
    a: false,
    d: false
  }

  constructor({pos, dir = pos.dir, r, mass, color, world, map}) {
    super(pos)
    this.dir = dir
    Object.assign(this, {r, mass, color, world, map})
  }

  listener = v => ({key}) => {
    const {keyMap} = this
    if (keyMap.hasOwnProperty(key)) {
      keyMap[key] = v
    }
  }

  handleKeyDown = this.listener(true)
  handleKeyUp = this.listener(false)

  bindCtrl = () => {
    const {handleKeyDown, handleKeyUp} = this
    listeners.keyDown && removeEventListener('keydown', listeners.keyDown)
    listeners.keyUp && removeEventListener('keyup', listeners.keyUp)
    listeners.keyDown = handleKeyDown
    listeners.keyUp = handleKeyUp
    addEventListener('keydown', handleKeyDown)
    addEventListener('keyup', handleKeyUp)
  }

  applyForce = F => {
    this.acc = this.acc.add(F.div(this.mass)) /*  += F / this.mass */
  }
  applyAngForce = F => (this.dirAcc += F)

  updateForces = () => {
    const {keyMap, applyForce, applyAngForce} = this
    for (let [k, v] of Object.entries(keyMap)) {
      if (!v) {
        continue
      }
      switch (k) {
        case 'ArrowUp':
        case 'w':
          applyForce(fromPolar(this.map.tileSize.x / 3, this.dir))
          break
        case 'ArrowDown':
        case 's':
          applyForce(fromPolar(-this.map.tileSize.x / 3, this.dir))
          break
        case 'ArrowLeft':
          applyAngForce(TURN)
          break
        case 'ArrowRight':
          applyAngForce(-TURN)
          break
        case 'a':
          applyForce(fromPolar(this.map.tileSize.x / 3, this.dir + PI / 2))
          break
        case 'd':
          applyForce(fromPolar(this.map.tileSize.x / 3, this.dir - PI / 2))
          break
      }
    }
  }

  toWorldCoords = () => {
    const {
        map: {size, pos, nTiles}
      } = this,
      [x, y] = this
    return [
      map(x, pos.x, pos.x + size.x, 0, nTiles),
      map(y, pos.y, pos.y + size.y, 0, nTiles)
    ]
  }

  collide = () => {
    const {
        world,
        map: {pos, tileSize, nTiles}
      } = this,
      [pX, pY] = this.toWorldCoords(),
      intX = floor(pX),
      intY = floor(pY),
      r = this.r / tileSize.x,
      neighbors = []

    intX > 0 && neighbors.push([intX - 1, intY])
    intX < nTiles - 1 && neighbors.push([intX + 1, intY])
    intY > 0 && neighbors.push([intX, intY - 1])
    intY < nTiles - 1 && neighbors.push([intX, intY + 1])

    neighbors.forEach(([x, y]) => {
      if (world[x + y * nTiles] === 0) {
        return
      }
      if (y === intY) {
        pX < x && x - pX <= r && (this.x = pos.x + x * tileSize.x - this.r)
        pX > x &&
          pX - x - 1 <= r &&
          (this.x = pos.x + (x + 1) * tileSize.x + this.r)
      } else if (x === intX) {
        pY > y &&
          pY - y - 1 <= r &&
          (this.y = pos.y + (y + 1) * tileSize.y - this.r)
        pY < y && y - pY <= r && (this.y = pos.y + y * tileSize.y + this.r)
      }
    })
  }

  update(ctx) {
    this.updateForces()
    this.vel = this.vel.add(this.acc)
    this.dirVel += this.dirAcc
    this.dir = normalizeAngle(this.dir + this.dirVel)
    this.set(this.add(this.vel))
    // joinV(this, this.add(this.vel), ctx, SEC)
    this.collide()

    this.acc = vec()
    this.dirAcc = 0
    this.vel = this.vel.mul(0.9)
    this.dirVel *= 0.9
  }

  draw(ctx) {
    this.update(ctx)
    const {r, color} = this
    pointV(this, ctx, color, 4)
    joinV(this, this.add(fromPolar(r + 7, this.dir)), ctx, color, true)
  }
}
