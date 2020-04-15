# Secure

### Web

#### 跨域

所谓的跨域问题只是浏览器强加给js的规则而已，世界本无跨域限制。

是浏览器强制不允许js访问别的域，但是浏览器却没有限制它自己。

比如说img标签可以加载任何域的图片，script可以加载任何域的js。

再比如说你不能从前端js去调淘宝的接口获取ip对应的城市地址信息，，但是你可以手敲在浏览器地址栏，直接打开。



#### 同源策略



#### CSP

#### XSS (Cross Site Scripting)

XSS 跨站脚本攻击：往 HTML 文件中或者 DOM 中注入恶意脚本

##### 特性

* 可以窃取 Cookie
* 监听用户行为
* 通过修改 DOM 伪造假的登录窗口，用来欺骗用户输入用户名，密码
* 页面生成浮窗广告

##### 攻击方式

* 大小写绕过

  ```js
  http://192.168.1.102/xss/example2.php?name=<sCript>alert("hey!")</scRipt>
  ```

* 利用过滤后返回语句再次构成攻击语句来绕过

  ```js
  http://192.168.1.102/xss/example3.php?name=<sCri<script>pt>alert("hey!")</scRi</script>pt>
  ```

* 并不是只有script标签才可以插入代码

  ```js
  http://192.168.1.102/xss/example4.php?name=<img src='w.123' onerror='alert("hey!")'>
  ```

  ```html
  <a onmousemove='do something here'> 
  <div onmouseover='do something here'> 
  ```

* 编码脚本代码绕过关键字过滤

  例如alert(1)编码过后就是

  ```js
  \u0061\u006c\u0065\u0072\u0074(1)
  ```

  ```js
  http://192.168.1.102/xss/example5.php?name<script>eval(\u0061\u006c\u0065\u0072\u0074(1))</script>
  ```

* 主动闭合标签实现注入代码

  ```js
  http://192.168.1.102/xss/example6.php?name=";alert("I am coming again~");"
  ```

#####阻止策略

* 过滤和转码：服务器对输入脚本进行过滤和转码

  ```js
  <script>alert('xss')</script> // > -> &gt
  ```

* 限制：

  * 充分利用 CSP
    * 限制加载其它域名下的资源
    * 禁止向第三方域提交数据，用户数据不会外泄
    * 禁止执行内联脚本和未授权的脚本
    * 提供了上报机制
  * 使用 HttpOnly 属性



##### 非持久性 XSS

<img src="https://upload-images.jianshu.io/upload_images/9210272-39bc717da38e9ac6.jpg" alt="img" style="zoom:75%;" />

```html
<select>
    <script>
        document.write(''
            + '<option value=1>'
            +     location.href.substring(location.href.indexOf('default=') + 8)
            + '</option>'
        );
        document.write('<option value=2>English</option>');
    </script>
</select>
```

