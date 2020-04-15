# State

###Vuex

你有写过vuex中store的插件吗？

vuex中actions和mutations有什么区别？

vuex使用actions时不支持多参数传递怎么办？

vuex怎么知道state是通过mutation修改还是外部直接修改的？

请求数据是写在组件的methods中还是在vuex的action中？

vuex的action和mutation的特性是什么？有什么区别？

vuex的state、getter、mutation、action、module特性分别是什么？

vuex的store有几个属性值？分别讲讲它们的作用是什么？

#### Redux

Redux中异步action和同步action最大的区别是什么？

举例说明怎么在Redux中定义action？

在Redux中怎么发起网络请求？

Redux怎样重置状态？

Redux怎样设置初始状态？

Context api可以取代Redux吗？为什么？

在React中你是怎么对异步方案进行选型的？

你有了解Rxjs是什么吗？它是做什么的？

#### Redux-saga

redux-saga和redux-thunk有什么本质的区别？

你知道redux-saga的原理吗？

你有使用过redux-saga中间件吗？它是干什么的？

#### Mobx

Mobx的设计思想是什么？

Mobx和Redux有什么区别？

在React项目中你是如何选择Redux和Mobx的？说说你的理解

你有在React中使用过Mobx吗？它的运用场景有哪些？

#### Flux

请说说点击按钮触发到状态更改，数据的流向？

请描述下Flux的思想

什么是Flux？说说你对Flux的理解？有哪些运用场景？



### 背景

* props 和 state / data
* 完整的应用让两个组件互相通信异常困难
* 数据总是从顶层向下分发（单向），子组件回调在概念上可以影响父组件的 state / data
* 为了面临所有可能的扩展，把所有 state / data 集中到所有组件顶层，然后分发
* 为了更好的管理 state，需要专业的库来分发顶层 state ——> Redux / Vuex

### Flux

单向数据流方案

