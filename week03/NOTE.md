# 每周总结可以写在这里
## 上节课回顾

浮点数少做算术运算，会出现精度丢失

ieee754 标准



## Grammar

### Tree vs Priority

* +-
* */
* ()

<img src="/Users/zhangshuai/Library/Application Support/typora-user-images/image-20200423202528002.png" alt="image-20200423202528002" style="zoom:80%;" />

### Expressions

#### Member

* a.b
* a[b]
* foo`string`
* super.b
* super['b']
* new.target
* new Foo()

返回 refrence 类型



#### New

* new Foo



### Refrence —— 运行时

* Object
* Key
* delete
* Assign



算法优先级

```js
class foo {
	constructor () {
		this.b = 1
	}
}

new foo()['b']
```



#### Call

* foo()
* super()
* ...



### Left Handside —— 语法上

a.b = c

a + b = c

```js
foo() = 1
```



###UpdateExpression
```js
var a = 1, b = 1, c = 1;
// no terminator
a
++
b
++
c
// 2

a /*
*/
++ b /*
*/
++ c
//3
```



### Unary

* Delete a.b
* Void foo() // void 0
* typeof a
* +a
* -a
* ~a
* !a
* await a

** 是唯一一个右结合的运算符



### Object 装箱操作

#### 装箱操作

```js
Object(2)
Object('2')
Object(Symbol(1))
Object(true)
```

#### 拆箱操作

```js
1 + {valueOf() {return 2}} // 3
1 + {toString() {return 2}} // 3
1 + {toString() {return '2'}} // '12'
1 + {[Symbol.toPrimitive](){return 6}, valueOf() {return 2}, toString() {return 2}} // 7
```

