# JS

```js
var bar = {
    myName:"time.geekbang.com",
    printName: function () {
        console.log(myName)
    }
}
function foo() {
    let myName = " 极客时间 "
    return bar.printName
}
let myName = " 极客邦 "
let _printName = foo()
_printName()
bar.printName()
```



```js
全局执行上下文：
变量环境：
Bar = undefined
Foo = function
词法环境：
myname = undefined
_printName = undefined

开始执行：
bar = { myname: "time.geekbang.com", printName: function(){...} }

myName = " 极客邦 "
_printName = foo() 调用foo函数，压执行上下文入调用栈

foo函数执行上下文：
变量环境： 空
词法环境： myName=undefined
开始执行：
myName = " 极客时间 "
return bar.printName
开始查询变量bar， 查找当前词法环境（没有）->查找当前变量环境（没有） -> 查找outer词法环境（没有）-> 查找outer语法环境（找到了）并且返回找到的值
pop foo的执行上下文

_printName = bar.printName
printName（）压bar.printName方法的执行上下文入调用栈

bar.printName函数执行上下文：
变量环境： 空
词法环境： 空
开始执行：
console.log(myName)
开始查询变量myName， 查找当前词法环境（没有）->查找当前变量环境（没有） -> 查找outer词法环境（找到了）
打印" 极客邦 "
pop bar.printName的执行上下文

bar.printName() 压bar.printName方法的执行上下文入调用栈

bar.printName函数执行上下文：
变量环境： 空
词法环境： 空
开始执行：
console.log(myName)
开始查询变量myName， 查找当前词法环境（没有）->查找当前变量环境（没有） -> 查找outer词法环境（找到了）
打印" 极客邦 "
pop bar.printName的执行上下文
```



## this

```js
// 修改方法一：箭头函数最方便
let userInfo = {
  name: "jack.ma",
  age: 13,
  sex: 'male',
  updateInfo: function () {
    // 模拟 xmlhttprequest 请求延时
    setTimeout(() => {
      this.name = "pony.ma"
      this.age = 39
      this.sex = 'female'
    }, 100)
  }
}

userInfo.updateInfo()
setTimeout(() => {
  console.log(userInfo)
}, 200)

// 修改方法二：缓存外部的this
let userInfo = {
  name: "jack.ma",
  age: 13,
  sex: 'male',
  updateInfo: function () {
    let me = this;
    // 模拟 xmlhttprequest 请求延时
    setTimeout(function () {
      me.name = "pony.ma"
      me.age = 39
      me.sex = 'female'
    }, 100)
  }
}

userInfo.updateInfo()
setTimeout(() => {
  console.log(userInfo);
}, 200)

// 修改方法三，其实和方法二的思路是相同的
let userInfo = {
  name: "jack.ma",
  age: 13,
  sex: 'male',
  updateInfo: function () {
    // 模拟 xmlhttprequest 请求延时
    void
    function (me) {
      setTimeout(function () {
        me.name = "pony.ma"
        me.age = 39
        me.sex = 'female'
      }, 100)
    }(this);
  }
}

userInfo.updateInfo()
setTimeout(() => {
  console.log(userInfo)
}, 200)

let update = function () {
  this.name = "pony.ma"
  this.age = 39
  this.sex = 'female'
}

方法四: 利用call或apply修改函数被调用时的this值(不知掉这么描述正不正确)
let userInfo = {
  name: "jack.ma",
  age: 13,
  sex: 'male',
  updateInfo: function () {
    // 模拟 xmlhttprequest 请求延时
    setTimeout(function () {
      update.call(userInfo);
      // update.apply(userInfo)
    }, 100)
  }
}

userInfo.updateInfo()
setTimeout(() => {
  console.log(userInfo)
}, 200)

// 方法五: 利用bind返回一个新函数，新函数被调用时的this指定为userInfo
let userInfo = {
  name: "jack.ma",
  age: 13,
  sex: 'male',
  update: function () {
    this.name = "pony.ma"
    this.age = 39
    this.sex = 'female'
  },
  updateInfo: function () {
    // 模拟 xmlhttprequest 请求延时
    setTimeout(this.update.bind(this), 100)
  }
}
```

## Instanceof

```js
function instanceof (left, right) {
	let prototype = right.prototype
	left = left.__proto__
	while (true) {
    if (left === null) {
      return false
    }
    if (prototype === left) {
      return true
    }
    left === left.__proto__
  }
}
```

### setTimeout / requestAnimateFrame