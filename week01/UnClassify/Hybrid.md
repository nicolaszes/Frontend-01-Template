# 混合开发

## [JSBridge原理(Hybrid/React-Native/MiniApp)](https://juejin.im/post/5abca877f265da238155b6bc)

####分类

移动端混合开发中的 JSBridge，主要被应用在两种形式的技术方案上：

- 基于 Web 的 Hybrid 解决方案：例如微信浏览器、各公司的 Hybrid 方案

- 非基于 Web UI 但业务逻辑基于 JavaScript 的解决方案：例如 React-Native



#### 核心

**构建 Native 和非 Native 间消息通信的通道**，而且是 **双向通信的通道**。

所谓 **双向通信的通道**:

- JS 向 Native 发送消息: 调用相关功能、通知 Native 当前 JS 的相关状态等。

- Native 向 JS 发送消息: 回溯调用结果、消息推送、通知 JS 当前 Native 的状态等。



#### 实现原理

JavaScript 是运行在一个单独的 JS Context 中（例如，WebView 的 Webkit 引擎、JSCore）。由于这些 Context 与原生运行环境的天然隔离，我们可以将这种情况与 RPC（Remote Procedure Call，远程过程调用）通信进行类比，将 Native 与 JavaScript 的每次互相调用看做一次 RPC 调用。

JSBridge 要实现的主要逻辑就出现了：**通信调用（Native 与 JS 通信）** 和 **句柄解析调用**。



####JS 调用 Native

##### 注入 API

通过 WebView 提供的接口，向 JavaScript 的 Context（window）中注入对象或者方法，让 JavaScript 调用时，直接执行相应的 Native 代码逻辑，达到 JavaScript 调用 Native 的目的。

###### iOS 的 UIWebView

```objective-c
JSContext *context = [uiWebView valueForKeyPath:@"documentView.webView.mainFrame.javaScriptContext"];

context[@"postBridgeMessage"] = ^(NSArray<NSArray *> *calls) {
    // Native 逻辑
};
复制代码
```

前端调用方式：

```js
window.postBridgeMessage(message);
```



###### iOS 的 WKWebView(性能好)

```objective-c
@interface WKWebVIewVC ()<WKScriptMessageHandler>

@implementation WKWebVIewVC

- (void)viewDidLoad {
    [super viewDidLoad];

    WKWebViewConfiguration* configuration = [[WKWebViewConfiguration alloc] init];
    configuration.userContentController = [[WKUserContentController alloc] init];
    WKUserContentController *userCC = configuration.userContentController;
    // 注入对象，前端调用其方法时，Native 可以捕获到
    [userCC addScriptMessageHandler:self name:@"nativeBridge"];

    WKWebView wkWebView = [[WKWebView alloc] initWithFrame:self.view.frame configuration:configuration];

    // TODO 显示 WebView
}

- (void)userContentController:(WKUserContentController *)userContentController didReceiveScriptMessage:(WKScriptMessage *)message {
    if ([message.name isEqualToString:@"nativeBridge"]) {
        NSLog(@"前端传递的数据 %@: ",message.body);
        // Native 逻辑
    }
}
复制代码
```

前端调用方式：

```
window.webkit.messageHandlers.nativeBridge.postMessage(message);
```



###### Android

```java
publicclassJavaScriptInterfaceDemoActivityextendsActivity{
private WebView Wv;

    @Override
    publicvoidonCreate(Bundle savedInstanceState){
        super.onCreate(savedInstanceState);

        Wv = (WebView)findViewById(R.id.webView);     
        final JavaScriptInterface myJavaScriptInterface = new JavaScriptInterface(this);    	 
        Wv.getSettings().setJavaScriptEnabled(true);
        Wv.addJavascriptInterface(myJavaScriptInterface, "nativeBridge");
        // TODO 显示 WebView
    }

    publicclassJavaScriptInterface{
         Context mContext;

         JavaScriptInterface(Context c) {
             mContext = c;
         }

         publicvoidpostMessage(String webMessage){	    	
             // Native 逻辑
         }
     }
}
```

前端调用方式：

```javascript
window.nativeBridge.postMessage(message);
```

在 4.2 之前，Android 注入 JavaScript 对象的接口是 addJavascriptInterface，但是这个接口有漏洞，可以被不法分子利用，危害用户的安全，因此在 4.2 中引入新的接口 @JavascriptInterface（上面代码中使用的）来替代这个接口，解决安全问题。所以 Android 注入对对象的方式是 **有兼容性问题的**。（4.2 之前很多方案都采用拦截 prompt 的方式来实现，因为篇幅有限，这里就不展开了。）



