# Event

```rust
捕获阶段 -> 目标阶段 -> 冒泡阶段
```

```rust
window -> document -> html(documentElement) -> body -> div -> 逐层传递...
```

## 属性

### currentTarget

[`Event`](https://developer.mozilla.org/zh-CN/docs/Web/API/Event) 接口的只读属性 `**currentTarget**` 表示的，标识是当事件沿着 DOM 触发时事件的当前目标。它总是指向事件绑定的元素，而 [`Event.target`](https://developer.mozilla.org/zh-CN/docs/Web/API/Event/target) 则是事件触发的元素。

### target

触发事件的对象 (某个DOM元素) 的引用。当事件处理程序在事件的冒泡或捕获阶段被调用时，它与[`event.currentTarget`](https://developer.mozilla.org/zh-CN/docs/Web/API/Event/currentTarget)不同。

### bubbles

返回一个布尔值,表明当前事件是否会向DOM树上层元素冒泡.

### cancelable

返回结果为 `Boolean`，如果事件可以被取消将返回 true。

```js
function preventScrollWheel(event) {
  if (typeof event.cancelable !== 'boolean' || event.cancelable) {
    // The event can be canceled, so we do so.
    event.preventDefault();
  } else {
    // The event cannot be canceled, so it is not safe
    // to call preventDefault() on it.
    console.warn(`The following event couldn't be canceled:`);
    console.dir(event);
  }
}

document.addEventListener('wheel', preventScrollWheel);
```

### cancelBubble

`**Event.cancelBubble**` 属性是 [`Event.stopPropagation()`](https://developer.mozilla.org/zh-CN/docs/Web/API/Event/stopPropagation)的一个曾用名。在从事件处理程序返回之前将其值设置为true可阻止事件的传播。

### isTrusted

[Event](https://developer.mozilla.org/en-US/docs/Web/API/Event)接口的isTrusted是一个[Boolean](https://developer.mozilla.org/en-US/docs/Web/API/Boolean)类型的只读属性.当事件由用户操作生成时为true，由脚本创建或修改,或通过调用 [EventTarget.dispatchEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/dispatchEvent)生成,为false



## 事件流动（Event Flow）

### 捕获阶段（capture phase）

事件对象在事件目标的祖先中上到下顺向传播，从最顶层的defaultView到事件目标的（直系）父元素。

```dart
document    1
  v
body    2
  v
div    3
  v
button
```

一般我们没太大需要监听捕获阶段的事件；如果你确实希望这么做，需要将`addEventListener`的第三个参数设置为true：

```jsx
// 第三个参数设置是否为捕获阶段，默认为false
element.addEventListener('click', function() {}, true)
```

### 目标阶段（target phase）

事件对象到达事件目标。

```jsx
element.addEventListener('click', function() {})
```

如果事件是不可冒泡的，那整个事件流动会到此为止，不会发生下面的冒泡阶段。

### 冒泡阶段（bubble phase）

事件对象会在事件目标的祖先元素里反向传播，由开始的父元素到最后的defaultView（document）。

```dart
document    3
  ^
body    2
  ^
div    1
  ^
button
```



## 事件方法

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="X-UA-Compatible" content="ie=edge">
	<title>Event</title>
	<style>
		.box1{
			height: 200px;
			width: 600px;
			margin: 0 auto;
			background-color: skyblue;
		}			
		.box1 a{
			display: block;
			height: 50%;
			width: 50%;
			background-color: greenyellow;
		}
	</style>
</head>
<body>
	<div class="box1" id="box1">
		<a href="http://www.bing.com" target="_blank"></a>
	</div>
</body>
</html>
```

```js
// 不阻止事件冒泡和默认事件
document.getElementById('box1').onclick = () => {
	console.log("1") // 不阻止事件冒泡会打印1，页面跳转			
}
```

### preventDefault

不会阻止父节点继续处理事件

```js
// 阻止默认行为
document.getElementById('box1').children[0].onclick = (event) => {
	event.preventDefault() // 页面不会跳转，但是会打印出1		
}
document.getElementById('box1').onclick = () => {
	console.log("1")				
}
```



### stopPropagation

不希望用户点击别的地方时发生任何事情

```js
// 阻止冒泡
document.getElementById('box1').children[0].onclick = (event) => {
	event.stopPropagation() // 不会打印1，但是页面会跳转			
}
document.getElementById('box1').onclick = () => {
	console.log("1")				
}
```

### stopImmediatePropagation

如果有多个相同类型事件的事件监听函数绑定到同一个元素，当该类型的事件触发时，它们会按照被添加的顺序执行。如果其中某个监听函数执行了 `event.stopImmediatePropagation()` 方法，则当前元素剩下的监听函数将不会被执行。（译者注：注意区别 event.stopPropagation ）

```html
<div>
  <p>paragraph</p>
</div>
<script>
  const p = document.querySelector('p')
  p.addEventListener("click", (event) => {
    alert("我是p元素上被绑定的第一个监听函数");
  }, false);

  p.addEventListener("click", (event) => {
    alert("我是p元素上被绑定的第二个监听函数");
    event.stopImmediatePropagation();
    // 执行stopImmediatePropagation方法,阻止click事件冒泡,并且阻止p元素上绑定的其他click事件的事件监听函数的执行.
  }, false);

  p.addEventListener("click",(event) => {
    alert("我是p元素上被绑定的第三个监听函数");
    // 该监听函数排在上个函数后面，该函数不会被执行
  }, false);

  document.querySelector("div").addEventListener("click", (event) => {
    alert("我是div元素,我是p元素的上层元素");
    // p元素的click事件没有向上冒泡，该函数不会被执行
  }, false);
</script>
```



