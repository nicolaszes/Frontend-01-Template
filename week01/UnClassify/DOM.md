# DOM

## 节点类型

### NodeTypes - 有名常数

| NodeType | Named Constant              |
| :------- | :-------------------------- |
| 1        | ELEMENT_NODE                |
| 2        | ATTRIBUTE_NODE              |
| 3        | TEXT_NODE                   |
| 4        | CDATA_SECTION_NODE          |
| 5        | ENTITY_REFERENCE_NODE       |
| 6        | ENTITY_NODE                 |
| 7        | PROCESSING_INSTRUCTION_NODE |
| 8        | COMMENT_NODE                |
| 9        | DOCUMENT_NODE               |
| 10       | DOCUMENT_TYPE_NODE          |
| 11       | DOCUMENT_FRAGMENT_NODE      |
| 12       | NOTATION_NODE               |

### 节点类型 - 所返回的值

下面的表格列出了对每个节点类型来说，nodeName 和 nodeValue 属性可返回的值：

| 节点类型              | nodeName 的返回值  | nodeValue 的返回值 |
| :-------------------- | :----------------- | :----------------- |
| Document              | #document          | null               |
| DocumentFragment      | #document fragment | null               |
| DocumentType          | doctype 名称       | null               |
| EntityReference       | 实体引用名称       | null               |
| Element               | element name       | null               |
| Attr                  | 属性名称           | 属性值             |
| ProcessingInstruction | target             | 节点的内容         |
| Comment               | #comment           | 注释文本           |
| Text                  | #text              | 节点内容           |
| CDATASection          | #cdata-section     | 节点内容           |
| Entity                | 实体名称           | null               |
| Notation              | 符号名称           | null               |

## DOM 操作

### 节点查找 API

####document.getElementById

根据ID查找元素，大小写敏感，如果有多个结果，只返回第一个；

#### document.getElementsByClassName

根据类名查找元素，多个类名用空格分隔，返回一个 HTMLCollection 。注意兼容性为IE9+（含）。另外，不仅仅是document，其它元素也支持 getElementsByClassName 方法；

#### document.getElementsByTagName

根据标签查找元素， * 表示查询所有标签，返回一个 HTMLCollection 。

####document.getElementsByName

根据元素的name属性查找，返回一个 NodeList 。

####document.querySelector

