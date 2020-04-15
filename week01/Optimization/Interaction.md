#  Optimization Interaction Stage



<img src="https://static001.geekbang.org/resource/image/4a/0c/4a942e53f9358c9c4634c310335cc10c.png" alt="img" style="zoom:80%;" />

### Reconciliation - Diff

标准的 Diff 算法 O(n^3)，Diff 算法降到 O(n)，是因为做了假设：

* 两个不同类型的元素会产生出不同的树
* 开发者可以通过 `key` prop 来暗示哪些子元素在不同的渲染下能保持稳定

节点类型不同 / 节点类型相同，但属性不同

**删除 div，插入 span，彻底销毁该节点，子节点也一并删除**

* Tree Diff

  React 通过 updateDepth 对 Virtual DOM 树进行层级控制，只会对相同颜色方框内的 DOM 节点进行比较，即同一个父节点下的所有子节点。当发现节点已经不存在，则该节点及其子节点会被完全删除掉，不会用于进一步的比较。这样只需要对树进行一次遍历，便能完成整个 DOM 树的比较。

  <img src="https://pic1.zhimg.com/80/0c08dbb6b1e0745780de4d208ad51d34_hd.png" alt="img" style="zoom:50%;" />

  当出现节点跨层级移动时，并不会出现想象中的移动操作，而是以 A 为根节点的树被整个重新创建，这是一种影响 React 性能的操作。

  <img src="https://pic2.zhimg.com/80/d712a73769688afe1ef1a055391d99ed_hd.png" alt="img" style="zoom:50%;" />

* component Diff

  <img src="https://pic1.zhimg.com/80/52654992aba15fc90e2dac8b2387d0c4_hd.png" alt="img" style="zoom:50%;" />

  * 如果是同一类型的组件，按照原策略继续比较 virtual DOM tree
  * 如果不是，则将该组件判断为 dirty component，从而替换整个组件下的所有子节点
  * 对于同一类型的组件，有可能其 Virtual DOM 没有任何变化，如果能够确切的知道这点那可以节省大量的 diff 运算时间，因此 React 允许用户通过 shouldComponentUpdate() 来判断该组件是否需要进行 diff

  

* Element Diff

  

  <img src="https://pic2.zhimg.com/80/7541670c089b84c59b84e9438e92a8e9_hd.png" alt="img" style="zoom:50%;" />

  通过唯一 **key** 发现新老集合中的节点都是相同的节点，因此无需进行节点删除和创建，只需要将老集合中节点的位置进行移动。

  <img src="https://pic4.zhimg.com/80/c0aa97d996de5e7f1069e97ca3accfeb_hd.png" alt="img" style="zoom:50%;" />

  * **INSERT_MARKUP** — 新的 component 类型不在老集合里， 即是全新的节点，需要对新节点执行插入操作。
  * **MOVE_EXISTING **— 在老集合有新 component 类型，且 element 是可更新的类型，generateComponentChildren 已调用 receiveComponent，这种情况下 prevChild=nextChild，就需要做移动操作，可以复用以前的 DOM 节点。
  * **REMOVE_NODE** — 老 component 类型，在新集合里也有，但对应的 element 不同则不能直接复用和更新，需要执行删除操作，或者老 component 不在新集合里的，也需要执行删除操作。

### Virtual DOM - (diff + patch 所花费的时间 < DOM 操作所花费的时间)

##### DOM的缺陷

我们可以调用document.body.appendChild(node)往 body 节点上添加一个元素，调用该 API 之后会引发一系列的连锁反应。

首先渲染引擎会将 node 节点添加到 body 节点之上，然后触发样式**计算、布局、绘制、栅格化、合成**等任务，我们把这一过程称为重排。除了重排之外，还有可能引起重绘或者合成操作，形象地理解就是“**牵一发而动全身**”。另外，对于 DOM 的不当操作还有可能引发 **强制同步布局** 和 **布局抖动** 的问题，这些操作都会大大降低渲染效率。

因此，对于 DOM 的操作我们时刻都需要非常小心谨慎。

