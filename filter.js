const randStrings = length => {
  let res = ''
  while (res.length < length) {
    res += Math.random().toString(36).substring(2)
  }
  return res.slice(0, length)
}

const randomize = n => {
  const res = []
  for (let i = 0; i < n; i++) {
    res.push(randStrings(10))
  }
  return res.sort((l, r) => (l > r ? 1 : l < r ? -1 : 0))
}

const time = fn => {
  const start = Date.now(),
    res = fn()
  return [res, (Date.now() - start) / 1e3]
}

const [data, randTime] = time(randomize.bind(null, 1e4))
