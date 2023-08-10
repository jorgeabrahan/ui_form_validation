import Validator from 'https://cdn.jsdelivr.net/gh/jorgeabrahan/ui_form_validation@d5e8b58/Validator/Validator.js'

const form = document.getElementById('form')
Validator.validate(form)

/* Copy CDN link from copyInput */
const copyInput = document.querySelector('.copy__input')
const copyButton = document.querySelector('.copy__button')
copyButton.addEventListener('click', () => {
  navigator.clipboard.writeText(copyInput?.value)
  alert('Text copied!')
})
