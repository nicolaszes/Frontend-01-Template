#  Optimization Network Stage

###DNS（减少DNS查找）

#### DNS-prefetch

DNS 预解析

### CDN



### 避免重定向

重定向会拖慢用户体验，在用户和HTML文档之间插入重定向会延迟页面上的所有东西，页面无法渲染，组件也无法开始下载，直到HTML文档被送达浏览器。



### 域名收敛 / 扩散

##### Web —— 域名扩散

一个域名最多有 6个 TCP链接，多个域名并发，突破下载限制

##### Mobile —— 域名收敛

一个域名最多有 6个 TCP链接



### HTTP

* 详见网络模块

### TCP/IP

* 慢启动

### Cache

#### Expires

过期时间，超过，响应过期



#### Cache-Control

##### 可缓存性

* public

  表明响应可以被任何对象（包括：发送请求的客户端，代理服务器，等等）缓存，即使是通常不可缓存的内容。（例如：1.该响应没有`max-age`指令或`Expires`消息头；2. 该响应对应的请求方法是 [POST](https://wiki.developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST) 。）

* private

  表明响应只能被单个用户缓存，不能作为共享缓存（即代理服务器不能缓存它）。私有缓存可以缓存响应内容，比如：对应用户的本地浏览器。

* no-cache

  在发布缓存副本之前，强制要求缓存把请求提交给原始服务器进行验证(协商缓存验证)。

* no-store

  缓存不应存储有关客户端请求或服务器响应的任何内容，即不使用任何缓存。

##### 到期性

* max-age=<seconds>

  设置缓存存储的最大周期，超过这个时间缓存被认为过期(单位秒)。与`Expires`相反，时间是相对于请求的时间。

* s-maxage=<seconds>

  覆盖`max-age`或者`Expires`头，但是仅适用于共享缓存(比如各个代理)，私有缓存会忽略它。

* max-stale=[<seconds>]

  表明客户端愿意接收一个已经过期的资源。可以设置一个可选的秒数，表示响应不能已经过时超过该给定的时间。

* min-fresh=<seconds>

  表示客户端希望获取一个能在指定的秒数内保持其最新状态的响应。

* stale-while-revalidate=<seconds>

  表明客户端愿意接受陈旧的响应，同时在后台异步检查新的响应。秒值指示客户愿意接受陈旧响应的时间长度。

* stale-if-error=<seconds>

  表示如果新的检查失败，则客户愿意接受陈旧的响应。秒数值表示客户在初始到期后愿意接受陈旧响应的时间。

##### 重新验证和重新加载

* must-revalidate

  一旦资源过期（比如已经超过`max-age`），在成功向原始服务器验证之前，缓存不能用该资源响应后续请求。

* proxy-revalidate

  与must-revalidate作用相同，但它仅适用于共享缓存（例如代理），并被私有缓存忽略。

* immutable

  表示响应正文不会随时间而改变。

##### 其他

* no-transform

  不得对资源进行转换或转变。

* only-if-cached

  表明客户端只接受已缓存的响应，并且不要向原始服务器检查是否有更新的拷贝。



#### Etag/If-None-Match

#### Last-Modify/If-Modify-Since



### Cookie/Session/Token/JWT

#### Cookie

#### Session

#### Token

#### JWT