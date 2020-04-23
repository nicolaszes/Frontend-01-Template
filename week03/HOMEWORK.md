```js
function convertStringToNumber(string, x = 10) {
  var chars = string.split('')
  var number = 0
  
  var i = 0;
  while (i < chars.length && chars[i] != '.') {
    number = number * x
    number += chars[i].codePointAt(0) - '0'.codePointAt(0)
    i++
  }
  
  var fraction = 1
  if (chars[i] === '.') {
    i++
  }
  
  while (i < chars.length) {
    number += (chars[i].codePointAt(0) - '0'.codePointAt(0)) * fraction
    fraction = fraction / x
    i++
  }
  return number + fraction
}
convertStringToNumber('100.02')
```



```js
function convertNumberToString (number, x) {
  return number
}
```

