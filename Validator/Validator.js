const typesToValidateOnChange = ['text', 'password', 'email']

class FormValidator {
  #wasCharRemoved = false
  #wasCharAdded = false

  #valueTextTransform(textTransform, value) {
    switch (textTransform) {
      case 'uppercase':
        return value.toUpperCase()
      case 'lowercase':
        return value.toLowerCase()
      default:
        return value
    }
  }
  #isCharacterAllowed(allowedTypesSplitted, dotsAmount, insertedChar, insertedIndex) {
    return allowedTypesSplitted?.some((allowedType) => {
      switch (allowedType.toLowerCase()) {
        case 'numbers(+float)':
        case 'numbers(float)':
          // if it is a number or
          // if it is a '.' and there's no dot added yet
          // if it is a '-' symbol, it's added on index 0, and it is not an only positive type
          return (
            /^\d$/.test(insertedChar) ||
            (insertedChar === '.' && dotsAmount == 1) ||
            (insertedIndex === 0 && insertedChar === '-' && !allowedType.includes('+'))
          )
        case 'numbers(+int)':
        case 'numbers(int)':
        case 'numbers':
          return (
            /^\d$/.test(insertedChar) ||
            (insertedIndex === 0 && insertedChar === '-' && !allowedType.includes('+'))
          )
        case 'letters(nospace)':
        case 'letters':
          // checks if the inserted character is a letter
          return (
            /^[a-z]$/i.test(insertedChar) ||
            (insertedChar === ' ' && !allowedType.includes('nospace'))
          )
        case 'symbols':
          // checks if the inserted character is a symbol
          return (
            /^[^\da-z]$/i.test(insertedChar) &&
            !(insertedChar === ' ' && allowedTypesSplitted.includes('letters(nospace)'))
          )
        default:
          return false
      }
    })
  }
  #onlyAllowedType(dotsAmount, onlyAllowedType, value, insertedChar, insertedIndex) {
    // in case theres a negative number validator such as numbers(-int) or numbers(-float)
    // that number validator will be the only allowed type
    // therefore it'll only accept number characters
    if (/^\d$/.test(insertedChar)) {
      // convert number to float
      const floatValue = parseFloat(value)
      // if it is positive
      if (floatValue > 0) {
        this.#wasCharAdded = true
        // convert it to negative
        return floatValue * -1
      }
      // otherwise leave it as it is
      return value
    }
    // dots are allowed if type is float and there are no dots yet
    if (insertedChar === '.' && dotsAmount == 1 && onlyAllowedType.includes('float')) return value
    // in case is not an allowed character
    this.#wasCharRemoved = true
    return `${value.slice(0, insertedIndex)}${value.slice(insertedIndex + 1)}`
  }
  #valueAllowedTypes(allowedTypes, value, insertedChar, insertedIndex, inputType) {
    // if user is deleting
    if (inputType.includes('delete') && allowedTypes.includes('-')) {
      // if the negative symbol is left alone then remove it
      if (value.trim() === '-') return ''
      // if user tries to remove the negative symbol and there are still numbers
      if (!value.includes('-')) return parseFloat(value) * -1
    }
    if (inputType !== 'insertText') return value
    const dotsAmount = value.split('.').length - 1
    // if theres a '-' symbol at the beginning and user wants to insert something before it
    // this validation will prevent the user from doing it only if symbols are not allowed
    if (insertedIndex === 0 && value[1] === '-' && !allowedTypes.includes('symbols')) {
      this.#wasCharRemoved = true
      return value.slice(1)
    }

    // look for a negative number validator such as: numbers(-int) or numbers(-float)
    const onlyAllowedType = allowedTypes.split('|').find((type) => type.includes('-')) || ''
    // in case there is a negative number validator
    if (onlyAllowedType !== '')
      return this.#onlyAllowedType(dotsAmount, onlyAllowedType, value, insertedChar, insertedIndex)

    // convert allowed types into an array
    let allowedTypesSplitted = allowedTypes?.split('|')
    // amount of number types validators
    // for instance the following allowedTypes: numbers(float)|numbers(int)
    // has two number type validations
    const numberTypesAmount = allowedTypes?.split('number').length - 1
    // if there are more than one number validators
    if (numberTypesAmount > 1) {
      // just leave the first number validator
      // for instance if the fv-allowed-types has the following value: numbers(float)|letters|numbers(int)
      // it should only leave: numbers(float)|letters
      const firstNumberIndex = allowedTypesSplitted.findIndex((type) => type.includes('number')) // first number type validator index
      const rest = allowedTypesSplitted.filter((type) => !type.includes('number')) // rest validators
      allowedTypesSplitted = [allowedTypesSplitted[firstNumberIndex], ...rest] // merged validators
    }
    // check if the inserted caracter is an allowed type
    // for instance if fv-allowed-types is: numbers(int)|letters
    // and user types: '&' then it will check if it is either a number or a letter
    // if it is none of both it will return false
    const isAllowed = this.#isCharacterAllowed(
      allowedTypesSplitted,
      dotsAmount,
      insertedChar,
      insertedIndex
    )
    // in case the inserted character is not allowed
    if (!isAllowed) {
      this.#wasCharRemoved = true
      // return the input value without the inserted character
      return `${value.slice(0, insertedIndex)}${value.slice(insertedIndex + 1)}`
    }
    // otherwise return the whole input value
    return value
  }
  #valueMaxChars(maxChars, value, insertedIndex) {
    if (value.length <= maxChars) return value
    this.#wasCharRemoved = true
    // return the input value without the inserted character
    return `${value.slice(0, insertedIndex)}${value.slice(insertedIndex + 1)}`
  }
  #onChangeValidator(event, input) {
    event.stopImmediatePropagation()
    if (input === null || input?.value === '') return
    const selection = input.selectionStart
    const insertedIndex = selection - 1
    const insertedChar = event?.data || ''
    const allowedChars = input?.getAttribute('fv-allowed-chars') || ''
    const isInsertedAllowed = allowedChars.toLowerCase().includes(insertedChar.toLowerCase())
    const disallowedChars = input?.getAttribute('fv-disallowed-chars') || ''
    const isInsertedDisallowed = disallowedChars.toLowerCase().includes(insertedChar.toLowerCase())
    const allowedTypes = input.getAttribute('fv-allowed-types')
    if (allowedTypes !== null && !isInsertedAllowed && !isInsertedDisallowed)
      input.value = this.#valueAllowedTypes(
        allowedTypes?.toLowerCase(),
        input?.value,
        insertedChar,
        insertedIndex,
        event?.inputType
      )
    // if the input event wasn't triggered because of inserting text
    if (event?.inputType !== 'insertText') return

    if (isInsertedDisallowed) {
      this.#wasCharRemoved = true
      input.value = `${input.value.slice(0, insertedIndex)}${input.value.slice(insertedIndex + 1)}`
    }

    const textTransform = input.getAttribute('fv-text-transform')
    if (textTransform !== null && textTransform !== '')
      input.value = this.#valueTextTransform(textTransform, input?.value)
    const maxChars = input.getAttribute('fv-max-chars')
    if (maxChars !== null && !Number.isNaN(Number(maxChars)) && Number(maxChars) > 0)
      input.value = this.#valueMaxChars(Number(maxChars), input?.value, insertedIndex)

    if (this.#wasCharRemoved) {
      // if a char was removed selection needs to be displaced to the left preserve previous position
      input.setSelectionRange(selection - 1, selection - 1)
      this.#wasCharRemoved = false
      return
    }
    if (this.#wasCharAdded) {
      // if a char was added selection needs to be displaced to the right to preserve previous position
      input.setSelectionRange(selection + 1, selection + 1)
      this.#wasCharAdded = false
      return
    }
    input.setSelectionRange(selection, selection)
  }

  validate(form = null) {
    // if it is not an html form
    if (form === null || form?.tagName !== 'FORM') return
    const inputs = [...form.elements]
    inputs.forEach((input) => {
      if (typesToValidateOnChange.includes(input?.type?.toLowerCase())) {
        input.addEventListener('input', (e) => this.#onChangeValidator(e, input))
      }
    })
  }
}

const Validator = new FormValidator()
export default Validator