### return false

```js
document.getElementById('box1').onclick = () => {
	console.log("1")
}
document.getElementById('box1').children[0].onclick = (event) => {
	return false
}
```





## 事件级别

### DOM0

```js
element.onclick = function() { }
```

DOM0级事件处理程序的缺点在于一个处理程序无法同时绑定多个处理函数，比如我还想再点击按钮事件上加上另外一个函数。

### DOM2

```js
element.addEventListener(‘click’, function() { }, false)
```

DOM2级事件在DOM0级时间段额基础上弥补了一个处理处理程序
无法同时绑定多个处理函数的缺点。允许给一个程序添加多个处理函数。

#### addEventListener

| *event*      | 必须。字符串，指定事件名。  **注意:** 不要使用 "on" 前缀。 例如，使用 "click" ,而不是使用 "onclick"。  **提示：** 所有 HTML DOM 事件，可以查看我们完整的 [HTML DOM Event 对象参考手册](https://www.runoob.com/jsref/dom-obj-event.html)。 |
| ------------ | ------------------------------------------------------------ |
| *function*   | 必须。指定要事件触发时执行的函数。  当事件对象会作为第一个参数传入函数。 事件对象的类型取决于特定的事件。例如， "click" 事件属于 MouseEvent(鼠标事件) 对象。 |
| *useCapture* | 可选。布尔值，指定事件是否在捕获或冒泡阶段执行。  可能值:true - 事件句柄在捕获阶段执行false- false- 默认。事件句柄在冒泡阶段执行 |



### DOM3

```tex
DOM3级事件是在DOM2级事件的基础上添加很多事件类型。
UI事件，当用户与页面上的元素交互时触发，如：load、scroll
焦点事件，当元素获得或失去焦点时触发，如：blur、focus
鼠标事件，当用户通过鼠标在页面执行操作时触发如：dbclick、mouseup
滚轮事件，当使用鼠标滚轮或类似设备时触发，如：mousewheel
文本事件，当在文档中输入文本时触发，如：textInput
键盘事件，当用户通过键盘在页面上执行操作时触发，如：keydown、keypress
合成事件，当为IME（输入法编辑器）输入字符时触发，如：compositionstart
变动事件，当底层DOM结构发生变化时触发，如：DOMsubtreeModified
同时DOM3级事件也允许使用者自定义一些事件。
```

```js
element.addEventLIstener(‘keyup’, function() { }, false)
```



### [自定义事件](https://blog.csdn.net/shadow_zed/article/details/80666526)

#### new Event()

```html
<!DOCTYPE html>
<html>
<head lang="zh-CN">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title></title>
    <style>
        .button {
            width: 200px;
            height: 200px;
            background-color: antiquewhite;
            margin: 20px;
            text-align: center;
            line-height: 200px;
        }
    </style>
</head>
<body>
    <div class="button">Button</div>
    <script>
        "use strict";
        var btn = document.querySelector('.button');
        var ev = new Event('test', {
            bubbles: 'true',
            cancelable: 'true'
        });
        btn.addEventListener('test', function (event) {
            console.log(event.bubbles);
            console.log(event.cancelable);
            console.log(event.detail);
        }, false);
        btn.dispatchEvent(ev);
    </script>
</body>
</html>
```

![img](https://img-blog.csdn.net/20180612155203743?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3NoYWRvd196ZWQ=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

#### new customEvent()

```html
<!DOCTYPE html>
<html>
<head lang="zh-CN">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title></title>
    <style>
        .button {
            width: 200px;
            height: 200px;
            background-color: antiquewhite;
            margin: 20px;
            text-align: center;
            line-height: 200px;
        }
    </style>
</head>
<body>
    <div class="button">Button</div>
 
    <script>
        "use strict";
        var btn = document.querySelector('.button');
 
        var ev = new CustomEvent('test', {
            bubbles: 'true',
            cancelable: 'true',
            detail: 'tcstory'
        });
        btn.addEventListener('test', function (event) {
            console.log(event.bubbles);
            console.log(event.cancelable);
            console.log(event.detail);
        }, false);
        btn.dispatchEvent(ev);
    </script>
</body>
</html>
```

![img](https://img-blog.csdn.net/20180612155227513?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3NoYWRvd196ZWQ=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)



### delegate

```js
/**
 * only support #id, tagName, .className
 * and it's simple single, no combination
 */
function matchSelector(ele, selector) {
  // if use id
  if (selector.charAt(0) === "#") {
    return ele.id === selector.slice(1);
  }
  // if use class
  if (selector.charAt(0) === ".") {
    return (
      (" " + ele.className + " ").indexOf(" " + selector.slice(1) + " ") != -1
    );
  }
  // if use tagName
  return ele.tagName.toLowerCase() === selector.toLowerCase();
}

function delegateEvent(interfaceEle, selector, type, fn) {
  if (interfaceEle.addEventListener) {
    interfaceEle.addEventListener(type, eventfn);
  } else {
    interfaceEle.attachEvent("on" + type, eventfn);
  }

  function eventfn(e) {
    var e = e || window.event;
    var target = e.target || e.srcElement;
    if (matchSelector(target, selector)) {
      if (fn) {
        fn.call(target, e);
      }
    }
  }
}

//调用
var odiv = document.getElementById("oDiv");
delegateEvent(odiv, "a", "click", function() {
  alert("1");
});
```