##### URL Scheme

**缺陷**

- 使用 iframe.src 发送 URL SCHEME 会有 url 长度的隐患。

- 创建请求，需要一定的耗时，比注入 API 的方式调用同样的功能，耗时会较长。



【注】：有些方案为了规避 url 长度隐患的缺陷，在 iOS 上采用了使用 Ajax 发送同域请求的方式，并将参数放到 head 或 body 里。这样，虽然规避了 url 长度的隐患，但是 WKWebView 并不支持这样的方式。

【注2】：为什么选择 iframe.src 不选择 locaiton.href ？因为如果通过 location.href 连续调用 Native，很容易丢失一些调用。



#### Native 调用 JavaScript

Native 调用 JavaScript，其实就是执行拼接 JavaScript 字符串，从外部调用 JavaScript 中的方法，因此 JavaScript 的方法必须在全局的 window 上。（闭包里的方法，JavaScript 自己都调用不了，更不用想让 Native 去调用了）

###### iOS 的 UIWebView

```
result = [uiWebview stringByEvaluatingJavaScriptFromString:javaScriptString];
```

###### iOS 的 WKWebView

```
[wkWebView evaluateJavaScript:javaScriptString completionHandler:completionHandler];
```

######Android，在 Kitkat（4.4）之前并没有提供 iOS 类似的调用方式，只能用 loadUrl 一段 JavaScript 代码，来实现

```
webView.loadUrl("javascript:" + javaScriptString);
```

###### Kitkat 之后的版本，也可以用 evaluateJavascript 方法实现

```
webView.evaluateJavascript(javaScriptString, new ValueCallback<String>() {
    @Override
    publicvoidonReceiveValue(String value){

    }
});
```

【注】：使用 loadUrl 的方式，并不能获取 JavaScript 执行后的结果。



#### JSBridge 接口实现

##### 调用 Native（给 Native 发消息）| 接被 Native 调用（接收 Native 消息）

```javascript
(function () {
  var id = 0,
    callbacks = {},
    registerFuncs = {};

  window.JSBridge = {
    // 调用 Native
    invoke: function (bridgeName, callback, data) {
      // 判断环境，获取不同的 nativeBridge
      var thisId = id++; // 获取唯一 id
      callbacks[thisId] = callback; // 存储 Callback
      nativeBridge.postMessage({
        bridgeName: bridgeName,
        data: data || {},
        callbackId: thisId // 传到 Native 端
      });
    },
    receiveMessage: function (msg) {
      var bridgeName = msg.bridgeName,
        data = msg.data || {},
        callbackId = msg.callbackId, // Native 将 callbackId 原封不动传回
        responstId = msg.responstId;
      // 具体逻辑
      // bridgeName 和 callbackId 不会同时存在
      if (callbackId) {
        if (callbacks[callbackId]) { // 找到相应句柄
          callbacks[callbackId](msg.data); // 执行调用
        }
      }
      elseif(bridgeName) {
        if (registerFuncs[bridgeName]) { // 通过 bridgeName 找到句柄
          var ret = {},
            flag = false;
          registerFuncs[bridgeName].forEach(function (callback) => {
            callback(data, function (r) {
              flag = true;
              ret = Object.assign(ret, r);
            });
          });
          if (flag) {
            nativeBridge.postMessage({ // 回调 Native
              responstId: responstId,
              ret: ret
            });
          }
        }
      }
    },
    register: function (bridgeName, callback) {
      if (!registerFuncs[bridgeName]) {
        registerFuncs[bridgeName] = [];
      }
      registerFuncs[bridgeName].push(callback); // 存储回调
    }
  };
})();
```



#### 如何引入

##### 由 Native 端引入

* 桥的版本很容易与 Native 保持一致，Native 端不用对不同版本的 JSBridge 进行兼容
* 注入时机不确定，需要实现注入失败后重试的机制，保证注入的成功率，同时 JavaScript 端在调用接口时，需要优先判断 JSBridge 是否已经注入成功。

##### 由 JS 端引入

* JavaScript 端可以确定 JSBridge 的存在，直接调用即可；
* 如果桥的实现方式有更改，JSBridge 需要兼容多版本的 Native Bridge 或者 Native Bridge 兼容多版本的 JSBridge。