当然，对于简单的页来说，其 DOM 结构还是比较简单的，所以以上这些操作 DOM 的问题并不会对用户体验产生太多影响。

但是对于一些复杂的页面或者目前使用非常多的单页应用来说，其 DOM 结构是非常复杂的，而且还需要不断地去修改 DOM 树，每次操作 DOM 渲染引擎都需要进行重排、重绘或者合成等操作，因为 DOM 结构复杂，所生成的页面结构也会很复杂，对于这些复杂的页面，执行一次重排或者重绘操作都是非常耗时的，这就给我们带来了真正的性能问题。

#####Virtual DOM 的工作原理

Virtual DOM 解决不了 DOM 自身的繁重

* 将页面改变的内容应用到虚拟 DOM 上，而不是直接应用到 DOM 上。
* 变化被应用到虚拟 DOM 上时，虚拟 DOM 并不急着去渲染页面，而仅仅是调整虚拟 DOM 的内部状态，这样操作虚拟 DOM 的代价就变得非常轻了。
* 在虚拟 DOM 收集到足够的改变时，再把这些变化一次性应用到真实的 DOM 上。

<img src="https://static001.geekbang.org/resource/image/cf/90/cf2089ad62af94881757c2f2de277890.png" alt="img" style="zoom:60%;" />

###### 创建阶段

首先依据 JSX 和基础数据创建出来虚拟 DOM，它反映了真实的 DOM 树的结构。然后由虚拟 DOM 树创建出真实 DOM 树，真实的 DOM 树生成完后，再触发渲染流水线往屏幕输出页面。

###### **更新阶段**

如果数据发生了改变，那么就需要根据新的数据创建一个新的虚拟 DOM 树；然后 React 比较两个树，找出变化的地方，并把变化的地方一次性更新到真实的 DOM 树上；最后渲染引擎更新渲染流水线，并生成新的页面。

##### React 的 VDOM 和 vue 的 VDOM 有什么区别

react和vue的虚拟dom都是一样的， 都是用JS对象来模拟真实DOM，然后用虚拟DOM的diff来最小化更新真实DOM。

除了极个别实现外，两者前半部分（用JS对象来模拟真实DOM）几乎是一样的。

而对于后半部分（用虚拟DOM的diff来最小化更新真实DOM）两者算法也是类似的，包括replace delete insert等

> 虽然两者对于dom的更新策略不太一样， react采用自顶向下的全量diff，vue是局部订阅的模式。 但是这其实和虚拟dom并无关系

##### Virtual DOM 如何实现

DOM 元素非常庞大，当页面发生重排，性能就会受很大影响

JS 对象表示 Virtual DOM，保留 Element 之间的层次关系和一些基本属性

```js
var element = {
	tagname: 'ul', //标签名
	props: {}, //属性
	children: [], //元素 children
}
```

#####双缓存

先将计算的时间结果存放在另一个缓存区中，等全部的计算结束，该缓冲区已经存储完整的图形

<img src="/Users/zhangshuai/Downloads/Double Buffer.png" alt="Double Buffer" style="zoom:100%;" />

虚拟 DOM 可以看作 DOM 的一个 Buffer，完成一次完整的操作

##### MVC模式

**核心思想就是将数据和视图分离**

React 的部分看成是一个 MVC 中的视图，基于 React 和 Redux 构建 MVC 模型

<img src="https://static001.geekbang.org/resource/image/e0/03/e024ba6c212a1d6bfa01b327e987e103.png" alt="img" style="zoom:60%;" />

### Key

Diff 时更快更准确找到变化的位置。

##### 遍历时为什么不用索引作为唯一的key值？

但这种情况下的副作用也很明显，在某些节点有绑定数据（表单）状态，会出现状态错位。

##### 需要把 key 设置为全局唯一吗？

不需要，因为只做同级比较

#### React-Key

**为了高效的更新虚拟DOM**

key来给每个节点做一个唯一标识，Diff算法就可以正确的识别此节点，找到正确的位置区插入新的节点。