攻击者可以直接通过 URL (类似：[https://xx.com/xx?default=](https://link.jianshu.com/?t=https%3A%2F%2Fxx.com%2Fxx%3Fdefault%3D)<script>alert(document.cookie)</script>) 注入可执行的脚本代码

###### 特性：

1. 即时性，不经过服务器存储，直接通过 HTTP 的 GET 和 POST 请求就能完成一次攻击，拿到用户隐私数据
2. 攻击者需要诱骗点击
3. 反馈率低，所以较难发现和响应修复
4. 盗取用户敏感保密信息

###### 防范：

1. Web 页面渲染的所有内容或者渲染的数据都必须来自于服务端。
2. 尽量不要从 URL，document.referrer，document.forms 等这种 DOM API 中获取数据直接渲染。
3. 尽量不要使用 eval, new Function()，document.write()，document.writeln()，window.setInterval()，window.setTimeout()，innerHTML，document.creteElement() 等可执行字符串的方法。
4. 如果做不到以上几点，也必须对涉及 DOM 渲染的方法传入的字符串参数做 escape 转义。
5. 前端渲染的时候对任何的字段都需要做 escape 转义编码。

escape 转义的目的是将一些构成 HTML 标签的元素转义，比如 <，>，空格 等，转义成 <，>， 等显示转义字符。有很多开源的工具可以协助我们做 escape 转义。



##### 持久型 XSS

###### 前提条件

1. POST 请求提交表单后端没做转义直接入库。
2. 后端从数据库中取出数据没做转义直接输出给前端。
3. 前端拿到后端数据没做转义直接渲染成 DOM。

###### 特点

1. 持久型，植入在数据库中
2. 危害面广，甚至可以让用户机器变成 DDos 攻击的肉鸡
3. 盗取用户敏感私密信息

###### 防范

1. 后端在入库之前应该选择不相信任何前端数据，将所有字段统一进行转义处理
2. 后端在输出给前端统一进行转义处理
3. 前端在渲染页面 DOM 的时候应该选择不相信任何后端数据，任何字段都需要做转义处理。



##### 基于字符集的 XSS

很多的浏览器以及各种开源的库都专门针对了 XSS 进行转义处理，尽量默认抵御绝大多数 XSS 攻击，但还是有很多方式可以绕过转义规则

###### utf-7 的 XSS

utf-7 是可以将所有的 unicode 通过 7bit 来表示的一种字符集 (但现在已经从 Unicode 规格中移除)。
    这个字符集为了通过 7bit 来表示所有的文字, 除去数字和一部分的符号,其它的部分将都以 base64 编码为基础的方式呈现。

```js
<script>alert("xss")</script>
可以被解释为：
+ADw-script+AD4-alert(+ACI-xss+ACI-)+ADw-/script+AD4-
```

​    可以形成「基于字符集的 XSS 攻击」的原因是由于浏览器在 meta 没有指定 charset 的时候有自动识别编码的机制，所以这类攻击通常就是发生在没有指定或者没来得及指定 meta 标签的 charset 的情况下。



##### 基于 Flash 的 XSS

基于 Flash 的跨站 XSS 也是属于反射型 XSS 的一种，虽然现在开发 ActionScript 的产品线几乎没有了，但还是提一句吧，AS 脚本可以接受用户输入并操作 cookie，攻击者可以配合其他 XSS（持久型或者非持久型）方法将恶意 swf 文件嵌入页面中。主要是因为 AS 有时候需要和 JS 传参交互，攻击者会通过恶意的 XSS 注入篡改参数，窃取并操作cookie。

###### 防范

1. 严格管理 cookie 的读写权限
2. 对 Flash 能接受用户输入的参数进行过滤 escape 转义处理



##### 未经验证的跳转 XSS

有一些场景是后端需要对一个传进来的待跳转的 URL 参数进行一个 302 跳转，可能其中会带有一些用户的敏感（cookie）信息。如果服务器端做302 跳转，跳转的地址来自用户的输入，攻击者可以输入一个恶意的跳转地址来执行脚本。

###### 防范

1. 对待跳转的 URL 参数做白名单或者某种规则过滤
2. 后端注意对敏感信息的保护，比如 cookie 使用来源验证



#### CSRF

<img src="https://upload-images.jianshu.io/upload_images/9210272-ea31e91c3630b53e.jpg" alt="img" style="zoom:67%;" />

利用用户的登录状态，并通过第三方的站点来做一些事

##### 三个必要条件

* 目标站点一定要有 CSRF 漏洞
* 用户登录过目标站点，并且浏览器保持有改站点的登录态
* 用户打开一个第三方站点，可以是黑客的站点，也可以为论坛

#####防范

* 正确使用 GET，POST 请求和 cookie
  * 充分利用好 Cookie 的 sameSite 属性（第三方禁止发送 Cookie）

    * strict：完全禁止

    * lax：三方站点打开，提交 get 方式表单

    * none：任何情况

      ```js
      set-cookie: sameSite='strict'
      ```

  * 验证请求的来源站点

    HTTP 的 referer (包含路径信息)，origin

* 每个 POST 请求使用验证码

  这个方案算是比较完美的，但是需要用户多次输入验证码，用户体验比较差，所以不适合在业务中大量运用。

* CSRF Token



### Server

#### SQL 注入

```html
<form action="/login" method="POST">
    <p>Username: <input type="text" name="username" /></p>
    <p>Password: <input type="password" name="password" /></p>
    <p><input type="submit" value="登陆" /></p>
</form>
```

后端的 SQL 语句可能是如下这样的：

```js
let querySQL = `
    SELECT *
    FROM user
    WHERE username='${username}'
    AND psw='${password}'
`;
// 接下来就是执行 sql 语句...
```



```sql
SELECT * FROM user WHERE username='zoumiaojiang' AND psw='mypassword'
```

在 SQL 中，`--` 是注释后面的内容的意思，所以查询语句就变成了：

```sql
SELECT * FROM user WHERE username='zoumiaojiang' OR 1 = 1
```

这条 SQL 语句的查询条件永远为真，所以意思就是恶意攻击者不用我的密码，就可以登录进我的账号，然后可以在里面为所欲为，然而这还只是最简单的注入，牛逼的 SQL 注入高手甚至可以通过 SQL 查询去运行主机系统级的命令，将你主机里的内容一览无余。

##### 防范

* 严格限制 web 应用的数据库操作权限

* 后端代码检查输入的数据是否符合预期

* 对进入数据库的特殊字符（`'`，`"`，`\`，`<`，`>`，`&`，`*`，`;` 等）进行转义处理，或者编码转换

* 所有的查询语句建议使用数据库提供的参数化查询接口

  ```js
  mysql.query(`SELECT * FROM user WHERE username = ? AND psw = ?`, [username, psw]);
  ```

* 在应用发布之前建议使用专业的 SQL 注入检测工具进行检测

* 避免网站打印出 SQL 错误信息

* 不要过于细化返回的错误信息



#### 命令行注入

命令行注入漏洞，指的是攻击者能够通过 HTTP 请求直接侵入主机，执行攻击者预设的 shell 命令，听起来好像匪夷所思，这往往是 Web 开发者最容易忽视但是却是最危险的一个漏洞之一，看一个实例：

假如现在需要实现一个需求：用户提交一些内容到服务器，然后在服务器执行一些系统命令去产出一个结果返回给用户，接口的部分实现如下：

```js
// 以 Node.js 为例，假如在接口中需要从 github 下载用户指定的 repo
const exec = require('mz/child_process').exec;
let params = {/* 用户输入的参数 */};
exec(`git clone ${params.repo} /some/path`);
```

这段代码确实能够满足业务需求，正常的用户也确实能从指定的 git repo 上下载到想要的代码，可是和 SQL 注入一样，这段代码在恶意攻击者眼中，简直就是香饽饽。

如果 `params.repo` 传入的是 `https://github.com/zoumiaojiang/zoumiaojiang.github.io.git` 当然没问题了。
可是如果 `params.repo` 传入的是 `https://github.com/xx/xx.git && rm -rf /* &&` 恰好你的服务是用 root 权限起的就惨了。

具体恶意攻击者能用命令行注入干什么也像 SQL 注入一样，手法是千变万化的，比如「[反弹 shell 注入](http://wiki.bash-hackers.org/howto/redirection_tutorial)」等，但原理都是一样的，我们绝对有能力防止命令行注入发生。防止命令行注入需要做到以下几件事情：

- 后端对前端提交内容需要完全选择不相信，并且对其进行规则限制（比如正则表达式）。
- 在调用系统命令前对所有传入参数进行命令行参数转义过滤。
- 不要直接拼接命令语句，借助一些工具做拼接、转义预处理，例如 Node.js 的 `shell-escape` npm 包。

还是前面的例子，我们可以做到如下：

```js
const exec = require('mz/child_process').exec;
// 借助 shell-escape npm 包解决参数转义过滤问题
const shellescape = require('shell-escape');
let params = {/* 用户输入的参数 */};
// 先过滤一下参数，让参数符合预期
if (!/正确的表达式/.test(params.repo)) {
    return;
}
let cmd = shellescape([
    'git',
    'clone',
    params.repo,
    '/some/path'
]);
// cmd 的值: git clone 'https://github.com/xx/xx.git && rm -rf / &&' /some/path
// 这样就不会被注入成功了。
exec(cmd);
```



### DDos

### 流量劫持

### 服务器漏洞