## [手机 QQ Hybrid 的架构演进](https://zhuanlan.zhihu.com/p/25729725)

<img src="https://pic1.zhimg.com/80/v2-2db69f25ced147c6defa277bdaafdd98_hd.jpg" alt="img" style="zoom:80%;" />



主流的hybrid还是H5 + Native

#### 传统页面的动静分离

<img src="https://pic1.zhimg.com/80/v2-8d16c33c5cf25f6616d45123f2a17e2c_hd.jpg" alt="img" style="zoom:80%;" />

launch WebView的时候网络处于空等状态，这会浪费时间。我们团队内部统计了Android机器launch WebView大概需要1秒以内（因为手机QQ是多进程的架构，WebView生存在另一个进程内部，launch一次WebView除了进程loading还有浏览器内核的加载）。

<img src="https://pic3.zhimg.com/80/v2-b5802d75a0e4cf58e61337748a49c23e_hd.jpg" alt="img" style="zoom:80%;" />

#### 静态直出+离线预推

节省WebView launch的时间，这段时间可以直接网络传输，另外如果本地有offlineCache甚至也不需要网络传输请求，相当于完全加载一个本地页面。但很多时候我们为了保险起见，还是加了页面loading，然后做refresh的操作防止数据的不一致性。

<img src="https://pic1.zhimg.com/80/v2-2e58a46bc3ef37682456d19757487df4_hd.jpg" alt="img" style="zoom:80%;" />

这套机制上线后效果不错，但真的去实施这种H5加载模式会遇到一些坑，例如产品经理配置的banner图片和item数据可能会存在多份数据版本不一致的情况。

产品经理肯定是在dataServer上配置最新数据信息，但CDN上的页面内置的数据有可能仍处于上一版本，更差的情况是离线包服务器和offlineServer生成的HTML又是另外一个版本。当用户本地的缓存和server同步不及时即常见的缓存刷新问题，很有可能存储的数据又是另外一份。

<img src="https://pic3.zhimg.com/80/v2-7cb95027d422dee7c2d9ef41ec32c142_hd.jpg" alt="img" style="zoom:80%;" />

#### 如何统一数据 (差量下发)

QQ客户端每次登录上来把offlineServer最新文件下载回来就好了，但这个方案会遇到巨大的流量挑战。

当一个页面的所有资源需要进行离线包计算打包的时候，offline计算这部分除了把所有的资源打包，内部也会存储之前所有的历史版本，同时根据历史版本和最新版本生成所有的diff，即每个离线包的差样部分。

<img src="https://pic2.zhimg.com/80/v2-ca02f862431d233866b98028d6873335_hd.jpg" alt="img" style="zoom:80%;" />

<img src="https://pic3.zhimg.com/80/v2-58f91dd0efdaf17047a8d3e8b5a1722a_hd.jpg" alt="img" style="zoom:80%;" />

这里可能有疑问，为什么静态直出在离线包的情况下网络耗时还需要800多毫秒，本地有缓存不应该是零耗时吗？

我们统计的网络耗时是从WebView load URL开始到页面首行这段时间，实际上包括一部分页面加载，WebView内核的启动，网络组件和渲染组件的加载，所以耗时比较高。

#### 动态缓存

<img src="https://pic2.zhimg.com/80/v2-1fe792a0f8adc66c99d7b18738dfd2c9_hd.jpg" alt="img" style="zoom:80%;" />

<img src="https://pic4.zhimg.com/80/v2-33af50d58e70334e834d7531e14da2b3_hd.jpg" alt="img" style="zoom:80%;" />

确实是有一些App利用持久连接这种通道去加载页面，但在手机QQ比较难行得通，因为手机QQ客户端与sever的持久连接通道是一个非常传统的CS架构，它发送的是socket package，每次需要发送一个请求包，收到应答之后才会继续下一个请求。

这种应答机制决定了它每次都需要一个等待的过程，而且socket package的约束造成了每次传输的数据包的大小受到限制，像我们30+KB的数据很有可能要拆成五六个数据包，虽然是利用了持久连接节省了connect耗时，但和server多次来回通讯反而把整个耗时加大了。

另外，从Node.js服务器返回的数据是HTTP流式的，WebView不需要等待整个HTML加载完成后才能进行渲染和显示，只要拿到传输中的first byte就可以开始进行document的解析以及DOM的构造。

<img src="https://pic4.zhimg.com/80/v2-f6d63d187b57dc68a05252122366870f_hd.jpg" alt="img" style="zoom:80%;" />

