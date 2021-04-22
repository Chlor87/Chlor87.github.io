import {joinV, normalizeAngle, pointV} from '../common/utils.js'
import V, {fromPolar} from '../common/V.js'

const TURN = PI / (360 * 3),
  listeners = {}

export default class Particle extends V {
  acc = 0
  vel = 0

  dirAcc = 0
  dirVel = 0
  dir = 0

  keyMap = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
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

  applyForce = F => (this.acc += F / this.mass)
  applyAngForce = F => (this.dirAcc += F)

  updateForces = () => {
    const {keyMap, applyForce, applyAngForce} = this
    for (let [k, v] of Object.entries(keyMap)) {
      if (!v) {
        continue
      }
      switch (k) {
        case 'ArrowUp':
          applyForce(this.map.tileSize.x / 3)
          break
        case 'ArrowDown':
          applyForce(-this.map.tileSize.x / 3)
          break
        case 'ArrowLeft':
          applyAngForce(TURN)
          break
        case 'ArrowRight':
          applyAngForce(-TURN)
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

  update() {
    this.updateForces()
    this.vel += this.acc
    this.dirVel += this.dirAcc
    this.dir = normalizeAngle(this.dir + this.dirVel)
    this.set(this.add(fromPolar(this.vel, this.dir)))
    this.collide()

    this.acc = 0
    this.dirAcc = 0
    this.vel *= 0.9
    this.dirVel *= 0.9
  }

  draw(ctx) {
    this.update()
    const {r, color} = this
    pointV(this, ctx, color, 4)
    joinV(this, this.add(fromPolar(r + 7, this.dir)), ctx, color, true)
  }
}
