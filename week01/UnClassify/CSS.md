# CSS

### 在页面上隐藏元素的方法有哪些

##### 占位:

- `visibility: hidden;`
- `margin-left: -100%;`
- `opacity: 0;`
- `transform: scale(0);`
- `z-index: -99999;`

##### 不占位:

- `display: none;`
- `width: 0; height: 0; overflow: hidden;`

仅对块内文本元素:

- `text-indent: -9999px;`
- `font-size: 0;`



### Link 和 @important

- link是XHTML标签，除了加载CSS外，还可以定义RSS等其他事务；[@import](https://github.com/import)属于CSS范畴，只能加载CSS。
- link引用CSS时，在页面载入时同时加载（并行）；[@import](https://github.com/import)需要页面网页完全载入以后加载。
  所以会出现一开始没有css样式，闪烁一下出现样式后的页面(网速慢的情况下)
- link是XHTML标签，无兼容问题；[@import](https://github.com/import)是在CSS2.1提出的，低版本的浏览器不支持。
- link支持使用Javascript控制DOM去改变样式；而[@import](https://github.com/import)不支持。

#### 在html设计制作中，css有四种引入方式

##### 方式一： 内联样式

```
<div style="display: none;background:red"></div>
```

这通常是个很糟糕的书写方式，它只能改变当前标签的样式，如果想要多个 `` 拥有相同的样式，你不得不重复地为每个 `` 添加相同的样式，如果想要修改一种样式，又不得不修改所有的 style 中的代码。很显然，内联方式引入 CSS 代码会导致 HTML 代码变得冗长，且使得网页难以维护。

##### 方式二： 嵌入样式

嵌入方式指的是在 HTML 头部中的 `` 标签下书写 CSS 代码。
示例：

```HTML
<head>
    <style>
    .content {
        background: red;
    }
    </style>
</head>
```

嵌入方式的 CSS 只对当前的网页有效。因为 CSS 代码是在 HTML 文件中，所以会使得代码比较集中，当我们写模板网页时这通常比较有利。因为查看模板代码的人可以一目了然地查看 HTML 结构和 CSS 样式。因为嵌入的 CSS 只对当前页面有效，所以当多个页面需要引入相同的 CSS 代码时，这样写会导致代码冗余，也不利于维护。

##### 方式三：链接样式

```HTML
<head>
    <link rel="stylesheet" type="text/css" href="style.css">
</head>
```

这是最常见的也是最推荐的引入 CSS 的方式。使用这种方式，所有的 CSS 代码只存在于单独的 CSS 文件中，所以具有良好的可维护性。并且所有的 CSS 代码只存在于 CSS 文件中，CSS 文件会在第一次加载时引入，以后切换页面时只需加载 HTML 文件即可。

##### 方式四：导入样式

```HTML
<style>
    @import url(style.css);
</style>
```

或者写在css样式中

```CSS
@charset "utf-8";
@import url(style.css);
*{ margin:0; padding:0;}
.notice-link a{ color:#999;}
```

## [深入理解CSS中的层叠上下文和层叠顺序](https://www.zhangxinxu.com/wordpress/2016/01/understand-css-stacking-context-order-z-index/)

### 什么是层叠上下文和层叠水平

层叠上下文和层叠水平有一点儿抽象。我们可以吧层叠上下问想象成一张桌子，如果有另一个桌子在他旁边，则代表了另一个层叠上下文。

![img](https://images2015.cnblogs.com/blog/836049/201601/836049-20160111151452147-1090596068.png)

Stacking context 1由文件根元素构建，Stacking context 2和Stacking context 3是在Stacking context 1的层叠水平之上，并且也创建的自己的层叠上下文，里面有一个新的层叠水平。

我们所创建的每个网页都有一个默认的层叠上下文，层叠上下文的根（上面假设的桌子）就是HTML元素，所有其他元素都会在这个默认的层叠上下文上占据一个层叠水平，或高或低。

###层叠顺序

![img](https://images2015.cnblogs.com/blog/836049/201601/836049-20160111152050757-1485429019.png)

- 背景和边框：建立层叠上下文元素的背景和边框。层叠中的最低级
- 负 Z-index：`z-index` 为负的后代元素建立的层叠上下文
- 块级盒：文档流内非行内级非定位后代元素
- 浮动盒：非定位浮动元素（即排除了position:absolute/relative/fixed的浮动盒）
- 行内盒：文档流内行内级非定位后代元素
- Z-index: 0：定位元素。这些元素建立了新层叠上下文（笔者注：不一定，详见后文）
- 正 Z-index：（`z-index` 为正的）定位元素。层叠的最高等级

### 层叠准则

1. **谁大谁上：**当具有明显的层叠水平标示的时候，如识别的z-indx值，在同一个层叠上下文领域，层叠水平值大的那一个覆盖小的那一个。通俗讲就是官大的压死官小的。
2. **后来居上：**当元素的层叠水平一致、层叠顺序相同的时候，在DOM流中处于后面的元素会覆盖前面的元素。

**CSS3与新时代的层叠上下文**

以下情况会产生新的层叠上下文：

- 根元素（HTML）
- 绝对或相对定位且 `z-index` 值不为 `auto`
- 一个伸缩项目 `Flex Item`，且 `z-index` 值不为 `auto`，即父元素 `display: flex|inline-flex`
- 元素的 `opacity` 属性值小于 1
- 元素的 `transform` 属性值不为 `none`
- 元素的 `mix-blend-mode` 属性值不为 `normal`
- 元素的 `filter` 属性值不为 `normal`
- 元素的 `isolation` 属性值为 `isolate`
- `position: fixed`
- `will-change` 中指定了上述任意属性，即便你没有直接定义这些属性
- 元素的 `-webkit-overflow-scrolling` 属性值为 `touch`





[Measuring Element Dimension and Location with CSSOM in Windows Internet Explorer 9](https://docs.microsoft.com/en-us/previous-versions//hh781509(v=vs.85))

```js
scrollTop + clientHeight >= scrollHeight
```

![Vertical sizing and positioning values for a child element](https://docs.microsoft.com/en-us/previous-versions//images/hh781509.ie9_positioning1%28en-us%2cvs.85%29.png)

![Vertical sizing and mouse coordinate positions affected by CSS transforms](https://docs.microsoft.com/en-us/previous-versions//images/hh781509.ie9_positioning2%28en-us%2cvs.85%29.png)

![All vertical mouse coordinates and viewport offsets on an untransformed element](https://docs.microsoft.com/en-us/previous-versions//images/hh781509.ie9_positioning3%28en-us%2cvs.85%29.png)



#### offset 和 getBoundingClientRect

Offset 是相对的

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>offSet</title>
  <style>
    * {
      margin: 0;
      padding: 0;
    }
    .wrapper {
      /* offset 是相对 position */
      /* position: relative; */
      overflow-y: scroll;
      height: 300px;
      margin: 100px;
    }
    .bound {
      padding: 100px;
      height: 1000px;
      background-color: skyblue;
    }
    .offset {
      height: 100px;
      background-color: aquamarine;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="bound"></div>
  </div>
  <script>
    const bound = document.getElementsByClassName('bound')[0]
    const wrapper = document.getElementsByClassName('wrapper')[0]

    console.log(bound.getBoundingClientRect())
    console.log(bound.offsetLeft)
  </script>
</body>
</html>
```



## [权重 & 优先级](https://zhuanlan.zhihu.com/p/31765252)

### 优先级算法

就近原则：同权重或选择器指向非目标元素情况下样式离定义越近者为准

!important > 行内样式 > 内联 > 外联 [CSS 放置位置]

!important > id > class > tag [选择器计算权重]



### 各选择器计算性值

* 1000 -> 行联样式
* 100 -> id 选择器
* 10 -> 类选择器/属性/伪类
* 1 -> 元素 / 伪元素
* 【* -> 通配选择器
* !important -> 高于一切



行内&内联

```html
<style type="text/css">
  div{
    background: #f00;
  }
  #wrap1{
    background: #f00;
  }
</style>
<div id="wrap" style="background:#058;"></div>  //被应用
<div id="wrap1" style="background:#058;"></div>  //被应用
```

!important高于一切

```html
<style type="text/css">  //内联与行内
  div{
  	background: #f00 !important;  //被应用
  }
</style>
<div style="background:#058;"></div>
```

外联&内联

```css
div{border:10px solid #000};/*外联*/
div{border:5px solid #00f};/*内联 被应用*/

/*这里有一种特殊情况,假如上面代码改成*/

#wrap{border:10px solid #000};/*外 被应用*/
div{border:5px solid #00f}/*内*/
```



### 考一考【全是坑=_=，建议先做再看解析】

初级

```css
(1)body #content .data img:hover{} 权重是多少？
(2)下面哪个权重大？
#a-01{color:#000}
a[id="a-01"]{color:#f00}

(1)1+100+10+1+10=122 即为122
(2)#a-01=100  a[id="a-01"]>10+1=11  故左边的被应用
```

入门

```html
(1)文字颜色会是什么？
html结构
<div id="box">
  <p id="pWrap" class="pWrap">
    <span>文字</span>
  </p>
</div>
样式
div p{color:red};
#box{color:blue}

(2)文字颜色会是什么？
html结构
<div id="box1" class="spec1">
  <div id="box2" class="spec2">
    <div id="box3" class="spec3">
      <p>文字</p>
    </div>
  </div>
</div>
样式
#box div.spec2 p,#box1 #box2 p{color:blue}
#box1 #box3 p{color:green}

(1)选中非目标元素(span)情况下，离目标越近者优先，即为 【red】
(2)同等权重下,靠近目标的优先 既为【green】
```

进阶

```css
(1)第二个span会是什么颜色？
html结构
<span class="red">我就是来混淆的</span>
<span class="red yellow">我会是什么颜色呢？</span>
样式
span.red{color:red}
.yellow{color:yellow}

(2)span应为什么颜色？【这一题测的时候打错，刚好有个坑，就顺带提一下】
html结构
<span class="red">文字</span>
样式
.red[class="red"]{color:blue}
span.red{color:red}

(1)选中统一目标元素，权重不同，权重大的优先显示，故为【red】
(2)该题中，实际运用中基本碰不到的选择器情况，.red[class="red"]不能看作是1个，而是要按照
一个是类名，一个是属性选择器去计算性值，即为20，第二个为11。 故答案是【blue】
```



### 拓展

![img](https://pic2.zhimg.com/80/v2-49860f91cb08802671fa180791384835_hd.jpg)

![img](https://pic4.zhimg.com/80/v2-2c6468fd18a6ae354359494220a5b4ef_hd.jpg)

![img](https://pic2.zhimg.com/80/v2-05bd9efd18d6172c44fae33e97460871_hd.jpg)

![img](https://pic1.zhimg.com/80/v2-b5d0c619623f67d6490c75bc8107600c_hd.jpg)

**↑注意:not()伪类选择器并没有增加权重，而是括号里面的元素增加了权重。**

![img](https://pic3.zhimg.com/80/v2-2331936c83bb657224fa229986cf1daa_hd.jpg)

![img](https://pic1.zhimg.com/80/v2-43248ff94b0cc50d2d43aeb1d944cee8_hd.jpg)

### 总结

- 样式指向同一元素，权重规则生效，**权重大的被应用**
- 样式指向同一元素，权重规则生效，**权重相同时，就近原则生效，后面定义的被应用**
- 样式不指向同一元素时，权重规则失效，就近原则生效，离目标元素近的定义被应用



## Rem / Em 的使用和区别

浏览器根据谁来转化为 px 值，能够控制元素整体放大缩小，而不是固定大小

### Rem

根据页面根元素 HTML 的字体大小

根据 **根元素（root）** 大小做缩放

### Em

父元素的字体大小可影响 em 值，因为继承，但继承效果只能被明确的字体单位覆盖 px / vw

根据 **某个元素（element）** 大小做缩放

### 不适用Rem 和 Em 的情况

* 多列布局
* 元素严格不可缩放



## 盒模型布局

### 盒模型

![image-20200209213313194](/Users/zhangshuai/Library/Application Support/typora-user-images/image-20200209213313194.png)

#### 属性

* margin
* border
* padding
* content

#### 内容区域

content-area

#### 盒模型的宽和高

margin + border + padding + width / height

#### IE盒模型 / W3C盒模型

所有的盒模型，只要没有添加 doctype，均处于怪异模式

IE盒模型宽度/高度：width = content

W3C盒模型宽度/高度：widht = content + padding + border

```css
box-sizing: border-box / content-box;
```

#### JS 如何获取盒模型对应的宽高

```js
dom.style.width / height
dom.currentStyle.width / height // IE 支持
window.getComputedStyle(dom).width / height
dom.getBoundingClientRect().width / height
```



### BFC(Block Formatting Contexts): 块级格式化上下文

Block Formatting Contexts就是页面上的一个隔离的渲染区域，容器里面的子元素不会在布局上影响到外面的元素，反之也是如此。

#### 如何产生BFC？

* float is not none
* position is absolute & fixed
* display is table-cell,table-caption,inline-block,flex,inline-flex
* overflow is not visible
* block-level box

#### 特性

* 内部的Box会在**垂直方向**，一个接一个地放置。
* Box垂直方向的距离由margin决定。属于同一个BFC的两个相邻Box的margin会发生重叠每个元素的margin box的左边，与包含块border box的左边相接触(对于从左往右的格式化，否则相反)。即使存在浮动也是如此。
* BFC的区域不会与float box重叠。
* BFC就是页面上的一个隔离的独立容器，容器里面的子元素不会影响到外面的元素。反之也如此。
* 计算BFC的高度时，浮动元素也参与计算。　　



### IFC(Inline Formatting Contexts): 内联格式化上下文

IFC的line box（线框）高度由其包含行内元素中最高的实际高度计算而来（不受到竖直方向的padding/margin影响)



### FFC(Flex Formatting Contexts): 自适应格式化上下文

display值为flex或者inline-flex的元素将会生成自适应容器（flex container）

#### 父容器

* flex-flow: <flex-direction> | <flex-wrap>
  * flex-direction: row / row-reverse / column / column-reverse
  * flex-wrap: nowrap / wrap / wrap-reverse
* Justify-content: flex-start / flex-end / space-around / space-between
* Align-item: flex-start / flex-end / space-around / space-between / baseline / strentch
* Align-content: strentch

#### 子容器

* Order: <flex-grow> | <flex-shrink> | <flex-basis>
  * Flex-grow: <number> 伸缩比例
  * Flex-shink: <number> 弹性收缩比例
  * Flex-basis: <length> | auto 不伸缩情况下的原始尺寸
* align-self: auto 继承父容器的 align-item 属性，若父元素没有，等同于 strentch



### GFC(GridLayout Formatting Contexts): 网格布局格式化上下文

当为一个元素设置display值为grid的时候，此元素将会获得一个独立的渲染区域，我们可以通过在网格容器（grid container）上定义

* Grid Lines: 网格的水平和垂直的分界线，一个网格线存在行或列的两侧
* Grid Track: 两条相邻网格线之间的空间，表格中行或列
* Grid Cell: 四条网格线之间的空间
* Grid Area: 任意四条网格线组成的空间（可能包含多个单元格）



网格定义行（grid definition rows）

网格定义列（grid definition columns）

网格项目（grid item）

* 网格行（grid row）
* 网格列（grid columns）

#### grid-template-areas

```css
.container {
  grid-template-areas:
  "header header header"
  "aside-1 section aside-2"
  "footer footer footer";
}

header {
	grid-area: header;
}
```

#### grid-template-columns / rows

```css
.container {
  display: grid;
  grid-gap: 20px;
  height: 100vh;
  grid-template-columns:
    repeat(2, 100px) auto auto;
}
.grid-item {
  background-color: skyblue;
}
.grid-item:nth-of-type(2) {
  grid-row-start: span 2;
}
.grid-item:nth-of-type(6) {
  /* grid-column-start: 3; */
  /* grid-column-end: 5; */
  /* grid-column-end: span 2; */
  grid-column: 3 / span 2;
}
```



### CSS实现一个持续的动画效果

#### animation

- animation-name: 动画名称
- animation-duration: 动画时长
- animation-timing-function: 动画执行方式
- animation-delay: 动画延迟执行时间
- animation-iteration-count: 动画执行次数
- animation-direction: 是否反向执行动画
- animation-fill-mode: 动画执行前后的样式

```css
.box {
  width: 200px;
  height: 200px;
  background-color: aqua;
  position: absolute;
  left: 0;
  top: 0;
  animation: test 3s linear 2s infinite;
}
@keyframes test {
  from {
  }
  to {
    width: 50px;
    height: 50px;
    background-color: red;
    opacity: 0.5;
    left: 500px;
    top: 500px;
  }
}
```



### JS (requestAnimationFrame)

```css
#anim {
  position: absolute;
  left: 0px;
  width: 150px;
  height: 150px;
  line-height: 150px;
  background: aqua;
  color: white;
  border-radius: 10px;
  padding: 1em;
}
<div id="anim"> Click here to start animation</div>
```



```js
// 兼容性处理
window.requestAnimFrame = (function() {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback, element) {
      window.setTimeout(callback, 1000 / 60)
    }
  )
})()

var elem = document.getElementById('anim')
var startTime = undefined

function render(time) {
  time = Date.now()
  if (startTime === undefined) {
    startTime = time
  }
  elem.style.left = ((time - startTime) / 10) % 300 + 'px'
  elem.style.top = ((time - startTime) / 10) % 300 + 'px'
  elem.style.borderRadius = ((time - startTime) / 10) % 300 + 'px'
  elem.style.opacity = Math.floor((time - startTime / 100)) % 2 === 0 ? 1 : 0.3
}

elem.onclick = function() {
  (function animloop() {
    render()
    requestAnimFrame(animloop, elem)
  })()
}
```