#### 流量分析

<img src="https://pic3.zhimg.com/80/v2-2c27d9b928f6f789cf06d5d4f087bd92_hd.jpg" alt="img" style="zoom:80%;" />

我们统计过各业务中关于流量的分布，如下图，我们可以明显看到大部分的流量都消耗在图片资源上，但我们做这个分析时也曾经有怀疑，是不是业务特性决定了我们图片消耗是最多的？手机QQ其他H5业务是不是也这样？

#### reshape架构 —— 图片优化

<img src="https://pic2.zhimg.com/80/v2-15ba8791162138ee61f6c290f95ca981_hd.jpg" alt="img" style="zoom:80%;" />

<img src="https://pic2.zhimg.com/80/v2-bf0c9ddda8c76f999bc79e82e467c929_hd.jpg" alt="img" style="zoom:80%;" />



## 小程序架构设计

在微信早期，我们内部就有这样的诉求，在微信打开的H5可以调用到微信原生一些能力，例如公众号文章里可以打开公众号的Profile页。所以早期微信提供了Webview到原生的通信机制，在Webview里注入JSBridge的接口，使得H5可以通过它调用到原生能力。

<img src="http://mmbiz.qpic.cn/mmbiz_png/IoAE3diccdsyu1ibgY4m6icRJWoKH38Z5BVT2RTibzTEuR30STHZKnQk0eEuvib8avg9Ozwb1x8VA1ibt7FsseicOl2ibQ/0?wx_fmt=png" alt="img" style="zoom:80%;" />

我们可以通过JSBridge微信预览图片的功能：

```js
WeixinJSBridge.invoke('imagePreview', {
  current: https://img1.gtimg.com/1.jpg',
  urls: [
    'https://img1.gtimg.com/1.jpg',
    'https://img1.gtimg.com/2.jpg',
    'https://img1.gtimg.com/3.jpg'
  ]
})
```



所以在2015年初的时候，微信就发布了JSSDK，其实就是隐藏了内部一些细节，包装了几十个API给到上层业务直接调用。

<img src="http://mmbiz.qpic.cn/mmbiz_png/IoAE3diccdsyu1ibgY4m6icRJWoKH38Z5BVDd5E01FEhl98rxBkbkSibjJBUSOwZwzX5mIMxmLFTqRhbouI5suzZhg/0?wx_fmt=png" alt="img" style="zoom:80%;" />

前边的代码就变成了：

```js
wx.previewImage({
  current: https://img1.gtimg.com/1.jpg',
  urls: [
    'https://img1.gtimg.com/1.jpg',
    'https://img1.gtimg.com/2.jpg',
    'https://img1.gtimg.com/3.jpg'
  ]
})
```

开发者可以用 JSSDK 来调用微信的能力，能力得到支持，但微信 H5 的体验并未改善

* 加载 H5 时的白屏
* H5 跳转到其他页面时，切换效果也很不流畅
* 被用来诱导分享，做坏事



####移动应用开发特点

* Web开发的门槛比较低，而App开发门槛偏高而且需要考虑iOS和安卓多个平台；
* 刚刚说到H5会有白屏和页面切换不流畅的问题，原生App的体验就很好了；
* H5最大的优点是随时可以上线更新，但是App的更新就比较慢，需要审核上架，还需要用户主动安装更新。



####希望的开发模式

* 像H5一样开发门槛低；
* 体验一定要好，要尽可能的接近原生App体验；
* 让开发者可以云端更新，而且我们平台要可以管控。



####RN 存在的问题

* RN只支持CSS的子集，作为一个开放的生态，我们还要告诉外边千千万万的开发者，哪些CSS属性能用，哪些不能用；
* RN本身存在一些问题，这些依赖RN的修复，同时这样就变成太过依赖客户端发版本去解决开发者那边的Bug，这样修复周期太长。
* RN前阵子还搞出了一个Lisence问题，对我们来说也是存在隐患的。



#### Hybrid

把H5所有代码打包，一次性Load到本地再打开