返回单个Node，IE8+(含），如果匹配到多个结果，只返回第一个。

####document.querySelectorAll

返回一个 NodeList ，IE8+(含）。

#### document.forms

获取当前页面所有form，返回一个 HTMLCollection ；



### 节点创建API

#### createElement创建元素

```js
var elem = document.createElement("div");  
elem.id = 'haorooms';  
elem.style = 'color: red';  
elem.innerHTML = '我是新创建的haorooms测试节点';  
document.body.appendChild(elem);  
```

#### createTextNode创建文本节点

```js
var node = document.createTextNode("我是文本节点");  
document.body.appendChild(node);  
```

#### cloneNode 克隆一个节点

node.cloneNode(true/false) ，它接收一个bool参数，用来表示是否复制子元素。

```
var from = document.getElementById("test");  
var clone = from.cloneNode(true);  
clone.id = "test2";  
document.body.appendChild(clone);  
```

克隆节点并不会克隆事件，除非事件是用

这种方式绑定的，用 addEventListener 和 node.onclick=xxx; 方式绑定的都不会复制。

#### createDocumentFragment

本方法用来创建一个 DocumentFragment ，也就是文档碎片，它表示一种轻量级的文档，主要是用来存储临时节点，大量操作DOM时用它可以大大提升性能。



### 节点修改 API

#### appendChild

```js
parent.appendChild(child);
```

#### insertBefore

```js
parentNode.insertBefore(newNode, refNode);  
```

#### insertAdjacentHTML

```js
//js谷歌浏览器，火狐浏览器，IE8+
el.insertAdjacentHTML('beforebegin', htmlString);
```

关于insertAdjacentHTML，这个API比较好用，具体可以看：https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML

```html
<!-- beforebegin -->
<p>
  <!-- afterbegin -->
  foo
  <!-- beforeend -->
</p>
<!-- afterend -->
```

**Element.insertAdjacentElement()**

用法和上面类似，

```js
targetElement.insertAdjacentElement(position, element);
```

#### removeChild

removeChild用于删除指定的子节点并返回子节点，语法：

```js
var deletedChild = parent.removeChild(node);  
```

deletedChild指向被删除节点的引用，它仍然存在于内存中，可以对其进行下一步操作。另外，如果被删除的节点不是其子节点，则将会报错。一般删除节点都是这么删的：

```js
function removeNode(node)  {  
    if(!node) return;  
    if(node.parentNode) node.parentNode.removeChild(node);  
}  
```

#### replaceChild

replaceChild用于将一个节点替换另一个节点，语法：

```js
parent.replaceChild(newChild, oldChild); 
```



### 节点关系API

#### 父关系 API

##### parentNode

每个节点都有一个parentNode属性，它表示元素的父节点。Element的父节点可能是Element，Document或DocumentFragment；

##### parentElement

返回元素的父元素节点，与parentNode的区别在于，其父节点必须是一个Element元素，如果不是，则返回null；

#### 子关系 API

##### children

返回一个实时的 HTMLCollection ，子节点都是Element，IE9以下浏览器不支持；

##### childNodes

返回一个实时的 NodeList ，表示元素的子节点列表，注意子节点可能包含文本节点、注释节点等；

#####firstChild

返回第一个子节点，不存在返回null，与之相对应的还有一个 firstElementChild ；

##### lastChild

返回最后一个子节点，不存在返回null，与之相对应的还有一个 lastElementChild ；

#### 兄弟关系 API

#####previousSibling

节点的前一个节点，如果不存在则返回null。注意有可能拿到的节点是文本节点或注释节点，与预期的不符，要进行处理一下。

#####nextSibling

节点的后一个节点，如果不存在则返回null。注意有可能拿到的节点是文本节点，与预期的不符，要进行处理一下。

#####previousElementSibling

返回前一个元素节点，前一个节点必须是Element，注意IE9以下浏览器不支持。

##### nextElementSibling

返回后一个元素节点，后一个节点必须是Element，注意IE9以下浏览器不支持。



### 元素属性 API

#### setAttribute

```js
element.setAttribute(name, value);
```

#### getAttribute

getAttribute返回指定的特性名相应的特性值，如果不存在，则返回null：

```js
var value = element.getAttribute("id");
```

#### hasAttribute

```js
var result = element.hasAttribute(name);

var foo = document.getElementById("foo"); 
if (foo.hasAttribute("bar")) { 
    // do something
}
```

#### dataset

获取html data-开头的属性，用法如下：

```js
<div id="user" data-id="1234567890" data-user="johndoe" data-date-of-birth>John Doe</div>

let el = document.querySelector('#user');

// el.id == 'user'
// el.dataset.id === '1234567890'
// el.dataset.user === 'johndoe'
// el.dataset.dateOfBirth === ''

el.dataset.dateOfBirth = '1960-10-03'; // set the DOB.

// 'someDataAttr' in el.dataset === false
el.dataset.someDataAttr = 'mydata';
// 'someDataAttr' in el.dataset === true
```



### 样式相关API

#### 直接修改元素的样式

```js
elem.style.color = 'red';  
elem.style.setProperty('font-size', '16px');  
elem.style.removeProperty('color');  
```

#### 动态添加样式规则

```js
var style = document.createElement('style');  
style.innerHTML = 'body{color:red} #top:hover{ background-color: red; color: white; }';  
document.head.appendChild(style);  
```

#### classList获取样式class

```js
// div is an object reference to a <div> element with class="foo bar"
div.classList.remove("foo");
div.classList.add("anotherclass");

// if visible is set remove it, otherwise add it
div.classList.toggle("visible");

// add/remove visible, depending on test conditional, i less than 10
div.classList.toggle("visible", i < 10 );

alert(div.classList.contains("foo"));

// add or remove multiple classes
div.classList.add("foo", "bar", "baz");
div.classList.remove("foo", "bar", "baz");

// add or remove multiple classes using spread syntax
let cls = ["foo", "bar"];
div.classList.add(...cls); 
div.classList.remove(...cls);

// replace class "foo" with class "bar"
div.classList.replace("foo", "bar");
```

#### window.getComputedStyle

通过 element.sytle.xxx 只能获取到内联样式，借助 window.getComputedStyle 可以获取应用到元素上的所有样式，IE8或更低版本不支持此方法。

```js
var style = window.getComputedStyle(element[, pseudoElt]);
```

### 获取相关高度API

#### getBoundingClientRect

getBoundingClientRect 用来返回元素的大小以及相对于浏览器可视窗口的位置，用法如下：

```
var clientRect = element.getBoundingClientRect();  
```

clientRect是一个 DOMRect 对象，包含width、height、left、top、right、bottom，它是相对于窗口顶部而不是文档顶部，滚动页面时它们的值是会发生变化的。