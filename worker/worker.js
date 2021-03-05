import M from '../common/M.js'

onmessage = ({data: {id, payload}}) => {
  postMessage({id, payload})
}