![img](http://mmbiz.qpic.cn/mmbiz_png/IoAE3diccdsyu1ibgY4m6icRJWoKH38Z5BVw3nYicqxWuqB3SlK257Zr3jYicgMjMhB6rQrK3lknj1bsgBSyDJOZFGQ/0?wx_fmt=png)



#### 平台管控问题 —— 安全问题

![img](http://mmbiz.qpic.cn/mmbiz_png/IoAE3diccdsyu1ibgY4m6icRJWoKH38Z5BV7WqiaHGwrIAfPztmRibwWG2icog7ADIbYBxV405YicN3o4jZjcvKKWqIpQ/0?wx_fmt=png)

同时浏览器提供了可以操作界面的DOM API，开发者可以用这些API进行一些界面上的变动，从而实现UI交互。

![img](http://mmbiz.qpic.cn/mmbiz_png/IoAE3diccdsyu1ibgY4m6icRJWoKH38Z5BVWDMYicm2via8xyqKPLVQCYvsg8bsCiceVrXBKQxKJFYAfOIFuicmHROuGw/0?wx_fmt=png)

既然我们要采用Web+离线包的方式，那我们要解决前边说过的安全问题，我们就要禁用掉很多危险的HTML标签，还要禁用掉一些API，我们要一直维护这样的白名单或者黑名单，实现成本太高了，而且未来浏览器内核一旦更新，对我们来说都是很大的安全隐患。

![img](http://mmbiz.qpic.cn/mmbiz_png/IoAE3diccdsyu1ibgY4m6icRJWoKH38Z5BVT9PxybiaYbskR4g65WGwniaIovwt5OlMndByQlmmR4jTd7D0q8nficGGQ/0?wx_fmt=png)



**开发者的JS逻辑代码放到单独的线程**去运行，因为不在Webview线程里，所以这个环境没有Webview任何接口，自然的开发者就没法直接操作Dom，也就没法动态去更改界面，“管控”的问题得以解决。

还存在一个问题：开发者没法操作Dom，如果用户交互需要界面变化的话，开发者就没办法动态变化界面了。所以我们要找到一个办法：不直接操作Dom也能做到界面更新。

![img](https://mmbiz.qpic.cn/mmbiz_png/IoAE3diccdsyBibkl8qwf9a5nA0toDgeAY0J468IGicJ16nc3vo3ciauOJZM5RDDnicWbfiahYWrfyAZ83PrdY75mp8g/0?wx_fmt=png)

其中渲染层用了Webview进行渲染，开发者的JS逻辑运行在一个独立的JSCore线程。

渲染层提供了带有数据绑定语法的WXML，逻辑层提供了setData等等API，开发者需要进行界面变化时，只需要通过setData把变化的数据传进去，小程序框架就会进行Dom Diff等流程最后把正确的结果更新在Dom树上。

![img](https://mmbiz.qpic.cn/mmbiz_png/IoAE3diccdsyBibkl8qwf9a5nA0toDgeAYO0ic44Ry3GObCXGk6icwBjOibIp92cEv5JrWAfXwv0W1dHM33fxUBGRdQ/0?wx_fmt=png)

可以看到在开发者的逻辑下层，还需要有一层小程序框架的支持（数据通信、API、VD算法等等），我们把它称为基础库。

我们在两个线程各自注入了一份基础库，渲染层的基础库含有VD的处理以及底层组件系统的机制，对上层提供一些内置组件，例如video、image等等。逻辑层的基础库主要会提供给上层一些API，例如大家经常用到的wx.login、wx.getSystemInfo等等。

解决了渲染问题，我们还要看一下用户在和界面交互时的问题。

![img](https://mmbiz.qpic.cn/mmbiz_png/IoAE3diccdsyBibkl8qwf9a5nA0toDgeAY3ccAlicDXII49Z6WgthKibiabmw0w3VbN6UpGYHEgvj7MR0AKltTJkd5w/0?wx_fmt=png)

用户在屏幕点击某个按钮，开发者的逻辑层要处理一些事情，然后再通过setData引起界面变化，整个过程需要四次通信。对于一些强交互（例如拖动视频进度条）的场景，这样的处理流程会导致用户的操作很卡。

对于这种强交互的场景，我们引入了原生组件，这样用户和原生组件的交互可以节省两次通信。

![img](https://mmbiz.qpic.cn/mmbiz_png/IoAE3diccdsyBibkl8qwf9a5nA0toDgeAYB1cPXneHvGKiceDialtGA3OCb5fmafgdG0VD0EWDrZUZtuTPSCfXqAgw/0?wx_fmt=png)

正如上图所示，原生组件和Webview不是在同一层级进行渲染，原生组件其实是叠在Webview之上，想必大家都遇到过这个问题，video、input、map等等原生组件总是盖在其他组件之上，这就是这个设计带来的问题。

#### 同层渲染

##### 原理

通过一定的技术手段把原生组件直接渲染到 WebView 层级上，此时「原生组件层」已经不存在，原生组件此时已被直接挂载到 WebView 节点上。

##### 背景

在小程序引入「同层渲染」之前，原生组件的层级总是最高，不受 `z-index` 属性的控制，无法与 `view`、`image` 等内置组件相互覆盖， `cover-view` 和 `cover-image` 组件的出现一定程度上缓解了覆盖的问题，同时为了让原生组件能被嵌套在 `swiper`、`scroll-view` 等容器内，小程序在过去也推出了一些临时的解决方案。

但随着小程序生态的发展，开发者对原生组件的使用场景不断扩大，原生组件的这些问题也日趋显现，为了彻底解决原生组件带来的种种限制，我们对小程序原生组件进行了一次重构，引入了「同层渲染」。

##### 渲染原理

我们知道，小程序的内容大多是渲染在 WebView 上的，如果把 WebView 看成单独的一层，那么由系统自带的这些原生组件则位于另一个更高的层级。两个层级是完全独立的，因此无法简单地通过使用 `z-index` 控制原生组件和非原生组件之间的相对层级。正如下图所示，非原生组件位于 WebView 层，而原生组件及 `cover-view` 与 `cover-image` 则位于另一个较高的层级：

![img](https://mmbiz.qpic.cn/mmbiz_png/CMtb7fgqtdFgzEPzk0xAD4QzpN86g6pcLdYgvQAmiaib7bmyQdbP8JppxlXQ3VWHIheeYuOhJg5pwS8RSM4ZL9Qw/0?wx_fmt=png)

##### 实现方案

###### IOS

1. 创建一个 DOM 节点并设置其 CSS 属性为 `overflow: scroll` 且 `-webkit-overflow-scrolling: touch`；
2. 通知客户端查找到该 DOM 节点对应的原生 `WKChildScrollView` 组件；
3. 将原生组件挂载到该 `WKChildScrollView` 节点上作为其子 View。

![img](https://mmbiz.qpic.cn/mmbiz_png/CMtb7fgqtdFgzEPzk0xAD4QzpN86g6pcE7B9WfriaHmu2SZkibEBPhiax5XRXRzg3fWGAjY0tlNX6IIt3x8sVYfgQ/0?wx_fmt=png)

###### Android

chromium 支持 WebPlugin 机制，WebPlugin 是浏览器内核的一个插件机制，主要用来解析和描述embed 标签。Android 端的同层渲染就是基于 `embed` 标签结合 chromium 内核扩展来实现的。

![img](https://mmbiz.qpic.cn/mmbiz_png/CMtb7fgqtdFgzEPzk0xAD4QzpN86g6pcmmMmjZS8B6yIiaAvRvSQrojDBdjEmmhdsh8bRkp4QcsOdZ8XXtqYsaw/0?wx_fmt=png)



1. WebView 侧创建一个 `embed` DOM 节点并指定组件类型；
2. chromium 内核会创建一个 `WebPlugin` 实例，并生成一个 `RenderLayer`；
3. Android 客户端初始化一个对应的原生组件；
4. Android 客户端将原生组件的画面绘制到步骤2创建的 `RenderLayer` 所绑定的 `SurfaceTexture` 上；
5. 通知 chromium 内核渲染该 `RenderLayer`；
6. chromium 渲染该 `embed` 节点并上屏。

![img](https://mmbiz.qpic.cn/mmbiz_png/CMtb7fgqtdFgzEPzk0xAD4QzpN86g6pclAAIy5MUloeliaNNI2xNyEw2HbTjZx4bWu86zsFoobx8Q9bnDB9YJ2Q/0?wx_fmt=png)

##### Tips

* 不是所有情况均会启用「同层渲染」

  原生组件的「同层渲染」能力可能会在特定情况下失效，一方面你需要在开发时稍加注意，另一方面同层渲染失败会触发 `bindrendererror` 事件，可在必要时根据该回调做好 UI 的 fallback。

* iOS 「同层渲染」与 WebView 渲染稍有区别

  并非所有的 WXSS 属性都可以在原生组件上生效。一般来说，定位 (position / margin / padding) 、尺寸 (width / height) 、transform (scale / rotate / translate) 以及层级 (z-index) 相关的属性均可生效，在原生组件外部的属性 (如 shadow、border) 一般也会生效。但如需对组件做裁剪则可能会失败，例如：`border-radius` 属性应用在父节点不会产生圆角效果。

* 「同层渲染」的事件机制

  启用了「同层渲染」之后的原生组件相比于之前的区别是原生组件上的事件也会冒泡，意味着，一个原生组件或原生组件的子节点上的事件也会冒泡到其父节点上并触发父节点的事件监听，通常可以使用 `catch` 来阻止原生组件的事件冒泡。

* 只有子节点才会进入全屏

  ![img](https://mmbiz.qpic.cn/mmbiz_png/CMtb7fgqtdFgzEPzk0xAD4QzpN86g6pc9awsYib902r4EzianfG5S1naH1bm8IIx28xpb9GD6kaQG9aa43NoCVYg/0?wx_fmt=png)



## [WebView性能、体验分析与优化](https://tech.meituan.com/2017/06/09/webviewperf.html)

### 性能分析

对于一个普通用户来讲，打开一个WebView通常会经历以下几个阶段：

1. 交互无反馈
2. 到达新的页面，页面白屏
3. 页面基本框架出现，但是没有数据；页面处于loading状态
4. 出现所需的数据

如果从程序上观察，WebView启动过程大概分为以下几个阶段：

![WebView启动时间](https://awps-assets.meituan.net/mit-x/blog-images-bundle-2017/9a2f8beb.png)

#### Webview 初始化

**App中打开WebView的第一步并不是建立连接，而是启动浏览器内核**。WebView中用户体验到的打开时间需要再增加70~700ms。

于是我们找到了“为什么WebView总是很慢”的原因之一：

- 在浏览器中，我们输入地址时（甚至在之前），浏览器就可以开始加载页面。
- 而在客户端中，客户端需要先花费时间初始化WebView完成后，才开始加载。

而这段时间，由于WebView还不存在，所有后续的过程是完全阻塞的。可以这样形容WebView初始化过程：

<img src="https://awps-assets.meituan.net/mit-x/blog-images-bundle-2017/0b91f76e.png" alt="WebView启动过程" style="zoom:30%;" />

##### 优化

###### 全局 Webview

- 在客户端刚启动时，就初始化一个全局的WebView待用，并隐藏；
- 当用户访问了WebView时，直接使用这个WebView加载对应网页，并展示。

当然这也带来了一些问题，包括：

- 额外的内存消耗。
- 页面间跳转需要清空上一个页面的痕迹，更容易内存泄露。



###### 客户端代理数据请求

- 在客户端初始化WebView的同时，直接由native开始网络请求数据；
- 当页面初始化完成后，向native获取其代理请求的数据。



#### 建立连接/服务器处理

在页面请求的数据返回之前，主要有以下过程耗费时间。

- DNS
- connection
- 服务器处理

##### 优化

###### DNS采用和客户端API相同的域名

- 客户端首次打开都会请求api.meituan.com，其DNS将会被系统缓存。
- 然而当打开WebView的时候，由于请求了不同的域名，需要重新获取i.meituan.com的IP。

###### 同步渲染采用chunk编码

在HTTP协议中，我们可以在header中设置 `transfer-encoding:chunked` 使得页面可以分块输出。

两者的总共后端时间并没有区别，但是可以提升首字节速度，从而让前端加载资源和后端加载API不互相阻塞。

<img src="https://awps-assets.meituan.net/mit-x/blog-images-bundle-2017/4c33eae7.png" alt="分chunk加载" style="zoom:50%;" />



#### 页面框架渲染

##### 优化

在页面框架加载这一部分，能够优化的点参照[雅虎14条](https://stevesouders.com/hpws/rules.php)就够了；但注意不要犯错，一个小小的内联JS放错位置也会让性能下降很多。

1. CSS的加载会在HTML解析到CSS的标签时开始，所以CSS的标签要尽量靠前。
2. 但是，CSS链接下面不能有任何的JS标签（包括很简单的内联JS），否则会阻塞HTML的解析。
3. 如果必须要在头部增加内联脚本，一定要放在CSS标签之前。

<img src="https://awps-assets.meituan.net/mit-x/blog-images-bundle-2017/fef19af0.png" alt="CSS带来的阻塞解析" style="zoom:50%;" />

#### JS加载

对于大型的网站来说，在此我们先提出几个问题：

- 将全部JS代码打成一个包，造成首次执行代码过大怎么办？
- 将JS以细粒度打包，造成请求过多怎么办？
- 将JS按 “基础库” + “页面代码” 分别打包，要怎么界定什么是基础代码，什么是页面代码；不同页面用的基础代码不一致怎么办？
- 单一文件的少量代码改的是否会导致缓存失效？
- 代码模块间有动态依赖，怎样合并请求。

#### JS解析、编译、执行

##### 优化

- 高性能要求页面还是需要后端渲染。
- React还是太重了，面向用户写系统需要谨慎考虑。
- JS代码的编译和执行会有缓存，同App中网页尽量统一框架。



### 体验分析

#### 打开速度

#### 长按选择

在WebView中，长按文字会使得WebView默认开始选择文字；长按链接会弹出提示是否在新页面打开。

解决方法：可以通过给body增加CSS来禁止这些默认规则。

#### 点击延迟 —— fastclick 已不推荐

在WebView中，click通常会有大约300ms的延迟（同时包括链接的点击，表单的提交，控件的交互等任何用户点击行为）。

唯一的例外是设置的meta：viewpoint为禁止缩放的Chrome（然而并不是Android默认的浏览器）。

解决方法：使用fastclick一般可以解决这个问题。

#### 页面滑动期间不渲染/执行

在很多需求中会有一些吸顶的元素，例如导航条，购买按钮等；当页面滚动超出元素高度后，元素吸附在屏幕顶部。

这个功能在PC和native中都能够实现，然而在WebView中却成了难题：

```
 在页面滚动期间，Scroll Event不触发
```

不仅如此，WebView在滚动期间还有各种限定：

- setTimeout和setInterval不触发。
- GIF动画不播放。
- 很多回调会延迟到页面停止滚动之后。
- background-position: fixed不支持。
- 这些限制让WebView在滚动期间很难有较好的体验。

这些限制大部分是不可突破的，但至少对于吸顶功能还是可以做一些支持：

解决方法：

- 在iOS上，使用position: sticky可以做到元素吸顶。
- 在Android上，监听touchmove事件可以在滑动期间做元素的position切换（惯性运动期间就无效了）。

#### Crash

通常WebView并不能直接接触到底层的API，因此比较稳定；但仍然有使用不当造成整个App崩溃的情况。

目前发现的案例包括：

- 使用过大的图片（2M）
- 不正常使用WebGL

### 安全分析

#### WebView被运营商劫持、注入问题

- 无视通信规则强制缓存页面。
- header被篡改。
- 页面被注入广告。
- 页面被重定向。
- 页面被重定向并重新iframe到新页面，框架嵌入广告。
- HTTPS请求被拦截。
- DNS劫持。

#### 解决方案

##### 使用CSP（Content Security Policy）

CSP可以有效的拦截页面中的非白名单资源，而且兼容性较好。在美团移动版的使用中，能够阻止大部分的页面内容注入。

但在使用中还是存在以下问题：

- 由于业务的需要，通常inline脚本还是在白名单中，会导致完全依赖内联的页面代码注入可以通过检测。
- 如果注入的内容是纯HTML+CSS的内容，则CSP无能为力。
- 无法解决页面被劫持的问题。
- 会带来额外的一些维护成本。

##### HTTPS

网络传输的性能和成功率都会下降，而且HTTPS的页面会要求页面内所有引用的资源也是HTTPS的，对于大型网站其迁移成本并不算低。

##### App使用Socket代理请求

如果HTTP请求容易被拦截，那么让App将其转换为一个Socket请求，并代理WebView的访问也是一个办法。

通常不法运营商或者WiFi都只能拦截HTTP（S）请求，对于自定义的包内容则无法拦截，因此可以基本解决注入和劫持的问题。

Socket代理请求也存在问题。

- 首先，使用客户端代理的页面HTML请求将丧失边下载边解析的能力；根据前面所述，浏览器在HTML收到部分内容后就立刻开始解析，并加载解析出来的外链、图片等，执行内联的脚本……而目前WebView对外并没有暴露这种流式的HTML接口，只能由客户端完全下载好HTML后，注入到WebView中。因此其性能将会受到影响。
- 其次，其技术问题也是较多的，例如对跳转的处理，对缓存的处理，对CDN的处理等等……稍不留神就会埋下若干大坑。

此外还有一些其他的办法，例如页面的MD5检测，页面静态页打包下载等等方式，具体如何选择还要根据具体的场景抉择。

#### 打开第三方WebView

限制允许打开的WebView的域名，并设置运行访问的白名单。

