# Error Handler

### Vue

- errorHandler

```js
Vue.config.errorHandler = function(err, vm, info) {
  console.log(`Error: ${err.toString()}\nInfo: ${info}`);
}
```

- warnHandler

```js
Vue.config.warnHandler = function(msg, vm, trace) {
  console.log(`Warn: ${msg}\nTrace: ${trace}`);
}
```

- renderError

```js
const app = new Vue({
  el:'#app',
  renderError (h, err) {
    return h('pre', { style: { color: 'red' }}, err.stack)
  }
})
```

- errorCaptured

```js
Vue.component('cat', {
  template:`
    <div>
			<h1>Cat: </h1>
      <slot></slot>
    </div>
	`,
  props:{
    name:{
      required:true,
      type:String
    }
  },
  errorCaptured(err,vm,info) {
    console.log(`cat EC: ${err.toString()}\ninfo: ${info}`); 
    return false;
  }
});

Vue.component('kitten', {
  template: '<div><h1>Kitten: {{ dontexist() }}</h1></div>',
  props:{
    name:{
      required: true,
      type: String
    }
  }
});
```

### React

在 UI 部分发生的 JavaScript 异常不应该阻断整个应用。为了解决这一问题，React 16 引入了“错误边界（error boundary）”这一新概念。

另外值得一提的是异常边界并不能捕获其本身的异常，如果异常边界组件本身抛出了异常，那么会冒泡传递到上一层最近的异常边界中。

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true });
    // You can also log the error to an error reporting service
    logErrorToMyService(error, info);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

```jsx
<ErrorBoundary>
  <MyWidget />
</ErrorBoundary>
```



### JS

对于 JS 而言，异常的出现不会直接导致 JS 引擎崩溃，最多只会使当前执行的任务终止。

1. 当前代码块将作为一个任务压入任务队列中，JS线程会不断地从任务队列中提取任务执行
2. 当任务执行过程中出现异常，且异常没有捕获处理，则会一直沿着调用栈一层层向外抛出，最终终止当前任务的执行
3. JS 线程会继续从任务队列中提取下一个任务继续执行



####语法错误

#### 运行时错误

* try catch（只能捕获运行时 **非异步** 错误）

  ```js
  /**
   * try-catch
   * 捕捉到运行时非异步错误
   */
  try {
    error
  } catch (err) {
    console.log(err)
  }
  ```

* window.onerror（能捕获运行时错误，无论异步 or 非异步）

  * 对于 onerror 这种全局捕获，最好写在所有 JS 脚本的前面，因为无法保证代码不出错
  * onerror 无法捕获到网络异常

  ```js
  /**
   * window.onerror
   * 捕捉到运行时错误
   */
  window.onerror = function (msg, url, row, col, error) {
    console.log('我知道错误了')
    console.log({
      msg,
      url,
      row,
      col,
      error
    })
    return true
  }	
  error
  // or
  setTimeout(() => {
    error
  })
  ```

* unhandledrejection

  ```js
  /**
   * 无法捕获到网络异常的错误
   * 需结合服务端排查分析是 404还是 500
   */
  window.addEventListener("unhandledrejection", function (e) {
    e.preventDefault()
    console.log('我知道 promise 的错误了');
    console.log(e.reason);
    return true;
  });
  ```

* Promise

  * 只要注意在 macrotask 级别回调中使用 reject，就没有抓不住的异常

  ```js
  Promise.reject('promise error')
    .catch(err => {
      console.log(err)
    })
  
  new Promise((resolve, reject) => {
    reject('promise error')
  }).catch(err => {
    console.log(err)
  })
  
  new Promise((resolve) => {
    resolve()
  }).then(() => {
    throw 'promise error'
  }).catch(err => {
    console.log(err)
  })
  ```

  * 永远不要在 macrotask 队列中抛出异常
  * 因为 macrotask队列脱离了运行上下文环境，异常无法被当前作用域捕获

  ```js
  function fetch(callback) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        throw Error('用户不存在')
      })
    })
  }
  
  fetch().then(result => {
    console.log('请求处理', result) // 永远不会执行
  }).catch(error => {
    console.log('请求处理异常', error) // 永远不会执行
  })
  ```

  * microtask 中抛出的异常可以被捕获，microtask 并没有离开当前的作用域

  ```js
  Promise.resolve(true).then((resolve, reject) => {
    throw Error('microtask 中的异常')
  }).catch(error => {
    console.log('捕获异常', error) // 捕获异常 Error: microtask 中的异常
  })
  ```

  * 第三方函数

  ```js
  /**
   * 如果第三方函数在 macrotask 回调中以 throw Error 的方式抛出异常怎么办？
   * 值得欣慰的是，由于不在同一个调用栈，虽然这个异常无法被捕获，但也不会影响当前调用栈的执行。
   */
  function thirdFunction() {
    setTimeout(() => {
      throw Error('就是任性')
    })
  }
  
  Promise.resolve(true).then((resolve, reject) => {
    thirdFunction()
  }).catch(error => {
    console.log('捕获异常', error)
  })
  
  /**
   * 唯一的解决办法，是第三方函数不要做这种傻事，一定要在 macrotask 抛出异常的话，请改为 reject 的方式。
   * 如果 return thirdFunction() 这行缺少了 return 的话，依然无法抓住这个错误
   * 这是因为没有将对方返回的 Promise 传递下去，错误也不会继续传递。
   */
  function thirdFunction() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject('收敛一些')
      })
    })
  }
  ```

* Async / await

  * 不论是同步、异步的异常，await 都不会自动捕获

  ```js
  /**
   * Generator / Async, Await
   * 不论是同步、异步的异常，await 都不会自动捕获，
   * 但好处是可以自动中断函数，我们大可放心编写业务逻辑，而不用担心异步异常后会被执行引发雪崩
   */
  function fetch(callback) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject()
      })
    })
  }
  
  async function main() {
    const result = await fetch()
    console.log('请求处理', result) // 永远不会执行
  }
  
  main()
  ```

  * async await 无法捕获的异常

    Promise 无法捕获的异常 一样，这也是 await 的软肋，不过任然可以通过第六章的方案解决

  ```js
  function thirdFunction() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject('收敛一些')
      })
    })
  }
  
  /**
   * 为什么 await 是更加优雅的方案
   */
  async function main() {
    try {
      const result1 = await secondFunction() // 如果不抛出异常，后续继续执行
      const result2 = await thirdFunction() // 抛出异常
      const result3 = await thirdFunction() // 永远不会执行
      console.log('请求处理', result) // 永远不会执行
    } catch (error) {
      console.log('异常', error) // 异常 收敛一些
    }
  }
  
  main()
  ```

### 资源加载 —— 不会冒泡，无法使用 window.onerror

* Object.onerror

  ```html
  <img src="image.gif" onerror="alert('The image could not be loaded.')" />
  ```

* Performance.getEntries

* Error 事件捕获



### 错误上报

* Ajax发送数据

  ```html
  <script>
    window.onerror = function (msg, url, row, col, error) {
      console.log('我知道错误了，也知道错误信息')
      console.log({
        msg,  url,  row, col, error
      })
      return true;
    };
  </script>
  <script src="http://localhost:8081/test.js" crossorigin></script>
  // http://localhost:8081/test.js
  setTimeout(() => {
    console.log(error);
  });
  ```

* 动态创建 img 标签

  ```js
  function report(error) {
    var reportUrl = 'http://xxxx/report';
    new Image().src = reportUrl + 'error=' + error;
  }
  ```

  

