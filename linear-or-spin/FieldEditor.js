export default class FieldEditor extends Map {
  constructor(fields) {
    super(fields)
  }

  get(k) {
    return super.get(k).value
  }

  run() {
    const info = document.querySelector('.info')
    this.forEach(({value, type}, k) => {
      const elem = document.createElement('div'),
        label = document.createElement('label'),
        input = document.createElement('input')
      elem.classList.add('form-group')
      elem.append(label, input)
      label.textContent = k
      
      info.append(elem)
      switch (type) {
        case Number:
          input.type = 'number'
          input.value = value
          input.addEventListener('keyup', ({target: {value}}) => {
            super.get(k).value = type(value)
          })
          break
        case Boolean:
          input.type = 'checkbox'
          input.checked = value
          input.addEventListener('change', ({target: {value}}) => {
            super.get(k).value = input.checked
          })
      }

    })
  }
}