![img](https://pic2.zhimg.com/80/v2-fb6a545f55dac505d0ded33fa2284bc5_hd.jpg)

**Redux**： view——>actions——>reducer——>state变化——>view变化（同步异步一样）

**Vuex**： view——>commit——>mutations——>state变化——>view变化（同步操作）

​			  view——>dispatch——>actions——>mutations——>state变化——>view变化（异步操作）

### Vuex

Vuex 和单纯的全局对象有以下两点不同：

1. Vuex 的状态存储是响应式的。当 Vue 组件从 store 中读取状态的时候，若 store 中的状态发生变化，那么相应的组件也会相应地得到高效更新。
2. 你不能直接改变 store 中的状态。改变 store 中的状态的唯一途径就是显式地**提交 (commit) mutation**。这样使得我们可以方便地跟踪每一个状态的变化，从而让我们能够实现一些工具帮助我们更好地了解我们的应用。

```js
// 如果在模块化构建系统中，请确保在开头调用了 Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment (state) {
      state.count++
    }
  }
})
```

现在，你可以通过 `store.state` 来获取状态对象，以及通过 `store.commit` 方法触发状态变更：

```js
store.commit('increment')

console.log(store.state.count) // -> 1
```

#### state

通过在根实例中注册 `store` 选项，该 store 实例会注入到根组件下的所有子组件中，且子组件能通过 `this.$store` 访问到。让我们更新下 `Counter` 的实现：

```js
const Counter = {
  template: `<div>{{ count }}</div>`,
  computed: {
    count () {
      return this.$store.state.count
    }
  }
}
```

##### mapState

```js
computed: {
  localComputed () { /* ... */ },
  // 使用对象展开运算符将此对象混入到外部对象中
  ...mapState({
    // ...
  })
}
```

#### Getter

Vuex 允许我们在 store 中定义“getter”（可以认为是 store 的计算属性）。就像计算属性一样，getter 的返回值会根据它的依赖被缓存起来，且只有当它的依赖值发生了改变才会被重新计算。

```js
const store = new Vuex.Store({
  state: {
    todos: [
      { id: 1, text: '...', done: true },
      { id: 2, text: '...', done: false }
    ]
  },
  getters: {
    doneTodos: state => {
      return state.todos.filter(todo => todo.done)
    }
  }
})
```

```js
computed: {
  doneTodosCount () {
    return this.$store.getters.doneTodosCount
  }
}
```

##### mapGetters

```js
import { mapGetters } from 'vuex'

export default {
  // ...
  computed: {
  // 使用对象展开运算符将 getter 混入 computed 对象中
    ...mapGetters([
      'doneTodosCount',
      'anotherGetter',
      // ...
    ])
  }
}
```

#### Mutation

更改 Vuex 的 store 中的状态的唯一方法是提交 mutation。Vuex 中的 mutation 非常类似于事件：每个 mutation 都有一个字符串的 **事件类型 (type)** 和 一个 **回调函数 (handler)**。这个回调函数就是我们实际进行状态更改的地方，并且它会接受 state 作为第一个参数：

```js
// mutation-types.js
export const SOME_MUTATION = 'SOME_MUTATION'
// store.js
import Vuex from 'vuex'
import { SOME_MUTATION } from './mutation-types'

const store = new Vuex.Store({
  state: { ... },
  mutations: {
    // 我们可以使用 ES2015 风格的计算属性命名功能来使用一个常量作为函数名
    [SOME_MUTATION] (state) {
      // mutate state
    }
  }
})
```

#### Action

Action 类似于 mutation，不同在于：

- Action 提交的是 mutation，而不是直接变更状态。
- Action 可以包含任意异步操作。

```js
const store = new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment (state) {
      state.count++
    }
  },
  actions: {
    increment (context) {
      context.commit('increment')
    }
  }
})
```

```js
store.dispatch('actionA').then(() => {
  // ...
})

// 假设 getData() 和 getOtherData() 返回的是 Promise
actions: {
  async actionA ({ commit }) {
    commit('gotData', await getData())
  },
  async actionB ({ dispatch, commit }) {
    await dispatch('actionA') // 等待 actionA 完成
    commit('gotOtherData', await getOtherData())
  }
}
```

#### Module

由于使用单一状态树，应用的所有状态会集中到一个比较大的对象。当应用变得非常复杂时，store 对象就有可能变得相当臃肿。

为了解决以上问题，Vuex 允许我们将 store 分割成**模块（module）**。每个模块拥有自己的 state、mutation、action、getter、甚至是嵌套子模块——从上至下进行同样方式的分割：

```js
const moduleA = {
  state: { ... },
  mutations: { ... },
  actions: { ... },
  getters: { ... }
}

const moduleB = {
  state: { ... },
  mutations: { ... },
  actions: { ... }
}

const store = new Vuex.Store({
  modules: {
    a: moduleA,
    b: moduleB
  }
})

store.state.a // -> moduleA 的状态
store.state.b // -> moduleB 的状态
```

##### 命名空间

如果希望你的模块具有更高的封装度和复用性，你可以通过添加 `namespaced: true` 的方式使其成为带命名空间的模块。当模块被注册后，它的所有 getter、action 及 mutation 都会自动根据模块注册的路径调整命名。例如：

```js
{
  actions: {
    someOtherAction ({dispatch}) {
      dispatch('someAction')
    }
  },
  modules: {
    foo: {
      namespaced: true,

      actions: {
        someAction: {
          root: true,
          handler (namespacedContext, payload) { ... } // -> 'someAction'
        }
      }
    }
  }
}
```

##### 带命名空间的绑定函数

```js
computed: {
  ...mapState({
    a: state => state.some.nested.module.a,
    b: state => state.some.nested.module.b
  })
},
methods: {
  ...mapActions([
    'some/nested/module/foo', // -> this['some/nested/module/foo']()
    'some/nested/module/bar' // -> this['some/nested/module/bar']()
  ])
}
```

#### Plugins

```js
import createVuexAlong from "vuex-along";

const moduleA = {
  state: {
    a1: "hello",
    a2: "world",
  },
};

const store = new Vuex.Store({
  state: {
    count: 0,
  },
  modules: {
    ma: moduleA,
  },
  plugins: [
    createVuexAlong({
      // 设置保存的集合名字，避免同站点下的多项目数据冲突
      name: "hello-vuex-along",
      local: {
        list: ["ma"],
        // 过滤模块 ma 数据， 将其他的存入 localStorage
        isFilter: true,
      },
      session: {
        // 保存模块 ma 中的 a1 到 sessionStorage
        list: ["ma.a1"],
      },
    }),
  ],
});
```

到此为止，插件已经生效了，默认会存储所有 state 到 localStorage



### Context

Context 主要应用场景在于*很多*不同层级的组件需要访问同样一些的数据。

##### 使用场景

Context 设计目的是为了共享那些对于一个组件树而言是“全局”的数据，例如当前认证的用户、主题或首选语言。

使用 context, 我们可以避免通过中间元素传递 props

##### 在React怎么使用Context

```jsx
import ReactDOM from "react-dom";
import React, { Component } from "react";

// 首先创建一个 context 对象这里命名为：ThemeContext
const { Provider, Consumer } = React.createContext("light");

// 创建一个祖先组件组件 内部使用Provier 这个对象创建一个组件 其中 value 属性是真实传递的属性
class App extends Component {
  render() {
    return (
      <Provider value="dark">
        <Toolbar />
      </Provider>
    );
  }
}

// 渲染 button 组件的外层包裹的属性
function Toolbar() {
  return (
    <div>
      <ThemeButton />
    </div>
  );
}
// 在 Toolbar 中渲染的button 组件 返回一个 consumer （消费者）将组件组件的 value 值跨组件传递给 // ThemeButton 组件
function ThemeButton(props) {
  return (
    <Consumer>
      {theme => (
        <button {...props} theme={theme}>
          {theme}
        </button>
      )}
    </Consumer>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
```

说说你对React的Context的理解

说说Context有哪些属性？

##### 为什么React并不推荐我们优先考虑使用Context？

- Context 目前还处于实验阶段，可能会在后面的发行版本中有很大的变化，事实上这种情况已经发生了，所以为了避免给今后升级带来大的影响和麻烦，不建议在 app 中使用 context。
- 尽管不建议在 app 中使用 context，但是独有组件而言，由于影响范围小于 app，如果可以做到高内聚，不破坏组件树之间的依赖关系，可以考虑使用 context
- 对于组件之间的数据通信或者状态管理，有效使用 props 或者 state 解决，然后再考虑使用第三方的成熟库进行解决，以上的方法都不是最佳的方案的时候，在考虑 context。
- context 的更新需要通过 setState()触发，但是这并不是很可靠的，Context 支持跨组件的访问，但是如果中间的子组件通过一些方法不影响更新，比如 shouldComponentUpdate() 返回 false 那么不能保证 Context 的更新一定可以使用 Context 的子组件，因此，Context 的可靠性需要关注。



除了实例的属性可以获取Context外哪些地方还能直接获取Context呢？

childContextTypes是什么？它有什么用？

contextType是什么？它有什么用？



Consumer向上找不到Provider的时候怎么办？



### Redux

![img](https://pic4.zhimg.com/80/v2-9e7e7d6b492706746ba19845bd559963_hd.jpg)

##### Redux 三大原则

* 单一数据源 —— 通过 combineReducer 化解对象过于庞大的问题
* 状态是只读的
* 状态修改均由纯函数（避免副作用）完成



<img src="https://pic2.zhimg.com/80/v2-c2b8b01ea0614fd693695b6141ebb6b9_hd.jpg" alt="img" style="zoom:80%;" />



##### Redux 三要素

* action: 纯声明的数据结构，只提供事件所需的所有要素，不提供逻辑
* reducer: 匹配函数，action 的 dispatch 是全局的，所有 reducer都可以捕捉并匹配与否，相关的就拿走 action 的要素进行逻辑处理，修改 store 中的状态
* store: 负责存储状态，并可以被 react API 回调，发布 action



##### Redux API

###### createStore(reducer, [preloadedState], enhancer)



###### Store

- [`getState()`](https://www.redux.org.cn/docs/api/Store.html#getState)
- [`dispatch(action)`](https://www.redux.org.cn/docs/api/Store.html#dispatch)
- [`subscribe(listener)`](https://www.redux.org.cn/docs/api/Store.html#subscribe)
- [`replaceReducer(nextReducer)`](https://www.redux.org.cn/docs/api/Store.html#replaceReducer)



###### combinedReducers

随着应用变得越来越复杂，可以考虑将 [reducer 函数](https://www.redux.org.cn/docs/Glossary.html#reducer) 拆分成多个单独的函数，拆分后的每个函数负责独立管理 [state](https://www.redux.org.cn/docs/Glossary.html#state) 的一部分。

###### applyMiddleware

```js
import { createStore, applyMiddleware } from 'redux'
import todos from './reducers'

function logger({ getState }) {
  return (next) => (action) => {
    console.log('will dispatch', action)

    // 调用 middleware 链中下一个 middleware 的 dispatch。
    let returnValue = next(action)

    console.log('state after dispatch', getState())

    // 一般会是 action 本身，除非
    // 后面的 middleware 修改了它。
    return returnValue
  }
}

let store = createStore(
  todos,
  [ 'Use Redux' ],
  applyMiddleware(logger)
)

store.dispatch({
  type: 'ADD_TODO',
  text: 'Understand the middleware'
})
// (将打印如下信息:)
// will dispatch: { type: 'ADD_TODO', text: 'Understand the middleware' }
// state after dispatch: [ 'Use Redux', 'Understand the middleware' ]
```



```js
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import rootReducer from './reducers'
import App from './components/App'

const store = createStore(rootReducer)

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
```

actions/index.js，创建 Action：

```js
let nextTodoId = 0
export const addTodo = text => ({
  type: 'ADD_TODO',
  id: nextTodoId++,
  text
})

export const setVisibilityFilter = filter => ({
  type: 'SET_VISIBILITY_FILTER',
  filter
})

export const toggleTodo = id => ({
  type: 'TOGGLE_TODO',
  id
})

export const VisibilityFilters = {
  SHOW_ALL: 'SHOW_ALL',
  SHOW_COMPLETED: 'SHOW_COMPLETED',
  SHOW_ACTIVE: 'SHOW_ACTIVE'
}
```

reducers/todos.js，创建 Reducers：

```js
const todos = (state = [], action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        {
          id: action.id,
          text: action.text,
          completed: false
        }
      ]
    case 'TOGGLE_TODO':
      return state.map(todo =>
        todo.id === action.id ? { ...todo, completed: !todo.completed } : todo
      )
    default:
      return state
  }
}

export default todos
```

reducers/index.js，把所有的 Reducers 绑定到一起：

```js
import { combineReducers } from 'redux'
import todos from './todos'
import visibilityFilter from './visibilityFilter'

export default combineReducers({
  todos,
  visibilityFilter,
  ...
})
```

containers/VisibleTodoList.js，容器组件，connect 负责连接React组件和Redux Store：

```js
import { connect } from 'react-redux'
import { toggleTodo } from '../actions'
import TodoList from '../components/TodoList'

const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case 'SHOW_COMPLETED':
      return todos.filter(t => t.completed)
    case 'SHOW_ACTIVE':
      return todos.filter(t => !t.completed)
    case 'SHOW_ALL':
    default:
      return todos
  }
}

// mapStateToProps 函数指定如何把当前 Redux store state 映射到展示组件的 props 中
const mapStateToProps = state => ({
  todos: getVisibleTodos(state.todos, state.visibilityFilter)
})

// mapDispatchToProps 方法接收 dispatch() 方法并返回期望注入到展示组件的 props 中的回调方法。
const mapDispatchToProps = dispatch => ({
  toggleTodo: id => dispatch(toggleTodo(id))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TodoList)
```

#### React-redux

```jsx
ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" component={App}>
        <Route path="foo" component={Foo}/>
        <Route path="bar" component={Bar}/>
      </Route>
    </Router>
  </Provider>,
  document.getElementById('root')
)
```

##### Provider

普通组件，作为顶层 app 的出发点，它只需要 store 属性，将 state 分发给所有被 connect 的组件，不管位置在哪

```jsx
import * as todoActionCreators from './todoActionCreators'
import * as counterActionCreators from './counterActionCreators'
import { bindActionCreators } from 'redux'

function mapStateToProps(state) {
  return { todos: state.todos }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(Object.assign({}, todoActionCreators, counterActionCreators), dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TodoApp)
```

##### Connect

curry 函数，先接受（数据绑定 **mapStateToProps**  和事件绑定 **mapDispatchToProps**），再接受一个参数（将要绑定的组件本身）

##### mapStateToProps

##### ![image-20200115143950720](/Users/zhangshuai/Library/Application Support/typora-user-images/image-20200115143950720.png)

构建好 Redux 系统后，会被自动初始化，分拣出来需要的 Redux 状态



作为函数，`mapStateToProps`执行后应该返回一个对象，里面的每一个键值对就是一个映射。请看下面的例子。

```js
const mapStateToProps = (state) => {
  return {
    todos: getVisibleTodos(state.todos, state.visibilityFilter)
  }
}
```

`mapStateToProps` 会订阅 Store，每当 `state` 更新的时候，就会自动执行，重新计算 UI 组件的参数，从而触发 UI 组件的重新渲染。

尽管 React Redux 已经优化并尽量减少对 `mapStateToProps` 的调用次数，加快 `mapStateToProps` 执行并减少其执行次数仍然是非常有价值的。普遍的推荐方式是利用 [Reselect](https://github.com/reactjs/reselect) 创建可记忆（memoized）的 “selector” 方法。这样，selector 就能被组合在一起，并且同一管道（pipeline）后面的 selector 只有当输入变化时才会执行。意味着你可以像筛选器或过滤器那样创建 selector，并确保任务的执行时机。



##### mapDispatchToProps

##### ![image-20200115143554128](/Users/zhangshuai/Library/Application Support/typora-user-images/image-20200115143554128.png)

也就是说，它定义了哪些用户的操作应该当作 Action，传给 Store。



如果`mapDispatchToProps`是一个函数，会得到`dispatch`和`ownProps`（容器组件的`props`对象）两个参数。

```js
const mapDispatchToProps = (
  dispatch,
  ownProps
) => {
  return {
    onClick: () => {
      dispatch({
        type: 'SET_VISIBILITY_FILTER',
        filter: ownProps.filter
      });
    }
  };
}
```

声明好的 action 作为回调，也可被注入到组件内，参数为 dispatch



### Middleware

![在这里插入图片描述](https://image-static.segmentfault.com/289/215/2892151181-5ab48de7b5013)

核心思想：将 middleware 进行组合，将当前 middleware 执行一遍作为参数传给下一个 middleware 去执行

* 搜集 middleware
* 组合 middleware
* 调用执行

#### React Transaction

```js
/**
 * <pre>
 *                       wrappers (injected at creation time)
 *                                      +        +
 *                                      |        |
 *                    +-----------------|--------|--------------+
 *                    |                 v        |              |
 *                    |      +---------------+   |              |
 *                    |   +--|    wrapper1   |---|----+         |
 *                    |   |  +---------------+   v    |         |
 *                    |   |          +-------------+  |         |
 *                    |   |     +----|   wrapper2  |--------+   |
 *                    |   |     |    +-------------+  |     |   |
 *                    |   |     |                     |     |   |
 *                    |   v     v                     v     v   | wrapper
 *                    | +---+ +---+   +---------+   +---+ +---+ | invariants
 * perform(anyMethod) | |   | |   |   |         |   |   | |   | | maintained
 * +----------------->|-|---|-|---|-->|anyMethod|---|---|-|---|-|-------->
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | +---+ +---+   +---------+   +---+ +---+ |
 *                    |  initialize                    close    |
 *                    +-----------------------------------------+
 * </pre>
 */
```

```js
wrapper 1: initialize
wrapper 2: initialize
performing: Ouyang is calculating: a + b = 3
wrapper 1: close
wrapper 2: close
the result is 3
```



#### Redux ApplyMiddleware

```js
export default function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */
export default function applyMiddleware(...middlewares) {
  return (createStore) => (reducer, preloadedState, enhancer) => {
    const store = createStore(reducer, preloadedState, enhancer)
    let dispatch = store.dispatch
    let chain = []

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action) => dispatch(action)
    }
    chain = middlewares.map(middleware => middleware(middlewareAPI))
    dispatch = compose(...chain)(store.dispatch)

    return {
      ...store,
      dispatch
    }
  }
}
```



#### Koa middleware

```js
const Koa = require("koa");

const app = new Koa();

app.use(async (ctx, next) => {
    console.log(1);
    await next();
    console.log(2);
});

app.use(async (ctx, next) => {
    console.log(3);
    await next();
    console.log(4);
});

app.use(async (ctx, next) => {
    console.log(5);
    await next();
    console.log(6);
});

app.listen(3000);

// 1
// 3
// 5
// 6
// 4
// 2
```

##### compose

[Koa2 洋葱模型 —— compose 串联中间件的四种实现](https://zhuanlan.zhihu.com/p/45837799)

```js
/**
 * @param {*} middleware 
 * 这里compose函数返回了一个Generator，
 * 所以上面的代码可以变成下面的样子（当然还有middleware的变量再闭包中）
 */
function compose(middleware){
  return function *(next){
    if (!next) next = noop()

    var i = middleware.length

    while (i--) {
      next = middleware[i].call(this, next)
    }

    return yield *next
  }
}

function *noop(){}
```

compose 函数做的工作

* 执行所有 generator 函数，得到新的 generator
* 将 generator 作为下一次 generator 函数执行的参数 next
* 返回一个入口 generator

![image-20200117124150090](/Users/zhangshuai/Library/Application Support/typora-user-images/image-20200117124150090.png)

CO 不断调用 gen.next()，若 yield 遇到非 generator 对象，则将其包裹在 promise 里，等待其完成触发 resolve，然后继续在当前 generator 里执行下去，若遇到新的 generator，则开启一个新的 co，调用新的 generator 的 next 方法

![image-20200117133213710](/Users/zhangshuai/Library/Application Support/typora-user-images/image-20200117133213710.png)



### Redux异步

**把异步请求部分放在了 action creator 中**

#### Redux-thunk

它就是加强了dispatch的功能，在dispatch一个action之前，去判断action是否是一个函数，如果是函数，那么就执行这个函数。

```js
function createThunkMiddleware(extraArgument) {
  return ({ dispatch, getState }) => (next) => (action) => {
    if (typeof action === 'function') {
      return action(dispatch, getState, extraArgument);
    }

    return next(action);
  };
}

const thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;

export default thunk;
```



thunk 比较简单，没有做太多的封装，把大部分自主权交给了用户：

```js
const createFetchDataAction = function(id) {
    return function(dispatch, getState) {
        // 开始请求，dispatch 一个 FETCH_DATA_START action
        dispatch({
            type: FETCH_DATA_START, 
            payload: id
        })
        api.fetchData(id) 
            .then(response => {
                // 请求成功，dispatch 一个 FETCH_DATA_SUCCESS action
                dispatch({
                    type: FETCH_DATA_SUCCESS,
                    payload: response
                })
            })
            .catch(error => {
                // 请求失败，dispatch 一个 FETCH_DATA_FAILED action   
                dispatch({
                    type: FETCH_DATA_FAILED,
                    payload: error
                })
            }) 
    }
}

//reducer
const reducer = function(oldState, action) {
    switch(action.type) {
    case FETCH_DATA_START : 
        // 处理 loading 等
    case FETCH_DATA_SUCCESS : 
        // 更新 store 等
    case FETCH_DATA_FAILED : 
        // 提示异常
    }
}
```

缺点就是用户要写的代码有点多，可以看到上面的代码比较啰嗦，一个请求就要搞这么一套东西。

#### Redux-promise

redus-promise 和 redux-thunk 的思想类似，只不过做了一些简化，成功失败手动 dispatch 被封装成自动了：

```js
const FETCH_DATA = 'FETCH_DATA'
//action creator
const getData = function(id) {
    return {
        type: FETCH_DATA,
        payload: api.fetchData(id) // 直接将 promise 作为 payload
    }
}
//reducer
const reducer = function(oldState, action) {
    switch(action.type) {
    case FETCH_DATA: 
        if (action.status === 'success') {
             // 更新 store 等处理
        } else {
                // 提示异常
        }
    }
}
```

#### Redux-saga

再回到 redux-saga 来，可以把 saga 想象成开了一个以最快速度不断地调用 next 方法并尝试获取所有 yield 表达式值的线程。举个例子：

```js
// saga.js
import { take, put } from 'redux-saga/effects'

function* mySaga(){ 
    // 阻塞: take方法就是等待 USER_INTERACTED_WITH_UI_ACTION 这个 action 执行
    yield take(USER_INTERACTED_WITH_UI_ACTION);
    // 阻塞: put方法将同步发起一个 action
    yield put(SHOW_LOADING_ACTION, {isLoading: true});
    // 阻塞: 将等待 FetchFn 结束，等待返回的 Promise
    const data = yield call(FetchFn, 'https://my.server.com/getdata');
    // 阻塞: 将同步发起 action (使用刚才返回的 Promise.then)
    yield put(SHOW_DATA_ACTION, {data: data});
}
```

用了 saga，我们就可以很细粒度的控制各个副作用每一部的操作，可以把异步操作和同步发起 action 一起，随便的排列组合。saga 还提供 takeEvery、takeLatest 之类的辅助函数，来控制是否允许多个异步请求同时执行，尤其是 takeLatest，方便处理由于网络延迟造成的多次请求数据冲突或混乱的问题。

saga 还能很方便的并行执行异步任务，或者让两个异步任务竞争：

```js
// 并行执行，并等待所有的结果，类似 Promise.all 的行为
const [users, repos] = yield [
  call(fetch, '/users'),
  call(fetch, '/repos')
]

// 并行执行，哪个先完成返回哪个，剩下的就取消掉了
const {posts, timeout} = yield race({
  posts: call(fetchApi, '/posts'),
  timeout: call(delay, 1000)
})
```

#### Dva

![img](https://pic2.zhimg.com/80/v2-b422760dc4344512045f08287e893591_hd.jpg)

约定优于配置的思想，Dva正式借鉴了这个思想。



之前我们聊了 redux、react-redux、redux-saga 之类的概念，大家肯定觉得头昏脑涨的，什么 action、reducer、saga 之类的，写一个功能要在这些js文件里面不停的切换。

dva 做的事情很简单，就是让这些东西可以写到一起，不用分开来写了。比如：

```js
app.model({
  // namespace - 对应 reducer 在 combine 到 rootReducer 时的 key 值
  namespace: 'products',
  // state - 对应 reducer 的 initialState
  state: {
    list: [],
    loading: false,
  },
  // subscription - 在 dom ready 后执行
  subscriptions: [
    function(dispatch) {
      dispatch({type: 'products/query'});
    },
  ],
  // effects - 对应 saga，并简化了使用
  effects: {
    ['products/query']: function*() {
      yield call(delay(800));
      yield put({
        type: 'products/query/success',
        payload: ['ant-tool', 'roof'],
      });
    },
  },
  // reducers - 就是传统的 reducers
  reducers: {
    ['products/query'](state) {
      return { ...state, loading: true, };
    },
    ['products/query/success'](state, { payload }) {
      return { ...state, loading: false, list: payload };
    },
  },
});
```

#### Mobx

```js
import React, { Component } from 'react';
import { observable, action } from 'mobx';
import { Provider, observer, inject } from 'mobx-react';

// 定义数据结构
class Store {
  // ① 使用 observable decorator 
  @observable a = 0;
}

// 定义对数据的操作
class Actions {
  constructor({store}) {
    this.store = store;
  }
  // ② 使用 action decorator 
  @action
  incA = () => {
    this.store.a++;
  }
  @action
  decA = () => {
    this.store.a--;
  }
}

// ③实例化单一数据源
const store = new Store();
// ④实例化 actions，并且和 store 进行关联
const actions = new Actions({store});

// inject 向业务组件注入 store，actions，和 Provider 配合使用
// ⑤ 使用 inject decorator 和 observer decorator
@inject('store', 'actions')
@observer
class Demo extends Component {
  render() {
    const { store, actions } = this.props;
    return (
      <div>
        <p>a = {store.a}</p>
        <p>
          <button className="ui-btn" onClick={actions.incA}>增加 a</button>
          <button className="ui-btn" onClick={actions.decA}>减少 a</button>
        </p>
      </div>
    );
  }
}

class App extends Component {
  render() {
    // ⑥使用Provider 在被 inject 的子组件里，可以通过 props.store props.actions 访问
    return (
      <Provider store={store} actions={actions}>
        <Demo />
      </Provider>
    )
  }
}

export default App;
```

- Redux 数据流流动很自然，可以充分利用时间回溯的特征，增强业务的可预测性；MobX 没有那么自然的数据流动，也没有时间回溯的能力，但是 View 更新很精确，**粒度控制很细**。
- Redux 通过引入一些中间件来处理副作用；MobX 没有中间件，副作用的处理比较自由，比如依靠 autorunAsync 之类的方法。
- Redux 的样板代码更多；而 MobX 基本没啥多余代码



[像呼吸一样自然：React hooks + RxJS](https://zhuanlan.zhihu.com/p/50921147)

### Rxjs

ReactiveX 结合了 [观察者模式](https://en.wikipedia.org/wiki/Observer_pattern)、[迭代器模式](https://en.wikipedia.org/wiki/Iterator_pattern) 和 [使用集合的函数式编程](http://martinfowler.com/articles/collection-pipeline/#NestedOperatorExpressions)，以满足以一种理想方式来管理事件序列所需要的一切。

在 RxJS 中用来解决异步事件管理的的基本概念是：

- **Observable (可观察对象):** 表示一个概念，这个概念是一个可调用的未来值或事件的集合。
- **Observer (观察者):** 一个回调函数的集合，它知道如何去监听由 Observable 提供的值。
- **Subscription (订阅):** 表示 Observable 的执行，主要用于取消 Observable 的执行。
- **Operators (操作符):** 采用函数式编程风格的纯函数 (pure function)，使用像 `map`、`filter`、`concat`、`flatMap` 等这样的操作符来处理集合。
- **Subject (主体):** 相当于 EventEmitter，并且是将值或事件多路推送给多个 Observer 的唯一方式。
- **Schedulers (调度器):** 用来控制并发并且是中央集权的调度员，允许我们在发生计算时进行协调，例如 `setTimeout` 或 `requestAnimationFrame` 或其他。



#### Redux-observable



### Storage

| 特性           | Cookie                                                       | localStorage                                                | sessionStorage                               |
| :------------- | :----------------------------------------------------------- | :---------------------------------------------------------- | :------------------------------------------- |
| 数据的生命期   | 一般由服务器生成，可设置失效时间。如果在浏览器端生成Cookie，默认是关闭浏览器后失效 | 除非被清除，否则永久保存                                    | 仅在当前会话下有效，关闭页面或浏览器后被清除 |
| 存放数据大小   | 4K左右                                                       | 一般为5MB                                                   |                                              |
| 与服务器端通信 | 每次都会携带在HTTP头中，如果使用cookie保存过多数据会带来性能问题 | 仅在客户端（即浏览器）中保存，不参与和服务器的通信          |                                              |
| 易用性         | 需要程序员自己封装，源生的Cookie接口不友好                   | 源生接口可以接受，亦可再次封装来对Object和Array有更好的支持 |                                              |

#### LocalStorage | SessionStorage

##### setItem存储value

用途：将value存储到key字段

```
sessionStorage.setItem("key", "value");     localStorage.setItem("site", "js8.in");
```

##### getItem获取value

用途：获取指定key本地存储的值

```
var value = sessionStorage.getItem("key");     var site = localStorage.getItem("site");
```

##### removeItem删除key

用途：删除指定key本地存储的值

```
sessionStorage.removeItem("key");     localStorage.removeItem("site");
```

##### clear清除所有的key/value

用途：清除所有的key/value

```
sessionStorage.clear();     localStorage.clear();
```



#### Cookie

```js
var cookie = {
  set: function (key, val, time) {
    var date = new Date();
    var expiresDays = time;
    date.setTime(date.getTime() + expiresDays * 24 * 3600 * 1000);
    // 设置cookie
    document.cookie = key + "=" + val + ";expires=" + date.toGMTString() + ";path=/";
    // 时间可以不要，但路径(path)必须要填写，因为JS的默认路径是当前页，如果不填，此cookie只在当前页面生效
    // 即document.cookie= name+"="+value+";path=/";
  },
  get: function (key) { //获取cookie方法
    /* 获取cookie参数 */
    var getCookie = document.cookie.replace(/[ ]/g, "");
    var arrCookie = getCookie.split(";")
    var tips;
    for (var i = 0; i < arrCookie.length; i++) {
      var arr = arrCookie[i].split("=");
      if (key == arr[0]) {
        tips = arr[1];
        break;
      }
    }
    return tips;
  },
  delete: function (key) {
    var date = new Date();
    date.setTime(date.getTime() - 10000);
    document.cookie = key + "=v; expires =" + date.toGMTString();
  }
}
```

使用方式：

```js
cookie.get("key"); // 获取cookie
cookie.set("key",value,1); // 设置为1天过期
```

* httpOnly
* sameSite
  * strict：完全禁止
  * lax：三方站点打开，提交 get 方式表单
  * none：任何情况



#### Session

1. session 在服务器端，cookie 在客户端（浏览器）
2.  session 默认被存在在服务器的一个文件里（不是内存）
3. session 的运行依赖 session id，而 session id 是存在 cookie 中的，也就是说，如果浏览器禁用了 cookie ，同时 session 也会失效（但是可以通过其它方式实现，比如在 url 中传递 session_id）
4. session 可以放在 文件、数据库、或内存中都可以。
5. 用户验证这种场合一般会用 session 



因此，维持一个会话的核心就是客户端的唯一标识，即 session id



类似这种面试题，实际上都属于“开放性”问题，你扯到哪里都可以。不过如果我是面试官的话，我还是希望对方能做到一点——

**不要混淆 session 和 session 实现。**

本来 session 是一个抽象概念，开发者为了实现中断和继续等操作，将 user agent 和 server 之间一对一的交互，抽象为“会话”，进而衍生出“会话状态”，也就是 session 的概念。

 而 cookie 是一个实际存在的东西，http 协议中定义在 header 中的字段。可以认为是 session 的一种后端无状态实现。

而我们今天常说的 “session”，是为了绕开 cookie 的各种限制，通常借助 cookie 本身和后端存储实现的，一种更高级的会话状态实现。

所以 cookie 和 session，你可以认为是同一层次的概念，也可以认为是不同层次的概念。具体到实现，session 因为 session id 的存在，通常要借助 cookie 实现，但这并非必要，只能说是通用性较好的一种实现方案。



#### IndexDB

IndexedDB是一种低级API，用于客户端存储大量结构化数据(包括, 文件/ blobs)。该API使用索引来实现对该数据的高性能搜索。

ndexedDB是一个事务型数据库系统，类似于基于SQL的RDBMS。 然而，不像RDBMS使用固定列表，IndexedDB是一个基于JavaScript的面向对象的数据库。 IndexedDB允许您存储和检索用**键**索引的对象；可以存储[结构化克隆算法](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/The_structured_clone_algorithm)支持的任何对象。 您只需要指定数据库模式，打开与数据库的连接，然后检索和更新一系列**事务**。

##### 创建或者打开数据库

```js
/* 对不同浏览器的indexedDB进行兼容 */
const indexeddb = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
/* 创建或连接数据库 */
const request = indexeddb.open(name, version);  // name：数据库名，version：数据库版本号
```

因为indexedDB在不同的浏览器上有兼容性，所以我们需要些一个兼容函数来兼容indexedDB。

##### 连接到数据库的回调函数

```js
request.addEventListener('success', function(event){ 
    // 打开或创建数据库成功
}, false);

request.addEventListener('error', function(event){ 
    // 打开或创建数据库失败
}, false);

request.addEventListener('upgradeneeded', function(event){ 
    // 更新数据库时执行
}, false);
```

在连接到数据库后，request会监听三种状态：
success：打开或创建数据库成功
error：打开或创建数据库失败
upgradeneeded：更新数据库
upgradeneeded状态是在indexedDB创建新的数据库时和indexeddb.open(name, version) version（数据库版本号）发生变化时才能监听到此状态。当版本号不发生变化时，不会触发此状态。数据库的ObjectStore的创建、删除等都是在这个监听事件下执行的。

##### 创建、删除ObjectStore

在indexedDB中，ObjectStore类似于数据库的表。

```js
request.addEventListener('upgradeneeded', function(event){ 
    // 创建数据库实例
    const db = event.target.result;

    // 关闭数据库
    db.close();
    
    // 判断是否有ObjectStore
    db.objectStoreNames.contains(objectStoreName);
    
    // 删除ObjectStore
    db.deleteObjectStore(objectStoreName);
    
}, false);
```

可以用如下方法创建一个ObjectStore

```js
request.addEventListener('upgradeneeded', function(event){ 
    // 创建数据库实例
    const db = event.target.result;
    
    // 判断是否有ObjectStore
    if(!db.objectStoreNames.contains(objectStoreName)){
        const store = db.createObjectStore(objectStoreName, {
            keyPath: keyPath  // keyPath 作为ObjectStore的搜索关键字
        });
        
        // 为ObjectStore创造索引
        store.createIndex(name,    // 索引
                          index,   // 键值
                          {
                              unique: unique  // 索引是否唯一
                          });
    }
    
}, false);
```

##### 数据的增删改查

```js
request.addEventListener('success', function(event){ 
    // 创建数据库实例
    const db = event.target.result;
    
    // 查找一个ObjectStore
    db.transaction(objectStoreName, wa);
    // wa为'readwrite'时，数据可以读写 
    // wa为'readonly'时，数据只读
    const store = transaction.objectStore(objectStoreName);
}, false);
```

数据库的增删改查：

```js
// 添加数据，当关键字存在时数据不会添加
store.add(obj);
// 更新数据，当关键字存在时覆盖数据，不存在时会添加数据
store.put(obj);
// 删除数据，删除指定的关键字对应的数据
store.delete(value);
// 清除ObjectStore
store.clear();
// 查找数据，根据关键字查找指定的数据
const g = store.get(value);
g.addEventListener('success', function(event){
    // 异步查找后的回调函数
}, false);
```

按索引查找数据

```js
const index = store.index(indexName);
const cursor = index.openCursor(range);

cursor.addEventListener('success', function(event){
    const result = event.target.result;
    if(result){
        result.value       // 数据
        result.continue(); // 迭代，游标下移
    }
}, false);
```

按索引的范围查找数据

```js
const index = store.index(indexName);
const cursor = index.openCursor(range);
/**
 * range为null时，查找所有数据
 * range为指定值时，查找索引满足该条件的对应的数据
 * range为IDBKeyRange对象时，根据条件查找满足条件的指定范围的数据
 */

// 大于或大于等于 
range = IDBKeyRange.lowerBound(value, true)   // (value, +∞)，>  value
range = IDBKeyRange.lowerBound(value, false)  // [value, +∞)，>= value
// 小于或小于等于，isOpen：true，开区间；false，闭区间
range = IDBKeyRange.upperBound(value, isOpen)
// 大于或大于等于value1，小于或小于等于value2
IDBKeyRange.bound(value1, value2, isOpen1, isOpen2)
```

#### WebSQL

##### openDatabase

我们可以使用这样简单的一条语句，创建或打开一个本地的数据库对象

```
var db = openDatabase('testDB', '1.0', 'Test DB', 2 * 1024 * 1024);
```

openDatabase接收五个参数：

1. 数据库名字
2. 数据库版本号
3. 显示名字
4. 数据库保存数据的大小（以字节为单位 )
5. 回调函数（非必须)

##### transaction

transaction方法用以处理事务，当一条语句执行失败的时候，整个事务回滚。方法有三个参数

1. 包含事务内容的一个方法
2. 执行成功回调函数（可选）
3. 执行失败回调函数（可选）

```js
db.transaction(function (context) {
	context.executeSql('CREATE TABLE IF NOT EXISTS testTable (id unique, name)');
	context.executeSql('INSERT INTO testTable (id, name) VALUES (0, "Byron")');
	context.executeSql('INSERT INTO testTable (id, name) VALUES (1, "Casper")');
	context.executeSql('INSERT INTO testTable (id, name) VALUES (2, "Frank")');
});
```

##### executeSql

executeSql方法用以执行SQL语句，返回结果，方法有四个参数

1. 查询字符串
2. 用以替换查询字符串中问号的参数
3. 执行成功回调函数（可选）
4. 执行失败回调函数（可选）

```js
db.transaction(function (context) {
  context.executeSql('SELECT * FROM testTable', [], function (context, results) {
   var len = results.rows.length, i;
   console.log('Got '+len+' rows.');
      for (i = 0; i < len; i++){
     console.log('id: '+results.rows.item(i).id);
     console.log('name: '+results.rows.item(i).name);
   }
});
```