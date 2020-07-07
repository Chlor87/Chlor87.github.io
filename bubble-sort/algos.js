export function* bubbleSort(arr, speedup = 1) {
  const {length} = arr
  for (let i = 0; i < length; i++) {
    for (let j = 0; j < length; j++) {
      if (arr[j] > arr[j + 1]) {
        swap(arr, j, j + 1)
        if (j % speedup === 0) {
          yield [i, j + 1]
        }
      }
    }
  }
  return yield [0, length - 1]
}

export const swap = (arr, i, j) => {
  ([arr[i], arr[j]] = [arr[j], arr[i]])
}

export const getArray = n => Array.from({length: n}).map((_, i) => ++i)

// Fisher-Yates shuffle
export const shuffle = arr => {
  let {length} = arr
  while (length) {
    const i = Math.floor(Math.random() * length--),
      tmp = arr[length]
    arr[length] = arr[i]
    arr[i] = tmp
  }
  return arr
}
