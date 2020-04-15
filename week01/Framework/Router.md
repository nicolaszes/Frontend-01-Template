# Router

### History / Hash

#### History(PushState, ReplaceState) — 文件资源不同路径，需要服务端重定向

![React Router原理](https://img1.3s78.com/codercto/b8dc33a5908ced0d96427cb625871b79)

* 不会发出请求
* 留下历史记录
* popstate 触发

```js
class Router {
	add() {}
  
  // 监听 url 变化
  listen() {
    history.popState()
  }
  
  push() {
    history.pushState()
  }
  
  replace() {
    history.replaceState()
  }
  
  back() {}
}
```



#### Hash — 文件资源同一路径

![React Router原理](https://img1.3s78.com/codercto/fe70d7d6c0f5b3b4892a9e993ed1c9fa)

* 只作用于 browser
* 会留下历史记录
* hashchange 监听

```js
class Router {
	add() {
    this.routers.push(re, handler)
	}
  
  // 监听 url 变化
  listen() {}
  
  push() {
    location.hash = '...'
  }
  
  replace() {
    location.replace('...')
  }
  
  back() {}
}
```



#### 通过 URL 向后端发起请求时，两者差距

hash模式仅改变hash部分的内容，而hash部分是不会包含在HTTP请求中的：

```text
http://oursite.com/#/user/id   // 如重新请求只会发送http://oursite.com/
```

故在hash模式下遇到根据URL请求页面的情况不会有问题。hash 

而history模式则会将URL修改得就和正常请求后端的URL一样

```text
http://oursite.com/user/id
```



在此情况下重新向后端发送请求，如后端没有配置对应/user/id的路由处理，则会返回404错误。

官方推荐的解决办法是在服务端增加一个覆盖所有情况的候选资源：如果 URL 匹配不到任何静态资源，则应该返回同一个 index.html 页面，这个页面就是你 app 依赖的页面。

同时这么做以后，服务器就不再返回 404 错误页面，因为对于所有路径都会返回 index.html 文件。为了避免这种情况，在 Vue 应用里面覆盖所有的路由情况，然后在给出一个 404 页面。

或者，如果是用 Node.js 作后台，可以使用服务端的路由来匹配 URL，当没有匹配到路由的时候返回 404，从而实现 fallback。



#### state的存储

为了维护 `state` 的状态，将其存储在 `sessionStorage` 里面:

```js
// createBrowserHistory/createHashHistory中state的存储
function saveState(key, state) {
  ...
  window.sessionStorage.setItem(createKey(key), JSON.stringify(state));
}
function readState(key) {
  ...
  json = window.sessionStorage.getItem(createKey(key));
  return JSON.parse(json);
}

// createMemoryHistory仅仅在内存中，所以操作比较简单
const storage = createStateStorage(entries); // storage = {entry.key: entry.state}
 
function saveState(key, state) {
  storage[key] = state
}
function readState(key) {
  return storage[key]
}
```



### React-router

* Hash (老浏览器)，createHashHistory
* History (H5环境)，createBrowserHistory
* Memory (Node环境)，createMemoryHistory

```js
// 内部的抽象实现
function createHistory(options={}) {
  ...
  return {
    listenBefore, // 内部的hook机制，可以在location发生变化前执行某些行为，AOP的实现
    listen, // location发生改变时触发回调
    transitionTo, // 执行location的改变
    push, // 改变location
    replace,
    go,
    goBack,
    goForward,
    createKey, // 创建location的key，用于唯一标示该location，是随机生成的
    createPath,
    createHref,
    createLocation, // 创建location
  }
}
```

#### 基本原理

![img](http://zhenhua-lee.github.io/img/react-router/base.png)

#### 组件层面具体实现过程

![img](http://zhenhua-lee.github.io/img/react-router/upper.png)

#### API层面描述实现过程

![img](http://zhenhua-lee.github.io/img/react-router/internal.png)

#### Link组件后路由系统到底发生了什么变化

![React Router原理](https://img1.3s78.com/codercto/ccaa1a4f39902a4ca55d81554eb3c192)

#### React router 和 Location.href 的区别

##### router（不会重刷）

##### location（页面跳转，整个页面重刷）



### Vue-router