# Mobile

## [移动端高清、多屏适配方案](https://www.cnblogs.com/lovesueee/p/4618454.html)

### 一些概念

在进行具体的分析之前，首先得知道下面这些关键性基本概念(术语)。

##### 物理像素(physical pixel)

一个物理像素是显示器(手机屏幕)上最小的物理显示单元，在操作系统的调度下，每一个设备像素都有自己的颜色值和亮度值。

##### 设备独立像素(density-independent pixel)

设备独立像素(也叫密度无关像素)，可以认为是计算机坐标系统中得一个点，这个点代表一个可以由程序使用的虚拟像素(比如: css像素)，然后由相关系统转换为物理像素。

所以说，物理像素和设备独立像素之间存在着一定的`对应关系`，这就是接下来要说的`设备像素比`。

##### 设备像素比(device pixel ratio )

设备像素比(简称dpr)定义了物理像素和设备独立像素的对应关系，它的值可以按如下的公式的得到：

```
设备像素比 = 物理像素 / 设备独立像素 // 在某一方向上，x方向或者y方向
```

在javascript中，可以通过`window.devicePixelRatio`获取到当前设备的dpr。

在css中，可以通过`-webkit-device-pixel-ratio`，`-webkit-min-device-pixel-ratio`和 `-webkit-max-device-pixel-ratio`进行媒体查询，对不同dpr的设备，做一些样式适配(这里只针对webkit内核的浏览器和webview)。

------

综合上面几个概念，一起举例说明下：

以`iphone6`为例：

1. 设备宽高为`375×667`，可以理解为设备独立像素(或css像素)。
2. dpr为2，根据上面的计算公式，其物理像素就应该`×2`，为`750×1334`。

用一张图来表现，就是这样(原谅我的盗图)：

