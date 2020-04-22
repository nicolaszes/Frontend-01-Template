#### Number

整数|浮点数

```markdown
/^-?\d+(\.\d+)?$/
```

二进制

```
/^[01]+$/
```

八进制

```
/^[0-7]+$/
```

十六进制

```
/^0[xX][0-9a-fA-F]+$/
```

Number字面量

```
/(^-?\d+(\.\d+)?$)|(^[01]+$)|(^[0-7]+$)|(^0[xX][0-9a-fA-F]+$)/
```



#### utf-8

```js
function encodingUTF (str) {
  const encodeText = encodeURIComponent(str)
  const arr = []
  
  for (let i = 0; i < encodeText.length; i++) {
    const cod = encodeText.charAt(i)
    if (cod === '%') {
      const hex = encodeText.charAt(i + 1) + encodeText.charAt(i + 2)
      const hexVal = parseInt(hex, 16)
      arr.push(hexVal)
      i += 2
      continue
    }
    arr.push(cod.charCodeAt(0))
  }
  return arr
}
```



#### String

```
/^[\u0021-\u007E]{6,16}|[\x21-\x7E]{6,16}|(['"])(?:(?!\1).)*?\1$/
```