![img](https://pic1.zhimg.com/80/v2-bb1147af7c458f0b09d6a3c2f74b0100_hd.jpg)

#### Vue-Key

在没有绑定 Key 的情况下，并且在遍历模板（简单）的情况下，会导致虚拟新旧节点对比更快，节点也会复用，而这种复用是就地复用。

```vue
<div>
  <div v-for="i in dataList">{{i}}</div>
</div>
```

```js
var vm = new Vue({
	el: '#app',
	data: [1, 2, 3, 4, 5]
})
```

```vue
[
  <div>1</div>, //id: A
  <div>2</div>, //id: B
  <div>3</div>, //id: C
  <div>4</div>, //id: D
  <div>5</div>, //id: E
]
```

改变 dataList: vm.dataList = [4, 1, 3, 5, 2]

没有Key

```vue
[
  <div>4</div>, //id: A
  <div>1</div>, //id: B
  <div>3</div>, //id: C
  <div>5</div>, //id: D
  <div>2</div>, //id: E
]
```

有 Key

```vue
[
  <div>4</div>, //id: D
  <div>1</div>, //id: A
  <div>3</div>, //id: C
  <div>5</div>, //id: E
  <div>2</div>, //id: B
]
```

简单模板下，不带有 Key，可以更有效的复用节点，Diff 速度来看也是不带 Key 更加快速，因为带 Key 在增删节点上有耗时。

Key 的作用

* 更准确：非就地复用，sameNode 函数 a.key === b.key
* 更快：key 的唯一性生成对象 map来获取对应节点，比遍历方式更快

### 异步更新数据

#### Vue

```this.data = '123'```

<img src="https://cn.vuejs.org/images/data.png" alt="data" style="zoom:60%;" />

所以属性必须在 `data` 对象上存在才能让 Vue 将它转换为响应式的。例如：

```js
var vm = new Vue({
  data:{
    a:1
  }
})

// `vm.a` 是响应式的

vm.b = 2
// `vm.b` 是非响应式的
```

对于已经创建的实例，Vue 不允许动态添加根级别的响应式属性。但是，可以使用 `Vue.set(object, propertyName, value)` 方法向嵌套对象添加响应式属性。例如，对于：

```js
Vue.set(vm.someObject, 'b', 2)
```

您还可以使用 `vm.$set` 实例方法，这也是全局 `Vue.set` 方法的别名：

```js
this.$set(this.someObject,'b',2)
```

有时你可能需要为已有对象赋值多个新属性，比如使用 `Object.assign()` 或 `_.extend()`。但是，这样添加到对象上的新属性不会触发更新。在这种情况下，你应该用原对象与要混合进去的对象的属性一起创建一个新的对象。

```js
// 代替 `Object.assign(this.someObject, { a: 1, b: 2 })`
this.someObject = Object.assign({}, this.someObject, { a: 1, b: 2 })
```

也有一些数组相关的注意事项，之前已经在[列表渲染](https://cn.vuejs.org/v2/guide/list.html#注意事项)中讲过。

Vue 在更新 DOM 时是**异步**执行的。只要侦听到数据变化，Vue 将开启一个队列，并缓冲在同一事件循环中发生的所有数据变更。如果同一个 watcher 被多次触发，只会被推入到队列中一次。

Vue 在内部对异步队列尝试使用原生的 `Promise.then`、`MutationObserver` 和 `setImmediate`，如果执行环境不支持，则会采用 `setTimeout(fn, 0)` 代替。

```js
<div id="example">{{message}}</div>

var vm = new Vue({
  el: '#example',
  data: {
    message: '123'
  }
})
vm.message = 'new message' // 更改数据
vm.$el.textContent === 'new message' // false
Vue.nextTick(function () {
  vm.$el.textContent === 'new message' // true
})
```

在组件内使用 `vm.$nextTick()` 实例方法特别方便，因为它不需要全局 `Vue`，并且回调函数中的 `this` 将自动绑定到当前的 Vue 实例上：

```js
Vue.component('example', {
  template: '<span>{{ message }}</span>',
  data: function () {
    return {
      message: '未更新'
    }
  },
  methods: {
    updateMessage: function () {
      this.message = '已更新'
      console.log(this.$el.textContent) // => '未更新'
      this.$nextTick(function () {
        console.log(this.$el.textContent) // => '已更新'
      })
    }
  }
})
```

因为 `$nextTick()` 返回一个 `Promise` 对象，所以你可以使用新的 [ES2016 async/await](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/async_function) 语法完成相同的事情：

```js
methods: {
  updateMessage: async function () {
    this.message = '已更新'
    console.log(this.$el.textContent) // => '未更新'
    await this.$nextTick()
    console.log(this.$el.textContent) // => '已更新'
  }
}
```



#### React

##### setState / replaceState

取名为partialState，有部分state的含义，可见只是影响涉及到的state，不会伤及无辜。enqueueSetState是state队列管理的入口方法，比较重要，我们之后再接着分析。

```js
ReactComponent.prototype.setState = function (partialState, callback) {
  // 将setState事务放入队列中
  this.updater.enqueueSetState(this, partialState);
  if (callback) {
    this.updater.enqueueCallback(this, callback, 'setState');
  }
};
```

replaceState中取名为newState，有完全替换的含义。同样也是以队列的形式来管理的。

```js
ReactComponent.prototype.replaceState = function (newState, callback) {
  this.updater.enqueueReplaceState(this, newState);
  if (callback) {
    this.updater.enqueueCallback(this, callback, 'replaceState');
  }
},
```

<img src="https://pic1.zhimg.com/80/4fd1a155faedff00910dfabe5de143fc_hd.png" alt="img" style="zoom:80%;" />



### Mixins / HOC

#### Mixins

1、`mixins` 带来了隐式依赖

2、`mixins` 与 `mixins` 之间，`mixins` 与组件之间容易导致命名冲突

3、由于 `mixins` 是侵入式的，它改变了原组件，所以修改 `mixins` 等于修改原组件，随着需求的增长 `mixins` 将变得复杂，导致滚雪球的复杂性。

##### Vue

```js
export default consoleMixin {
  mounted () {
    console.log('I have already mounted')
  }
}

export default {
  name: 'BaseComponent',
  props: {
    test: Number
  },
  mixins: [ consoleMixin ]
  methods: {
    handleClick () {
      this.$emit('customize-click')
    }
  }
}
```

##### React

```jsx
const PureRenderMixin = require('react-addons-pure-render-mixin')
const MyComponent = React.createClass({
  mixins: [PureRenderMixin]
})
```

```jsx
const shallowCompare = require('react-addons-shallow-compare')
const Button = React.createClass({
  shouldComponentUpdate: function(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }
})
```

#### HOC

1、高阶组件(`HOC`)应该是无副作用的纯函数，且不应该修改原组件

2、高阶组件(`HOC`)不关心你传递的数据(`props`)是什么，并且被包装组件(`WrappedComponent`)不关心数据来源

3、高阶组件(`HOC`)接收到的 `props` 应该透传给被包装组件(`WrappedComponent`)

##### Vue

https://juejin.im/entry/5a524420f265da3e2e6252c5

```jsx
function WithConsole (WrappedComponent) {
  return {
    mounted () {
      console.log('I have already mounted')
    },
    props: WrappedComponent.props,
    render (h) {
      // slot
      const slots = Object.keys(this.$slots)
        .reduce((arr, key) => arr.concat(this.$slots[key]), [])
        .map(vnode => {
          vnode.context = this._self
          return vnode
        })

      return h(WrappedComponent, {
        on: this.$listeners,
        props: this.$props,
        // 透传 scopedSlots
        scopedSlots: this.$scopedSlots,
        attrs: this.$attrs
      }, slots)
    }
  }
}
```

##### React

### Vue

#### v-show | v-if

频繁切换的使用 v-show，不频繁切换的使用 v-if，这里要说的优化点在于减少页面中 dom 总数

#### v-once

v-once的使用场景有哪些？

只渲染元素和组件**一次**。随后的重新渲染，元素/组件及其所有的子节点将被视为静态内容并跳过。这可以用于优化更新性能。

```jsx
<!-- 单个元素 -->
<span v-once>This will never change: {{msg}}</span>
<!-- 有子元素 -->
<div v-once>
  <h1>comment</h1>
  <p>{{msg}}</p>
</div>
<!-- 组件 -->
<my-component v-once :comment="msg"></my-component>
<!-- `v-for` 指令-->
<ul>
  <li v-for="i in list" v-once>{{i}}</li>
</ul>
```

### React

#### ShouldComponentUpdate / React.PureComponent

![img](http://s1.51cto.com/wyfs02/M00/8B/AE/wKiom1hUxnOTqDW3AACGhMaRt7Y23.jpeg-wh_600x-s_1636182076.jpeg)

如果你的组件只有当 `props.color` 或者 `state.count` 的值改变才需要更新时，你可以使用 `shouldComponentUpdate` 来进行检查：

```jsx
class CounterButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {count: 1};
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.color !== nextProps.color) {
      return true;
    }
    if (this.state.count !== nextState.count) {
      return true;
    }
    return false;
  }

  render() {
    return (
      <button
        color={this.props.color}
        onClick={() => this.setState(state => ({count: state.count + 1}))}>
        Count: {this.state.count}
      </button>
    );
  }
}
```

在这段代码中，`shouldComponentUpdate` 仅检查了 `props.color` 或 `state.count` 是否改变。如果这些值没有改变，那么这个组件不会更新。

所以这段代码可以改成以下这种更简洁的形式：

```jsx
class CounterButton extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {count: 1};
  }

  render() {
    return (
      <button
        color={this.props.color}
        onClick={() => this.setState(state => ({count: state.count + 1}))}>
        Count: {this.state.count}
      </button>
    );
  }
}
```

##### React.memo

`React.memo` 为[高阶组件](https://zh-hans.reactjs.org/docs/higher-order-components.html)。它与 [`React.PureComponent`](https://zh-hans.reactjs.org/docs/react-api.html#reactpurecomponent) 非常相似，但它适用于函数组件，但不适用于 class 组件。

如果你的函数组件在给定相同 props 的情况下渲染相同的结果，那么你可以通过将其包装在 `React.memo` 中调用，以此通过记忆组件渲染结果的方式来提高组件的性能表现。这意味着在这种情况下，React 将跳过渲染组件的操作并直接复用最近一次渲染的结果。

默认情况下其只会对复杂对象做浅层对比，如果你想要控制对比过程，那么请将自定义的比较函数通过第二个参数传入来实现。

```jsx
function MyComponent(props) {
  /* 使用 props 渲染 */
}
function areEqual(prevProps, nextProps) {
  /*
  如果把 nextProps 传入 render 方法的返回结果与
  将 prevProps 传入 render 方法的返回结果一致则返回 true，
  否则返回 false
  */
}
export default React.memo(MyComponent, areEqual);
```

##### Component / PureComponent / Function Component

```jsx
// function Component
function FuncComp() {
  return <div>FuncComp</div>
}
```

```jsx
// Component
class Comp extends Component {
  render() {
    return (
      <div>
        component
      </div>
    );
  }
}
```

```jsx
// Pure Component 只会对 props 和 state 进行浅比较
class PureComp extends PureComponent {
  render() {
    return (
      <div>
        Pure Component
      </div>
    );
  }
}
```



#### Immutable

<img src="https://pic2.zhimg.com/56ca0a46e3639da548c3cac48072497b_1200x500.jpg" alt="Immutable 详解及 React 中实践" style="zoom:80%;" />

Immutable Data 就是一旦创建，就不能再被更改的数据。对 Immutable 对象的任何修改或添加删除操作都会返回一个新的 Immutable 对象。

##### 原理

Immutable 实现的原理是 **Persistent Data Structure（持久化数据结构）**，也就是使用旧数据创建新数据时，要保证旧数据同时可用且不变。

同时为了避免 deepCopy 把所有节点都复制一遍带来的性能损耗，Immutable 使用了[Structural Sharing（结构共享）](https://link.jianshu.com?t=https%3A%2F%2Fzhuanlan.zhihu.com%2Fp%2F27133830%3Fgroup_id%3D851585269567213568)，即如果对象树中一个节点发生变化，只修改这个节点和受它影响的父节点，其它节点则进行共享。

##### 语法

```js
// 原来的写法
let foo = {a: {b: 1}};
let bar = foo;
bar.a.b = 2;
console.log(foo.a.b);  // 打印 2
console.log(foo === bar);  //  打印 true

// 使用 immutable.js 后
import Immutable from 'immutable';
foo = Immutable.fromJS({a: {b: 1}});
bar = foo.setIn(['a', 'b'], 2);   // 使用 setIn 赋值
console.log(foo.getIn(['a', 'b']));  // 使用 getIn 取值，打印 1
console.log(foo === bar);  //  打印 false

// 使用  seamless-immutable.js 后
import SImmutable from 'seamless-immutable';
foo = SImmutable({a: {b: 1}})
bar = foo.merge({a: { b: 2}})   // 使用 merge 赋值
console.log(foo.a.b);  // 像原生 Object 一样取值，打印 1

console.log(foo === bar);  //  打印 false
```

##### 优点

* Immutable 降低了 Mutable 带来的复杂度
* 节省内存
* Undo/Redo，Copy/Paste，甚至时间旅行这些功能做起来小菜一碟
* 并发安全 —— 但使用了 Immutable 之后，数据天生是不可变的，**并发锁就不需要了**。
* 拥抱函数式编程

##### 为什么React要使用

 `shouldComponentUpdate()` 是基于 shallow compare，deepCopy 和 deepCompare 非常耗性能。

**Immutable 则提供了简洁高效的判断数据是否变化的方法**，只需 `===` 和 `is` 比较就能知道是否需要执行 `render()`，而这个**操作几乎 0 成本**，所以可以极大提高性能。修改后的 `shouldComponentUpdate` 是这样的：

```js
import { is } from 'immutable';

shouldComponentUpdate: (nextProps = {}, nextState = {}) => {
  const thisProps = this.props || {}, thisState = this.state || {};

  if (Object.keys(thisProps).length !== Object.keys(nextProps).length ||
      Object.keys(thisState).length !== Object.keys(nextState).length) {
    return true;
  }

  for (const key in nextProps) {
    if (thisProps[key] !== nextProps[key] || ！is(thisProps[key], nextProps[key])) {
      return true;
    }
  }

  for (const key in nextState) {
    if (thisState[key] !== nextState[key] || ！is(thisState[key], nextState[key])) {
      return true;
    }
  }
  return false;
}
```



#### Dynamic Import / Loadable / Suspense + lazy

##### 它帮我们解决了什么问题？

* 代码拆分
* 条件渲染
* React.lazy

##### Dynamic Import

**使用之前：**

```jsx
import { add } from './math';

console.log(add(16, 26));
```

**使用之后：**

```jsx
import("./math").then(math => {
  console.log(math.add(16, 26));
});
```

##### React.loadable —— 你有使用过loadable组件吗？

https://zhuanlan.zhihu.com/p/25874892

```jsx
const Loading = ({ pastDelay }) => {
  if (pastDelay) {
    return <Spinner />;
  }
  return null;
};
 
export const johanAsyncComponent = Loadable({
  loader: () => import(/* webpackChunkName: "johanComponent" */ './johan.component'),
  loading: Loading,
  delay: 200
});
```

#####React.lazy + React.Suspense —— 你有使用过suspense组件吗？

`React.lazy` 接受一个函数，这个函数需要动态调用 `import()`。它必须返回一个 `Promise`，该 Promise 需要 resolve 一个 `defalut` export 的 React 组件。

https://cloud.tencent.com/developer/article/1381296

```jsx
const johanComponent = React.lazy(() => import(/* webpackChunkName: "johanComponent" */ './myAwesome.component'));
 
export const johanAsyncComponent = props => (
  <React.Suspense fallback={<Spinner />}>
    <johanComponent {...props} />
  </React.Suspense>
);
```

基于路由的拆分

```jsx
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';

const Home = lazy(() => import('./routes/Home'));
const About = lazy(() => import('./routes/About'));

const App = () => (
  <Router>
    <Suspense fallback={<div>Loading...</div>}>
      <Switch>
        <Route exact path="/" component={Home}/>
        <Route path="/about" component={About}/>
      </Switch>
    </Suspense>
  </Router>
);
```



#### Fiber

当有数据时，React 会生成一个新的虚拟 DOM，然后拿新的 VDOM 和之前的 VDOM 进行比较，这一过程会找出变化的节点，再应用到 DOM 上。

##### 比较过程

两个虚拟 DOM 的比较在一个递归函数里执行的，其核心算法为 **`reconciliation`**

通常情况下，这个比较过程执行的较快，但 VDOM 复杂，执行比较函数就会占据主线程比较久的时间，这样会导致其他任务的等待，导致页面卡顿。

![Fiber Reconcilation](/Users/zhangshuai/Downloads/Fiber Reconcilation.png)

执行算法的时候出让主线程，解决 stack reconciler 函数占用时间过久的问题

##### 为什么要引入 Fiber

浏览器为单线程，它将 GUI 描绘，时间器处理，事件处理，JS执行，远程资源加载通通都放在一起。

如果有足够的时间，浏览器会对我们的代码进行编译优化（JIT）以及进行热代码优化，一些 DOM 操作，内部也会对 Reflow 进行处理。

![Browser](/Users/zhangshuai/Downloads/Browser.png)

tasks 有些可控，有些不可控（setTimeout 和 远程资源加载）

理想状态：分派执行，tasks 时间不宜过长，这样浏览器就有时间优化 JS 代码与修正 Reflow

之前的版本，若一个很复杂的复合组件，改动最上层组件的 state，那么调用栈会很长

<img src="https://pic1.zhimg.com/80/v2-d8f4598c70df94d69825f11dfbf2ca2c_hd.png" alt="img" style="zoom:80%;" />

调用栈过长 + 复杂的操作，就很有可能会导致长时间 ** 阻塞主线程** ，带来不好的用户体验。

Fiber 的本质是一个虚拟的堆栈帧，新的调度器会按照优先级自由调度这些帧，从而将之前的同步渲染改成异步渲染，在不影响体验的情况下分段计算更新（不阻塞现在的线程）

<img src="https://pic1.zhimg.com/80/v2-78011f3365ab4e0b6184e1e9201136d0_hd.png" alt="img" style="zoom:80%;" />

如何区分优先级，React 有自己的一套逻辑。对于动画这种实时性很高的东西，也就是 16ms必须渲染一次，保证不卡顿，React 会每 16ms以内暂停一下更新，返回来继续渲染动画。

##### 如何让代码断开重连

* JSX: 组件化，标签化（天然的嵌套结构，会最终编译成递归执行的代码）
* Older: 之前的栈调度，不能随意 break，continue
* Newer: 16版本将组件的递归更新，改为链表的依次执行

##### Time slicing（异步渲染，拉长了 render 的时间）

对于异步渲染，现在版本渲染有 2个阶段：

* reconciliation - diff（可能会被打断，影响的生命周期）
  * componentWillMount
  * componentWillRecieveProps
  * componentWillUpdate
  * shouldComponentUpdate
* commit - patch （无法暂停，会一直更新界面直到完成）
  * componentDidMount
  * componentDidUpdate
  * componentWillUnmount

因为 recomciliation 阶段是可以被打断的，所以 reconciliation 阶段会执行的生命周期就可能会出现调用多次的情况，从而引起 Bug，所以对于 reconcilation 阶段调用的几个函数，除了 shouldComponentUpdate 之外，其他都应该避免去使用

getDrivedStateFromProps ——> componentWillRecieveProps，该函数会在被初始化和 update 时被调用

getSnapshotBeforeUpdate 用于替换 componentWillUpdate，该函数会在 update 后 DOM 更新前被调用，用于读取最新的 DOM 数据

##### 为什么更新生命周期

* unsafe_Will* 等生命周期被多次调用，某些用户甚至操作 DOM，调用时，页面会马上重绘，性能堪忧
* getDrivedStateFromProps 静态函数，不属于任何一个实例，强迫其变成一个纯函数，逻辑相对简单
* getSnapshotBeforeUpdate，到达 commit 阶段，因此只会运行一次



### Tools

### Browser