![retina vs normal](https://img.alicdn.com/tps/TB1uWfJIpXXXXaoXXXXXXXXXXXX.gif)

上图中可以看出，对于这样的css样式：

```
width: 2px;
height: 2px;
```

在不同的屏幕上(普通屏幕 vs retina屏幕)，css像素所呈现的大小(物理尺寸)是一致的，不同的是1个css像素所对应的物理像素个数是不一致的。

在普通屏幕下，1个css像素 对应 1个物理像素(`1:1`)。
在retina 屏幕下，1个css像素对应 4个物理像素(`1:4`)。

------

##### 位图像素

一个位图像素是栅格图像(如：png, jpg, gif等)最小的数据单元。每一个位图像素都包含着一些自身的显示信息(如：显示位置，颜色值，透明度等)。

------

谈到这里，就得说一下，retina下图片的展示情况？

理论上，1个位图像素对应于1个物理像素，图片才能得到完美清晰的展示。

在普通屏幕下是没有问题的，但是在retina屏幕下就会出现位图像素点不够，从而导致图片模糊的情况。

用一张图来表示：

![retina image blurry](https://img.alicdn.com/tps/TB12ALnIpXXXXb1XVXXXXXXXXXX.jpg)

如上图：对于dpr=2的retina屏幕而言，1个位图像素对应于4个物理像素，由于单个位图像素不可以再进一步分割，所以只能就近取色，从而导致图片模糊(注意上述的几个颜色值)。

所以，对于图片高清问题，比较好的方案就是`两倍图片`(2x)。

如：200×300(css pixel)img标签，就需要提供400×600的图片。

如此一来，位图像素点个数就是原来的`4`倍，在retina屏幕下，`位图像素点个数`就可以跟`物理像素点个数`形成 `1 : 1`的比例，图片自然就清晰了(这也解释了之前留下的一个问题，为啥视觉稿的画布大小要`×2`？)。

这里就还有另一个问题，如果普通屏幕下，也用了`两倍图片`，会怎样呢？

很明显，在普通屏幕下，200×300(css pixel)img标签，所对应的物理像素个数就是`200×300`个，而`两倍图片`的位图像素个数则是`200×300*4`，所以就出现一个物理像素点对应4个位图像素点，所以它的取色也只能通过一定的算法(显示结果就是一张只有原图像素总数四分之一，我们称这个过程叫做`downsampling`)，肉眼看上去虽然图片不会模糊，但是会觉得图片缺少一些锐利度，或者是有点色差(但还是可以接受的)。

用一张图片来表示：

![enter image description here](https://img.alicdn.com/tps/TB1kFHnIpXXXXclXVXXXXXXXXXX.jpg)

------

针对上面的两个问题，我做了一个demo(内网访问)[狂戳这里](http://groups.alidemo.cn/cm/xx-retina-test/build/p/downsample/index.html)。

![retina image diff](https://img.alicdn.com/tps/TB11KbzIpXXXXXcXFXXXXXXXXXX.png)

demo中，100×100的图片，分别放在100×100，50×50，25×25的img容器中，在retina屏幕下的显示效果。

`条形图`，通过放大镜其实可以看出边界像素点取值的不同：

- 图1，就近取色，色值介于红白之间，偏淡，图片看上去会模糊(可以理解为图片拉伸)。
- 图2，没有就近取色，色值要么是红，要么是白，图片看上去很清晰。
- 图3，就近取色，色值介于红白之间，偏重，图片看上去有色差，缺少锐利度(可以理解为图片挤压)。

`爱字图`，可以通过看文字"爱"来区分图片模糊还是清晰。



### 原理

根据屏幕设备的 dpr，动态设置 HTML 的 font-size

###viewport && rem

```js
'use strict';

/**
 * @param {Boolean} [normal = false] - 默认开启页面压缩以使页面高清;
 * @param {Number} [baseFontSize = 100] - 基础fontSize, 默认100px;
 * @param {Number} [fontscale = 1] - 有的业务希望能放大一定比例的字体;
 */
const win = window;
export default win.flex = (normal, baseFontSize, fontscale) => {
  const _baseFontSize = baseFontSize || 100;
  const _fontscale = fontscale || 1;

  const doc = win.document;
  const ua = navigator.userAgent;
  const matches = ua.match(/Android[\S\s]+AppleWebkit\/(\d{3})/i);
  const UCversion = ua.match(/U3\/((\d+|\.){5,})/i);
  const isUCHd = UCversion && parseInt(UCversion[1].split('.').join(''), 10) >= 80;
  const isIos = navigator.appVersion.match(/(iphone|ipad|ipod)/gi);
  let dpr = win.devicePixelRatio || 1;
  if (!isIos && !(matches && matches[1] > 534) && !isUCHd) {
    // 如果非iOS, 非Android4.3以上, 非UC内核, 就不执行高清, dpr设为1;
    dpr = 1;
  }
  const scale = normal ? 1 : 1 / dpr;

  let metaEl = doc.querySelector('meta[name="viewport"]');
  if (!metaEl) {
    metaEl = doc.createElement('meta');
    metaEl.setAttribute('name', 'viewport');
    doc.head.appendChild(metaEl);
  }
  metaEl.setAttribute('content', `width=device-width,user-scalable=no,initial-scale=${scale},maximum-scale=${scale},minimum-scale=${scale}`);
  doc.documentElement.style.fontSize = normal ? '50px' : `${_baseFontSize / 2 * dpr * _fontscale}px`;
};
```



## 1px on Retina

[怎么画一条0.5px的边](https://zhuanlan.zhihu.com/p/34908005)

![img](https://pic1.zhimg.com/80/v2-a8aa225bed227f081ed56fd302aa5e84_hd.jpg)

### 0.5px

```css
// IOS8 hairline
.hairline(@color, @style:solid) {
    @media (-webkit-min-device-pixel-ratio: 2) {
        border: 0.5px @style @color;
    }
}
```

优点：

- “原生”，支持圆角~

缺点：

- 目前只有`IOS8+`才支持，在IOS7及其以下、安卓系统都是显示为0px

### background-image

CSS渐变

```css
background-image:
    -webkit-linear-gradient(270deg, @top, @top 50%, transparent 50%),
    -webkit-linear-gradient(180deg, @right, @right 50%, transparent 50%),
    -webkit-linear-gradient(90deg, @bottom, @bottom 50%, transparent 50%),
    -webkit-linear-gradient(0, @left, @left 50%, transparent 50%);
background-image:
    linear-gradient(180deg, @top, @top 50%, transparent 50%),
    linear-gradient(270deg, @right, @right 50%, transparent 50%),
    linear-gradient(0deg, @bottom, @bottom 50%, transparent 50%),
    linear-gradient(90deg, @left, @left 50%, transparent 50%);
```

优点：

- 可以实现单个、多个边框，大小、颜色可以配置
- 对比下面介绍的其他方法，这个方法兼容性比较好，实现效果也相对不错

缺点：

- 很明显代码特别长
- 无法实现圆角
- 使用时可能需要配合 `padding`，如设置子元素的背景可能会挡住父元素所设置的1px软图片
- 如果有背景颜色，要写成`background-color`，不然会不小心覆盖掉
- 对于非 `retina` 屏，需要写 `border: 1px solid #f00` 进行适配

### border-image

```css
.border-image-1px {
    border-width: 1px 0px;
    -webkit-border-image: url(border.png) 2 0 stretch;
    border-image: url(border.png) 2 0 stretch;
}
```

优点：

- 无

缺点：

- 大小、颜色更改不灵活
- 放到PS里面看边框，是有点模糊的(因为带有颜色部分是1px，在retina屏幕上拉伸到2px肯定会有点模糊)

### box-shadow

```css
.shadow {
    -webkit-box-shadow:0 1px 1px -1px rgba(255, 0, 0, 0.5);
    box-shadow:0 1px 1px -1px rgba(255, 0, 0, 0.5);
}
```

优点

* 基本所有场景都能满足，包含圆角的button，单条，多条线，

缺点

* 颜色不好处理， 黑色 rgba(0,0,0,1) 最浓的情况了。有阴影出现，不好用。

### scale

```css
.transform-scale {
    position: relative;
    &:after,
    &:before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        height: 1px;
        width: 100%;
        -webkit-transform: scaleY(0.5);
        transform: scaleY(0.5);
        -webkit-transform-origin: 0 0;
        transform-origin: 0 0;
        background: #f00;
    }
    &:after {
        top: auto;
        bottom: 0;
        -webkit-transform-origin: 0 100%;
        transform-origin: 0 100%;
    }
}
```

优点：

- 实现单线条简单
- 大小、颜色可以配置

缺点：

- 无法实现圆角
- 四条边框比较纠结
- 依赖DOM，可能会与已有样式冲突，如常用的`clearfix`

### viewport && rem|vw

如在`devicePixelRatio=2`下设置``：

```
<meta name="viewport" content="initial-scale=0.5, maximum-scale=0.5, minimum-scale=0.5, user-scalable=no">
```

再设置`rem`，假设header的高度是30px(设备像素比为1的情况)：

```css
html {
    font-size: 20px;
}
header {
    height: 3rem;
}
```

### svg

svg的1像素还真的是1物理像素。

```html
<style>
    .test { width: 100px; height: 100px; margin: 10px; }
    .test1 { border: 1px solid #000; }
    .test2 { background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'><line x1='0' y1='0' x2='100%' y2='0' stroke='black' stroke-width='1'/><line x1='0' y1='0' x2='0' y2='100%' stroke='black' stroke-width='1'/><line x1='100%' y1='0' x2='100%' y2='100%' stroke='black' stroke-width='1'/><line x1='0' y1='100%' x2='100%' y2='100%' stroke='black' stroke-width='1'/></svg>") ; }
</style>
<div class="test test1"></div>
<div class="test test2"></div>
```



## Touch 事件

* touchstart
* touchmove
* touchend
* touchcancel

###Event

1. Touches: 表示当前跟踪的触摸操作的 touch 对象的数组
2. targetTouches: 特定于事件目标的 Touch 对象的数组
3. changeTouches: 上次触摸以来发生改变的 touch 对象的数组

### 每个 touch 对象的包含属性

[`Touch.identifier`](https://developer.mozilla.org/zh-CN/docs/Web/API/Touch/identifier)

`此 Touch 对象的唯一标识符`. 一次触摸动作(我们指的是手指的触摸)在平面上移动的整个过程中, 该标识符不变. 可以根据它来判断跟踪的是否是同一次触摸过程. **只读属性.**

**[`Touch.screenX`](https://developer.mozilla.org/zh-CN/docs/Web/API/Touch/screenX)**

触点相对于屏幕左边沿的的X坐标. **只读属性.**

**[`Touch.screenY`](https://developer.mozilla.org/zh-CN/docs/Web/API/Touch/screenY)**

触点相对于屏幕上边沿的的Y坐标. **只读属性.**

**[`Touch.clientX`](https://developer.mozilla.org/zh-CN/docs/Web/API/Touch/clientX)**

触点相对于可见视区([visual viewport](http://www.quirksmode.org/mobile/viewports2.html))左边沿的的X坐标. 不包括任何滚动偏移. **只读属性.**

**[`Touch.clientY`](https://developer.mozilla.org/zh-CN/docs/Web/API/Touch/clientY)**

触点相对于可见视区([visual viewport](http://www.quirksmode.org/mobile/viewports2.html))上边沿的的Y坐标. 不包括任何滚动偏移. **只读属性.**

[`Touch.pageX`](https://developer.mozilla.org/zh-CN/docs/Web/API/Touch/pageX)

触点相对于HTML文档左边沿的的X坐标. `当存在水平``滚动的``偏移时, 这个值包含了水平滚动的偏移`. **只读属性.**

[`Touch.pageY`](https://developer.mozilla.org/zh-CN/docs/Web/API/Touch/pageY)

触点相对于HTML文档上边沿的的Y坐标. `当存在垂直滚动的偏移时, 这个值包含了垂直滚动的偏移`. **只读属性.**

[`Touch.radiusX`](https://developer.mozilla.org/zh-CN/docs/Web/API/Touch/radiusX)

能够包围用户和触摸平面的接触面的最小椭圆的水平轴(X轴)半径. 这个值的单位和` screenX 相同. `**只读属性.**

[`Touch.radiusY`](https://developer.mozilla.org/zh-CN/docs/Web/API/Touch/radiusY)

能够包围用户和触摸平面的接触面的最小椭圆的垂直轴(Y轴)半径. 这个值的单位和` screenY 相同. `**只读属性.**

[`Touch.rotationAngle`](https://developer.mozilla.org/zh-CN/docs/Web/API/Touch/rotationAngle)

`它是这样一个角度值：由radiusX` 和 `radiusY` 描述的正方向的椭圆，需要通过顺时针旋转这个角度值，才能最精确地覆盖住用户和触摸平面的接触面. **只读属性****.**

[`Touch.force`](https://developer.mozilla.org/zh-CN/docs/Web/API/Touch/force)

手指挤压触摸平面的压力大小, 从0.0(没有压力)到1.0(最大压力)的浮点数. **只读属性.**

```
Touch.target
```

当这个触点最开始被跟踪时(在 `touchstart` 事件中), 触点位于的HTML元素. 哪怕在触点移动过程中, 触点的位置已经离开了这个元素的有效交互区域, 或者这个元素已经被从文档中移除. 需要注意的是, 如果这个元素在触摸过程中被移除, 这个事件仍然会指向它, 但是不会再冒泡这个事件到 `window` 或 `document` 对象. 因此, 如果有元素在触摸过程中可能被移除, 最佳实践是将触摸事件的监听器绑定到这个元素本身, 防止元素被移除后, 无法再从它的上一级元素上侦测到从该元素冒泡的事件. **只读属性.**



## 300ms Click Delay

移动浏览器 会在 `touchend` 和 `click` 事件之间，等待 300 - 350 ms，判断用户是否会进行双击手势用以缩放文字。

### 解决方案

#### 禁用缩放

- Chrome on Android (all versions)
- iOS 9.3

```
<meta name="viewport" content="user-scalable=no" />
```

或者

```
html {
  touch-action: manipulation;
}
```

- IE on Windows Phone

```
html {
  touch-action: manipulation; // IE11+
  -ms-touch-action: manipulation; // IE10
}
```

####不禁用缩放

- Chrome 32+ on Android
- iOS 9.3

```
<meta name="viewport" content="width=device-width" />
```

经测试，如果不添加 `width=device-width` 不管是 Android 还是 iOS 在已修复的版本中仍然会出现延时的问题。



### Webview

#### andorid

[如何设计一个优雅健壮的 Android WebView？](https://juejin.im/post/5a94f9d15188257a63113a74)

#### iOS

WKWebView: iOS 9.3 之前 WKWebView 仍然是存在 300ms 延迟的问题的

### 事件顺序

如果浏览器因单个用户输入而触发触摸和鼠标事件，则浏览器必须在任何鼠标事件之前触发`touchstart`。因此，如果应用程序不希望在特定触摸`target` 元素上触发鼠标事件，则元素的触摸事件处理程序应调用[`preventDefault()`](https://developer.mozilla.org/zh-CN/docs/Web/API/Event/preventDefault)并且不会调度其他鼠标事件。

虽然触摸和鼠标事件的特定顺序是根据实际情况而定的，但标准表明事件执行顺序是固定的：对于单个输入：

- `touchstart`
- Zero or more `touchmove` events, depending on movement of the finger(s)
- `touchend`
- `mousemove`
- `mousedown`
- `mouseup`
- `click`

如果 `touchstart`, `touchmove` 或者 `touchend` 在触摸的过程中触发了touchcancel事件，后面的鼠标事件将不会被触发，由此产生的事件序列只是:

- `touchstart`
- Zero or more `touchmove` events, depending on movement of the finger(s)
- `touchend`

### [FastClick]([fastclick解析与ios11.3相关bug原因分析](https://segmentfault.com/a/1190000015234652))

**解决300ms延迟**和**点击穿透**

#### 原理

移动端，当用户点击屏幕时，会依次触发

* `touchstart`
* `touchmove`(0 次或多次)
* `touchend`
* `mousemove`
* `mousedown`
* `mouseup`
* `click`



 `touchmove` 。只有当手指在屏幕发生移动的时候才会触发 `touchmove` 事件。

在 `touchstart` ，`touchmove` 或者 `touchend` 事件中的任意一个调用 `event.preventDefault`，`mouse` 事件 以及 `click` 事件将不会触发。

fastClick 在 `touchend` 阶段 调用 `event.preventDefault`，然后通过 `document.createEvent` 创建一个 `MouseEvents`，然后 通过 `eventTarget.dispatchEvent` 触发对应目标元素上绑定的 `click` 事件。

![图片描述](https://segmentfault.com/img/bVbb5nj?w=836&h=792)



## 下拉刷新

* 监听原生 touchstart 事件，记录初始位置的值

* 监听原生 touchmove 事件，记录并计算当前位置值与初始位置的差值

  大于 0 表示向下拉动，并借助 CSS3 的 translateY 属性使元素跟随手势向下滑动对应的差值，同时设置一个允许活动的最大值

* 监听原生的 touchend 事件，若此时元素滑动到最大值，触发 callback，同时将 translateY 重设为 0，元素回到初始位置

```html
<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Document</title>
	<style type="text/css">
		html,
		body,
		header,
		div,
		main,
		p,
		span,
		ul,
		li {
			margin: 0;
			padding: 0;
		}

		#refreshContainer li {
			background-color: #eee;
			margin-bottom: 1px;
			padding: 20px 10px;
		}

		.refreshText {
			position: absolute;
			width: 100%;
			line-height: 50px;
			text-align: center;
			left: 0;
			top: 0;
		}
	</style>
</head>

<body>
	<main>
		<p class="refreshText"></p>
		<ul id="refreshContainer">
			<li>111</li>
			<li>222</li>
			<li>333</li>
			<li>444</li>
			<li>555</li>
			<li>666</li>
			<li>777</li>
			<li>888</li>
			<li>999</li>
			<li>000</li>
			<li>111</li>
			<li>222</li>
			<li>333</li>
			<li>444</li>
			<li>555</li>
		</ul>
	</main>

	<script type="text/javascript">
		(function (window) {
			var element = document.getElementById('refreshContainer'),
				refreshText = document.querySelector('.refreshText'),
				startPos = 0,
				transitionHeight = 0;

			element.addEventListener('touchstart', function (e) {
				console.log('初始位置：', e.touches[0].pageY);
				startPos = e.touches[0].pageY;
				element.style.position = 'relative';
				element.style.transition = 'transform 0s';
			}, false);

			element.addEventListener('touchmove', function (e) {
				console.log('当前位置：', e.touches[0].pageY);
				transitionHeight = e.touches[0].pageY - startPos;

				if (transitionHeight > 0 && transitionHeight < 60) {
					refreshText.innerText = '下拉刷新';
					element.style.transform = 'translateY(' + transitionHeight + 'px)';

					if (transitionHeight > 55) {
						refreshText.innerText = '释放更新';
					}
				}
			}, false);

			element.addEventListener('touchend', function (e) {
				element.style.transition = 'transform 0.5s ease 1s';
				element.style.transform = 'translateY(0px)';
				refreshText.innerText = '更新中...';

				// todo...
			}, false);
		})(window);
	</script>
</body>

</html>
```



## 上拉加载

* 获取当前滚动条 scrollTop，当前可视范围的高度值 clientHeight，文档的总高度 scrollHeight
* 当 scrollTop + clientHeight >= scrollHeight，触发 callback

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Document</title>
	<style type="text/css">
		html,
		body,
		header,
		div,
		main,
		p,
		span,
		ul,
		li {
			margin: 0;
			padding: 0;
		}

		#refreshContainer li {
			background-color: #eee;
			margin-bottom: 1px;
			padding: 20px 10px;
		}

		.refreshText {
			line-height: 50px;
			text-align: center;
		}
	</style>
</head>

<body>
	<main>
		<ul id="refreshContainer">
			<li>111</li>
			<li>222</li>
			<li>333</li>
			<li>444</li>
			<li>555</li>
			<li>111</li>
			<li>222</li>
			<li>333</li>
			<li>444</li>
			<li>555</li>
			<li>111</li>
			<li>222</li>
			<li>333</li>
			<li>444</li>
			<li>555</li>
		</ul>
		<p class="refreshText"></p>
	</main>

	<script type="text/javascript">
		(function (window) {
			// 获取当前滚动条的位置 
			function getScrollTop() {
				var scrollTop = 0;
				if (document.documentElement && document.documentElement.scrollTop) {
					scrollTop = document.documentElement.scrollTop;
				} else if (document.body) {
					scrollTop = document.body.scrollTop;
				}
				return scrollTop;
			}

			// 获取当前可视范围的高度 
			function getClientHeight() {
				var clientHeight = 0;
				if (document.body.clientHeight && document.documentElement.clientHeight) {
					clientHeight = Math.min(document.body.clientHeight, document.documentElement.clientHeight);
				} else {
					clientHeight = Math.max(document.body.clientHeight, document.documentElement.clientHeight);
				}
				return clientHeight;
			}

			// 获取文档完整的高度 
			function getScrollHeight() {
				return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
			}

			var _text = document.querySelector('.refreshText'),
				_container = document.getElementById('refreshContainer');

			var throttle = function (method, context) {
				clearTimeout(method.tId);
				method.tId = setTimeout(function () {
					method.call(context);
				}, 300);
			}

			function fetchData() {
				setTimeout(function () {
					_container.insertAdjacentHTML('beforeend', '<li>new add...</li>');
				}, 1000);
			}

			window.onscroll = function () {
				if (getScrollTop() + getClientHeight() == getScrollHeight()) {
					_text.innerText = '加载中...';
					throttle(fetchData);
				}
			};

		})(window);
	</script>
</body>
</html>
```



## [滚动穿透](https://www.cnblogs.com/padding1015/p/10568070.html)

### body无滚动 + 弹层无滚动

```css
body {
    overflow: hidden;
    position: fixed;
}
```

加了position: fixed；出现了新问题：

它会导致触发弹层后，body回滚、定位到顶部。假如用户向下翻页了几屏后，再触发弹层，整个页面就会回滚到最初的顶部，这对用户体验来说是非常不好的。

### body无滚动 + 弹层内部滚动 *[css-弹框超出滚动|真机有bug]*

JS控制弹窗的交互、body的禁止滚动

```js
btn.onclick = function () {
	// 弹层出现
	layer.style.display = 'block';
	document.body.style.overflow = 'hidden';
	document.body.style.position = 'fixed';//果然是因为加了fixed，就会自动回滚到顶部
}
var closeBtn = document.getElementById('close');
closeBtn.onclick = function () {
	// 弹层关闭
	layer.style.display = 'none';
	document.body.style.overflow = 'auto';
	document.body.style.position = 'static';
}
```

css添加弹层的超出滚动效果

```css
1 overflow-y: scroll;
2 -webkit-overflow-scrolling: touch;/* 解决在IOS上滚动惯性失效的问题 */
```

###body滚动 + 弹层无滚动 *[touchmove + e.preventDefault]*

js控制弹窗的交互、弹窗的禁止滚动

```js
btn.onclick = function () {
  layer.style.display = 'block';
  layer.addEventListener('touchmove',function(e){
    e.preventDefault();
  },false);
}
var closeBtn = document.getElementById('close');
closeBtn.onclick = function () {
  layer.style.display = 'none';
  // 弹窗关闭后，可解除所有禁止 - 懒人就不写了
}
```

局限问题：

因为touchmove被禁掉了，就会造成弹窗内部所有位置都不能响应touchmove事件，效果上就是弹窗内部不能再滚动了。

### body滚动 + 弹层内部滚动 *[touchmove + target]*

适用以下场景：

  1、body可滚动

  2、触发弹层出现的按钮可以在任意位置

  3、弹层可以滚动



解决方案：

检测touchmove事件，如果touch的目标是弹窗不可滚动区域（背景蒙层）就禁掉默认事件，反之就不做控制。

#### 但是同样的问题是，需要判断滚动到顶部和滚动到底部的时候禁止滚动。

但是同样的问题是，需要判断滚动到顶部和滚动到底部的时候禁止滚动。否则，就和第二条一样，触碰到上下两端，弹窗可滚动区域的滚动条到了顶部或者底部，依旧穿透到body，使得body跟随弹窗滚动。

所以依旧需要同样的代码，对可滚动区域的touchmove做监听：若到顶或到底，同样阻止默认事件。

需要做的事情有：

1. 预存一个全局变量targetY
2. 监听可滚动区域的touchstart事件，记录下第一次按下时的 e.targetTouches[0].clientY值，赋值给targetY
3. 后期touchmove里边获取每次的e.targetTouches[0].clientY与第一次的进行比较，可以得出用户是上滑还是下滑手势。
4. 如果手势是向上滑，且页面现在滚动的位置刚好是整个可滚动高度——弹窗内容可视区域高度的值，说明上滑到底，阻止默认事件。

同理，如果手势是向下滑，并且当前滚动高度为0说明当前展示的已经在可滚动内容的顶部了，此时再次阻止默认事件即可。

两个判断条件可以写到一个if中，用 || (或)表示即可。我这里为了代码可读性，分开写了：

```js
if (sTop <= 0 && NewTargetY - targetY > 0 && '鼠标方向向下-到顶') {
	// console.log('条件1成立：下拉页面到顶');
	e.preventDefault();
} else if (sTop >= sH - lyBoxH && NewTargetY - targetY < 0 &&
'鼠标方向向上-到底') {
	// console.log('条件2成立：上翻页面到底');
	e.preventDefault();
}
```



```js
btn.onclick = function () {
  layer.style.display = 'block';
  layer.addEventListener('touchmove', function (e) {
    e.stopPropagation();
    if (e.target == layer) {
      // 让不可以滚动的区域不要滚动
      console.log(e.target, '我就是一个天才！！！');
      e.preventDefault();
    }
  }, false);
  var targetY = null;
  layerBox.addEventListener('touchstart', function (e) {
    //clientY-客户区坐标Y 、pageY-页面坐标Y
    targetY = Math.floor(e.targetTouches[0].clientY);
  });
  layerBox.addEventListener('touchmove', function (e) {
    // 检测可滚动区域的滚动事件，如果滑到了顶部或底部，阻止默认事件
    var NewTargetY = Math.floor(e.targetTouches[0].clientY),//本次移动时鼠标的位置，用于计算
      sTop = layerBox.scrollTop,//当前滚动的距离
      sH = layerBox.scrollHeight,//可滚动区域的高度
      lyBoxH = layerBox.clientHeight;//可视区域的高度
    if (sTop <= 0 && NewTargetY - targetY > 0 && '鼠标方向向下-到顶') {
      // console.log('条件1成立：下拉页面到顶');
      e.preventDefault();
    } else if (sTop >= sH - lyBoxH && NewTargetY - targetY < 0 &&
      '鼠标方向向上-到底') {
      // console.log('条件2成立：上翻页面到底');
      e.preventDefault();
    }
  }, false);
}
```

```js
var closeBtn = document.getElementById('close');
closeBtn.onclick = function () {
  layer.style.display = 'none';
  // 弹窗关闭后，可解除所有禁止 - 懒人就不写了
}
```

### body滚动 + 弹层内部滚动 *[js-代码模拟上下滑动手势效果]*

简单粗暴地利用JS的touchstart、touchmove、touchend等事件，手动写一个自定义滚动效果。

### body滚动 + 弹层内部滚动 *[css+js-记录滚动位置]*

记录用户打开弹窗前所滚动页面的位置，在弹层展开的时候赋给body在css中的top值，等关闭弹层的时候，再把这个值赋值给body在js中的scrollTop值，还原body的滚动位置。

```js
/* 动态获取当前页面的滚动位置 */
function getScrollOffset() {
  /*
    * @Author: @Guojufeng
    * @Date: 2019-01-31 10:58:54
    * 获取页面滚动条的距离-兼容写法封装
    */
  if (window.pageXOffset) {
    return {
      x: window.pageXOffset,
      y: window.pageYOffset
    }
  } else {
    return {
      x: document.body.scrollLeft || document.documentElement.scrollLeft,
      y: document.body.scrollTop || document.documentElement.scrollTop
    }
  }
};

var scrollT = null;
var LastScrollT = 0;
window.onscroll = function (e) {
  scrollT = getScrollOffset().y;//滚动条距离
}
```



```js
btn.onclick = function () {
  layer.style.display = 'block';
  // 在这里获取滚动的距离，赋值给body，好让他不要跳上去。
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = -scrollT + 'px';//改变css中top的值，配合fixed使用
  // 然后找个变量存一下刚才的scrolltop，要不然一会重新赋值，真正的scrollT会变0
  LastScrollT = scrollT;
}
var closeBtn = document.getElementById('close');
closeBtn.onclick = function () {
  console.log(LastScrollT)
  layer.style.display = 'none';
  document.body.style.overflow = 'auto';
  document.body.style.position = 'static';
 
  // 关闭close弹层的时候，改变js中的scrollTop值为上次保存的LastScrollT的值。并根据兼容性赋给对应的值。
  if (window.pageXOffset) {
    window.pageYOffset = LastScrollT;
  }else{
    document.body.scrollTop = LastScrollT;
    document.documentElement.scrollTop = LastScrollT;
  }
}
```



## LazyLoad

```js
/**
 * 核心原理
 * 设定一个定时器，计算每张图片是否会随着滚动条，而出现在视口（也就是浏览器中的展现网站的空白部分）中
 * 为 <img/>标签设置一个暂存图片url的自定义的属性（如 loadpic），当图片出现在视口时，再将 loadpic的值赋给图片的 src属性
 * 
 * 提升效率使用 once, throttle
 */

var imgs = document.getElementsByTagName('img')

function lazyLoad() {
  var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
  var viewportSize = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight

  for (var i = 0; i < imgs.length; i++) {
    var x = scrollTop + viewportSize - imgs[i].offsetTop
    if (x > 0) {
      imgs[i].src = imgs[i].getAttribute('loadpic')
    }
  }
}

setInterval(lazyLoad, 1000)
```

