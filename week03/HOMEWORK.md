```js
function convertStringToNumber(str) {
  const numberRegex = /^(\.\d+|(0|[1-9]\d*)(\.\d*)?)([eE][-\+]?\d+)?$|^0[bB][01]+$|^0[oO][0-7]+$|^0[xX][0-9a-fA-F]+$/

  if (!str) {
    return NaN
  }
  if (typeof str !== 'string') {
    throw new Error('str 只能为字符串')
  }
  if (!numberRegex.test(str)) {
    throw new Error('数字不合法')
  }
  
  const isDecimal = /^(\.\d+|(0|[1-9]\d*)(\.\d*)?)([eE][-\+]?\d+)?$/.test(str)
  const isBinary = /^0[bB][01]+$/.test(str)
  const isOctal = /^0[oO][0-7]+$/.test(str)
  const isHex = /^0[xX][0-9a-fA-F]+$/.test(str)
  const isExponent = /^(\.\d+|(0|[1-9]\d*)(\.\d*)?)([eE][-\+]?\d+)$/.test(str)
  let hex
  
  if (isBinary) hex = 2
  if (isOctal) hex = 8
  if (isDecimal) hex = 10
  if (isHex) hex = 16
  if (isBinary || isOctal || isHex) {
    str = str.slice(2)
  }
  
  if (isHex) {
    str = str.toUpperCase()
    let chars = str.split('')
    let number = 0
    let i = 0
    let wordReg = /[abcdef]/i
    const offset = 7 // A和9的码点偏移量 超过9的要减去这个偏移量

    while (i < chars.length) {
      number = number * hex

      if (wordReg.test(chars[i])) {
        number += chars[i].codePointAt(0) - '0'.codePointAt(0) - offset
      }else {
        number += chars[i].codePointAt(0) - '0'.codePointAt(0) 
      }
      i++
    }
    return number
  }
  
  if (!isExponent) {
    let chars = str.split('')
    let number = 0
    let i = 0
    while (i < chars.length && chars[i] !== '.') {
      number = number * hex
      number += chars[i].codePointAt(0) - '0'.codePointAt(0)
      i++
    }
    if (chars[i] === '.') {
      i++
    }
    let fraction = 1
    while (i < chars.length) {
      fraction /= hex
      number += (chars[i].codePointAt(0) - '0'.codePointAt(0)) * fraction
      i++
    }
    return number
  }
  
  let logNumber = Number(str.match(/\d+$/)[0])
  let number = str.match(/^[\d\.]+/)[0].replace(/\./, '')
  if (/^(\.\d+|(0|[1-9]\d*)(\.\d*)?)([eE][+]?\d+)?$/.test(str)) {
    return Number(number.padEnd(logNumber + 1, 0))
  } else {
    return Number(number.padStart(logNumber + number.length, 0).replace(/^0/, '0.'))
  }
}
convertStringToNumber('100.02')
```



```js
function convertNumberToString (number, x = 10) {
  var integer = Math.floor(number);
  var fractionPos = ('' + number).indexOf('.');
  var fractionLength = ('' + number).length - fractionPos - 1;
  var fraction = (number - integer).toFixed(fractionLength);
  var str = '';
  while (integer > 0) {
    str = integer % x + str;
    integer = Math.floor(integer / x);
  }
  if (fractionPos > -1) {
    str += '.';
    while (fractionLength > 0) {
      fraction *= x;
      str += Math.floor(fraction % x);
      fractionLength--;
    }
  }
  return str;
}
```



### JS中的特殊对象

#### Object

#### Date

#### Function Object

#### Array Object

#### RegExp

#### Error

#### String Object

#### Number Object

#### Boolean Object

