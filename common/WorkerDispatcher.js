import {defer} from './utils.js'

export default class WorkerDispatcher {
  promises = new Map()
  workers = new Map()
  seq = 0

  register(name, workerUrl, instances = 1) {
    if (this.workers.has(name)) {
      throw new Error(`worker ${name} already registered`)
    }
    this.workers.set(name, {seq: 0, instances, pool: []})
    for (let i = 0; i < instances; i++) {
      const w = new Worker(workerUrl, {type: 'module'})
      w.onmessage = ({data: {id, payload}}) => {
        this.promises.get(id).resolve(payload)
        this.promises.delete(id)
        this.seq--
      }
      this.workers.get(name).pool.push(w)
    }
  }

  async send(name, payload) {
    const deferred = defer(),
      id = this.seq++,
      worker = this.workers.get(name)
    this.promises.set(id, deferred)
    worker.pool[worker.seq++ % worker.instances].postMessage({id, payload})
    return deferred.promise
  }
}
