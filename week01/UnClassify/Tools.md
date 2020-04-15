# Tools

## Grunt

Grunt 是一套前端自动化工具，帮助处理反复重复的任务。一般用于：编译，压缩，合并文件，简单语法检查等

## Gulp

Gulp 是基于“流”的自动化构建工具，采用代码优于配置的策略，可以管理和执行任务，还支持监听文件，读写文件，Gulp 让简单的任务简单，复杂的任务可管理。

## Babel

ES标准语法，五个阶段

* Stage0 —— strawman
* Stage1 —— proposal
* Stage2 —— draft
* Stage3 —— cancidate
* Stage4 —— finished

### babel-core

* babel-transform: 字符串转码得到 AST
* babel-transformFile: 异步的文件转码方式
* babel-transformFileSync: 同步的文件转码方式
* babel-transformFromAST: 将 AST 进行转译

### babel-cli

```json
{
	plugins: [
		"transform-es2015-arrow-functions"
	]
}
```

### babel-node

支持 es6 的执行环境

### babel-register

底层改写了 node 的 require 方法，引入之后，所有的 require 并以 es6，es，.jsx，.js 为后缀的模块都会经过 babel 的转译，默认忽略对 node_modules 目录下模块的转译。

### babel-polyfill

主要用于对已存在的语法和 api 实现一些浏览器还没有实现的 api，对浏览器的一些缺陷做一些修补。

#### 为什么要有 polyfill

babel 的转译只是语法上的转译，例如箭头函数，解构赋值，class，对一些新增的 api以及全局函数（Promise）无法进行转译，引入 polyfill让代码完美支持 es6+ 环境

### plugin

```json
{
	plugin: [
    // 自动为项目引入 polyfill 和 helpers依赖于 babel
		["transform-runtime", {
      "helpers": false,
      "polyfill": false,
      "regenerator": true,
      "moduleName": "babel-runtime"
    }]
	]
}
```

#### tranform-runtime 和 babel-polyfill 的差别

* runtime 为按需引入，无需手动配置，引入的 polyfill 不是全局的，有局限性
* babel-polyfill 能解决 runtime 的问题，垫片为全局的，它提供了一个完整的 ES6+ 的环境，
* 开发类库，使用不会污染全局的 babel-runtime；大型 web 应用全局引入 babel-polyfill

### presets

```
{
	presets: [
		"es2015",
		"stage-0",
		"react"
	]
}
```



## Webpack

Webpack 是模块化管理工具和打包工具。通过 loader 的转换，任何形式的资源都可以视作模块，比如 CommonJs 模块、AMD 模块、ES6 模块、CSS、图片等。它可以将许多松散的模块按照依赖和规则打包成符合生产环境部署的前端资源。还可以将按需加载的模块进行代码分隔，等到实际需要的时候再异步加载

### 核心概念

* **Entry** —— 入口
* **Module** —— 模块
* **Chunk** —— 代码块，多个模块组合而成，用于代码合并和分割
* **Loader** —— 模块转换器，把模块原内容按照需求转成新内容
* **Plugin** —— 扩展插件，特定时机注入扩展来改变构建结果
* **Output** —— 出口

### 三大阶段

* 初始化

  启动构建，读取与合并参数，加载 plugin，实例化 Compiler

* 编译

  从 Enrty 出发，针对每个 Module 串行调用对应的 Loader 去翻译文件的内容，再找到该 Module 依赖的 Module，递归地进行编译处理

* 输出

  将编译后的 Module 组合成 Chunk，将 Chunk 转换成 文件，输出到文件系统中

### 开发

#### 多入口配置

```md
.
├── build    # 没有改动
├── config   # 没有改动
├── entries  # 存放不同入口的文件
│   ├── entry1
│   │   ├── router       # entry1 的 router
│   │   │   └── index.js
│   │   ├── store        # entry1 的 store
│   │   │   └── index.js
│   │   ├── App.vue      # entry1 的根组件
│   │   ├── index.html   # entry1 的页面模版
│   │   └── main.js      # entry1 的入口
│   └── entry2
│       ├── router
│       │   └── index.js
│       ├── store
│       │   └── index.js
│       ├── App.vue
│       ├── index.html
│       └── main.js
├── src
│   ├── assets
│   │   └── logo.png
│   ├── common          # 多入口通用组件
│   │   └── CommonTemplate.vue
│   └── components
│       ├── HelloWorld.vue
│       ├── test1.vue
│       └── test2.vue
├── static
├── README.md
├── index.html
├── package-lock.json
└── package.json
```

然后我们在 `build/utils` 文件中加两个函数，分别用来生成 webpack 的 `entry` 配置和 `HtmlWebpackPlugin` 插件配置，由于要使用 `node.js` 来读取文件夹结构，因此需要引入 `fs`、`glob` 等模块：

```js
// build/webpack.prod.conf.js
module.exports = {
  entry: {
    entry: './src/main.js',   // 打包输出的chunk名为entry
    entry2: './src/main2.js'  // 打包输出的chunk名为entry2
  },
  output: {
    filename: '[name].js',
    publicPath: '/'
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'entry.html',  // 要打包输出的文件名
      template: 'index.html',  // 打包输出后该html文件的名称
      chunks: ['manifest', 'vendor', 'entry']  // 输出的html文件引入的入口chunk
      // 还有一些其他配置比如minify、chunksSortMode和本文无关就省略，详见github
    }),
    new HtmlWebpackPlugin({
      filename: 'entry2.html',
      template: 'index.html',
      chunks: ['manifest', 'vendor', 'entry2']
    })
  ]
}
```

