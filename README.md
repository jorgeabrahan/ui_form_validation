# UI Form Validation

## Setup

Import the validator:

```
import Validator from 'https://cdn.jsdelivr.net/gh/jorgeabrahan/ui_form_validation@d5e8b58/Validator/Validator.js'
```

Query the form to validate from your document:

```
const form = document.getElementById('form')
```

Validate the form through the `validate()` method from the Validator class:

```
Validator.validate(form)
```

And that's it, you've finish the setup! Now take a look at the [validator HTML attributes](#validator-html-attributes) to make the validations work.

## Validator HTML attributes

You can use the following validator HTML attributes:

### 1- `fv-allowed-types`

### values

- **numbers**: only allow typing either positive or negative integer numbers

  - numbers(float): only allow typing either positive or negative float numbers (only allows inserting 1 dot)
    - numbers(+float): only allow typing positive float numbers
    - numbers(-float): only allow typing negative float numbers
  - numbers(int) same as just numbers
    - numbers(+int): only allow typing positive integer numbers
    - numbers(-int): only allow typing negative integer numbers

- **letters**: only allow typing either capital or lowercase letters with spaces

  - letters(nospace): only allow typing either capital or lowercase letters without spaces

- **symbols**: only allow typing symbols

### considerations

- You can concatenate multiple values using the `|` symbol. For instace a valid value for `fv-allowed-types` is: `numbers|letters`.
- You can only use one numbers variant as an `fv-allowed-types` value. For instance this is not a valid value: `numbers|numbers(float)|letters`, it will only validate integer numbers. On the other hand this is a valid value: `numbers(+int)|symbols`.
- If you use a negative numbers validator then all other validators will be ignored. For instance this `fv-allowed-types` value: `numbers(-int)|letters` will end up being just: `numbers(-int)` when validating.

### 2- `fv-allowed-chars`

### values

- **characters**: any character(s) that will be allowed typing in the input

### tip

Use this validator alongside the `fv-allowed-types` to extend its functionality.

#### use case

Imagine you want to allow typing any positive integer and the letters: A, B, C, D, E, and F. Let's try to do this with just the `fv-allowed-types` attribute:

```
<input type="text" fv-allowed-types="numbers(+int)|letters" />
```

The problem is that this will allow the user to input any letter and not only the ones that we want. Here's where using the `fv-allowed-chars` attribute comes in handy:

```
<input type="text" fv-allowed-types="numbers(+int)" fv-allowed-chars="abcdef" />
```

Now it will work as expected!

> Notice letters are not separated by spaces or commas and that the case doesn't even matter, it will work for both capital and lowercase letters

### 3- `fv-disallowed-chars`

- **characters**: any character(s) that won't be allowed typing in the input

### tip

Use this validator alongside the `fv-disallowed-chars` to extend its functionality.

#### use case

Imagine you want to allow typing any positive integer except for 0. Of course you could use the `fv-allowed-chars` attribute:

```
<input type="text" fv-allowed-chars="123456789" />
```

The problem is that you have to write too many characters. Here's where using the `fv-disallowed-chars` attribute comes in handy:

```
<input type="text" fv-allowed-types="numbers(+int)" fv-disallowed-chars="0" />
```

Now it will work as expected and it is much more readable!

> Notice how disallowed and allowed chars can be numbers, letters, or even symbols.

### 4- `fv-max-chars`

- **x**: where x is a valid positive integer that determines the maximum amount of characters that can be typed

### considerations

- If a negative number is used as a value this validator will have no effect.

### 5- `fv-text-transform`

- **uppercase**: only allow typing uppercase letters.
- **lowercase**: only allow typing lowercase letters.

### considerations

- If a letter not matching the allowed case is typed than it will automatically switch to the allowed type.
