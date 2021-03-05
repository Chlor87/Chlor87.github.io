import M from '../common/M.js'
import V from '../common/V.js'
onmessage = ({
  data: {
    id,
    payload: {
      vectors: [a, b, c, d, e, f, g, h],
      matrix
    }
  }
}) => {
  matrix = new M(matrix)
  postMessage({
    id,
    payload: [
      matrix.mul(new V(a)),
      matrix.mul(new V(b)),
      matrix.mul(new V(c)),
      matrix.mul(new V(d)),
      matrix.mul(new V(e)),
      matrix.mul(new V(f)),
      matrix.mul(new V(g)),
      matrix.mul(new V(h))
    ]
  })
}