上面一个配置要注意的是 `chunks`，如果没有配置，那么生成的 HTML 会引入所有入口 JS 文件，在上面的例子就是，生成的两个 HTML 文件都会引入 `entry.js` 和 `entry2.js`，所以要使用 `chunks` 配置来指定生成的 HTML 文件应该引入哪个 JS 文件。配置了 `chunks` 之后，才能达到不同的 HTML 只引入对应 `chunks` 的 JS 文件的目的。

大家可以看到除了我们打包生成的 `chunk` 文件 `entry.js` 和 `entry2.js` 之外，还有 `manifest` 和 `vendor` 这两个，这里稍微解释一下这两个 `chunk`



#### 编写 Loader

只关心输入和输出

```js
module.exports = function (resource) {
  // source 为 compiler 传递给 Loader 的一个文件的原内容，再返回处理后的内容
	return source
}
```

##### 获得 loader 的 options

```js
// 获得 loader 的 options
const loaderUtils = require('loader-utils')
module.exports = function (resource) {
  // 获取用户为当前 loader 传入的 options
  const options = loaderUtils.getOptions(this)
	return source
}
```

#####返回其他结果

```js
module.exports = function (resource) {
  // 告诉 webpack 的返回结果
  this.callback(null, source, sourceMaps)
	return
}
```

##### 异步与同步

```js
module.exports = function (resource) {
  // 告诉 webpack 的返回结果
  var callback = this.async()
  // 返回异步执行的结果
  callback(null, source, sourceMaps)
	return
}
```

##### 处理二进制数据

```js
module.exports = function (resource) {
  // 判断传入是否为 Buffer 类型
  source instanceof Buffer === true
	return resource
}
module.exports.raw = true
```

##### 缓存加速

```js
module.exports = function (resource) {
  // 关闭该 loader 的缓存功能
  this.cacheable(true)
	return resource
}
```



#### 编写 Plugin

```js
class BasicPlugin {
  // 获取用户为该插件传入的配置
  constructor (options) {}
  
  apply (compiler) {
    compiler.plugin('compilation', function (compilation) {})
  }
}
module.exports = BasicPlugin

const BasicPlugin = require('./BasicPlugin.js')
module.exports = {
  plugins: [
    new BasicPlugin(options)
  ]
}
```



### 原理

#### 工作原理

运行流程是一个串行的过程，从启动到结束会依次执行以下流程

* 初始化参数

  从配置文件和 shell 语句中读取与合并参数，得出最终的参数

* 开始编译

  用上一步得到的参数，初始化 complier 对象，加载所有配置的插件

* 确定入口

  entry 入口文件

* 编译模块

  入口文件出发，调用所有配置的 loader 对模块进行翻译，再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过本步骤的处理

* 完成模块编译

   loader 翻译完所有模块后，得到了每个模块被翻译后的最终内容及它们之间的依赖关系

* 输出资源

  入口和模块之间的依赖关系，组装成包含一个或者多个模块的 chunk，再将每个 chunk转换成一个单独的文件加入输出列表中，这是修改文件的最终机会

* 输出完成

  确定好输出内容后，根据配置确定输出的路径和文件名，将文件的内容写入到文件系统中

#### 自动刷新

##### 文件监听

定时获取这个文件的最后编辑时间，若发生改变，重新构建出新的输出文件。

watchOptions.poll 用于控制定时检查的周期。

##### 优化监听性能

```js
module.export = {
	watchOptions: {
		// 不监听该目录下的文件
		ignored: /node_modules/
	}
}
```

##### 自动刷新

* 借助浏览器扩展去通过浏览器提供的接口刷新，Webstorm IDE 的 LiveEdit 功能就是这样实现的
* 向要开发的网页中注入代理客户端代码，通过代理客户端去刷新整个页面
* 将要开发的网页装进一个 iframe 中，通过刷新 iframe 去看到最新效果

**DevServer** 支持 2，3种方法，默认 2。

#### 模块热替换（HMR）

一个源码发生变化时，只需重新编译发生变化的模块，再用新输出的模块热替换掉浏览器中对应的老模块。
都需要向开发的网页中注入一个代理客户端来连接 DevServer 和 网页。



### 优化

* DLL

* HappyPack

* ParallelUglifyPlugin

* HMR

* UglifyPlugin

* publicPath

* TreeShaking

* CommonChunk

* Dynamic Import

* Scope Hoisting

  

##Rollup

下一代JavaScript模块打包工具。开发者可以在你的应用或库中使用ES2015模块，然后高效地将它们打包成一个单一文件用于浏览器和Node.js使用。 Rollup最令人激动的地方，就是能让打包文件体积很小。这么说很难理解，更详细的解释：相比其他JavaScript打包工具，Rollup总能打出更小，更快的包。因为Rollup基于ES2015模块，比Webpack和Browserify使用的CommonJS模块机制更高效。这也让Rollup从模块中删除无用的代码，即tree-shaking变得更容易。