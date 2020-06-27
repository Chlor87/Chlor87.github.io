export default class Mat extends Array {
  constructor(data) {
    super(data.length)
    if (!Array.isArray(data)) {
      return
    }
    data.forEach((r, i) => this[i] = r.slice(0))
  }

  /**
   * @private
   * @param {} scalarOrMat 
   * @param {*} op
   * @todo remove instance check from the loop
   */
  add(scalarOrMat) {
    for (let [i, j] of this.iter()) {
      this[i][j] += (scalarOrMat instanceof Mat) ? scalarOrMat[i][j] : scalarOrMat
    }
    return this
  }

  mul(scalarOrMat) {
    if (Array.isArray(scalarOrMat)) {
      const res = []
      for (let i of this.keys()) {
        res[i] = []
        for (let j of scalarOrMat[0].keys()) {
          let sum = 0
          for (let k of this[0].keys()) {
            sum += this[i][k] * scalarOrMat[k][j]
          }
          res[i][j] = sum
        }
      }
      return new Mat(res)
    } else {
      for (let [i, j] of this.iter()) {
        this[i][j] *= scalarOrMat
      }
      return this
    }
  }

  *iter() {
    for (let i of this.keys()) {
      for (let j of this[i].keys()) {
        yield [i, j]
      }
    }
  }

  toString() {
    let res = []
    for (let i of this.values()) {
      res.push(i.map(e => String(e).padStart(2, ' ')).join(' '))
    }
    return res.join('\n')
  }

}

