# Nginx

正向代理和反向代理的区别在于代理的对象不一样

正向代理的代理对象是客户端。

反向代理的代理对象是服务端。

```nginx
http {
    upstream video {
        ip_hash;
        server localhost:3000;
    }
    server {
        listen: 8080;
        location / {
            proxy_pass: http://video
        }
    }
}
```

#### upstream配置信息：

upstream关键字后紧跟的标识符是我们自定义的项目名称，通过一对花括号在其中增添我们的配置信息。

`ip_hash` 关键字：控制用户再次访问时是否连接到前一次连接的服务器

`server`关键字：我们真实服务器的地址，这里的内容肯定是需要我们去填写的，不然运维怎么知道你把项目放在那个服务器上了，也不知道你封装了一层node而得去监听3000端口。

#### server配置信息

server是nginx的基本配置，我们需要通过server将我们定义的upstream应用到服务器上。

`listen`关键字：服务器监听的端口

`location`关键字：和我们之前在node层说到的路由是起同样的功能，这里是把用户的请求分配到对应的upstream上



## 正向代理 & 反向代理

A同学在大众创业、万众创新的大时代背景下开启他的创业之路，目前他遇到的最大的一个问题就是启动资金，于是他决定去找马云爸爸借钱，可想而知，最后碰一鼻子灰回来了，情急之下，他想到一个办法，找关系开后门，经过一番消息打探，原来A同学的大学老师王老师是马云的同学，于是A同学找到王老师，托王老师帮忙去马云那借500万过来，当然最后事成了。不过马云并不知道这钱是A同学借的，马云是借给王老师的，最后由王老师转交给A同学。这里的王老师在这个过程中扮演了一个非常关键的角色，就是代理，也可以说是正向代理，王老师代替A同学办这件事，这个过程中，真正借钱的人是谁，马云是不知道的，这点非常关键。

我们常说的代理也就是只正向代理，正向代理的过程，它隐藏了真实的请求客户端，服务端不知道真实的客户端是谁，客户端请求的服务都被代理服务器代替来请求，某些科学上网工具扮演的就是典型的正向代理角色。用浏览器访问 http://www.google.com 时，被残忍的block，于是你可以在国外搭建一台代理服务器，让代理帮我去请求google.com，代理把请求返回的相应结构再返回给我。

![img](https://pic4.zhimg.com/80/v2-07ededff1d415c1fa2db3fd89378eda0_720w.jpg)


大家都有过这样的经历，拨打10086客服电话，可能一个地区的10086客服有几个或者几十个，你永远都不需要关心在电话那头的是哪一个，叫什么，男的，还是女的，漂亮的还是帅气的，你都不关心，你关心的是你的问题能不能得到专业的解答，你只需要拨通了10086的总机号码，电话那头总会有人会回答你，只是有时慢有时快而已。那么这里的10086总机号码就是我们说的反向代理。客户不知道真正提供服务人的是谁。

20反向代理隐藏了真实的服务端，当我们请求 www.baidu.com 的时候，就像拨打10086一样，背后可能有成千上万台服务器为我们服务，但具体是哪一台，你不知道，也不需要知道，你只需要知道反向代理服务器是谁就好了，www.baidu.com 就是我们的反向代理服务器，反向代理服务器会帮我们把请求转发到真实的服务器那里去。Nginx就是性能非常好的反向代理服务器，用来做负载均衡。



![img](https://pic4.zhimg.com/80/v2-816f7595d80b7ef36bf958764a873cba_720w.jpg)

### 正向代理配置场景演示

正向代理很常见,我们的科学上网就是一种正向代理。
 我们接下来演示正向代理的这么一个场景。
 首先我在我的A服务器的nginx设置访问控制
 访问控制之前我访问A下的test.html是这样的:

![img](https:////upload-images.jianshu.io/upload_images/2660278-26965236907d0b63.png?imageMogr2/auto-orient/strip|imageView2/2/w/672/format/webp)



我们打开/etc/nginx/conf.d/default.conf
 我们加入这么一个判断语句
 如果访问A的IP不是118.126.106.11(我的B服务器)则返回403.



```nginx
location / {
  if ( $remote_addr !~* "^118\.126\.106\.11") {
    return 403;
  }
  root   /opt/app/demo/html;
  index  index.html index.htm;
}
```

添加后reload一下nginx再访问test.html:

![img](https:////upload-images.jianshu.io/upload_images/2660278-d562cc7a7da6a375.png?imageMogr2/auto-orient/strip|imageView2/2/w/1200/format/webp)


 此时本地我的浏览器就是被限制了,访问不了该资源。
 现在我登录上我的B服务器,打开/etc/nginx/conf.d/default.conf
 添加`resolver`和`proxy_pass`,设置如下:

```python
server {
    listen       80;
    server_name  localhost nginx.tangll.cn;

    resolver 8.8.8.8;
    location / {
        proxy_pass http://$http_host$request_uri;
    }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
```

`resolver`为DNS解析,这里填写的IP为Google提供的免费DNS服务器的IP地址
 `proxy_pass`配置代理转发
 至此便是配置了B服务器所有访问根一级的请求全部都代理转发对应到$http_host$request_uri去了,`$http_host`就是我们要访问的主机名,`$request_uri`就是我们后面所加的参数。
 简单的说至此就是相当于配置好了我们请求了B服务器,B服务器再去请求我们所请求的地址。

那么接下来我们来看一下结果,我们在本地配置好代理,我这里是mac系统,可以从网络设置中选择高级,然后选择代理

![img](https:////upload-images.jianshu.io/upload_images/2660278-97f03c5f6b8fdf3d.png?imageMogr2/auto-orient/strip|imageView2/2/w/1200/format/webp)


 填入我们B服务器的IP,然后我们来看一下代理是否成功。
 我们登录[http://www.ip138.com/](https://link.jianshu.com?t=http%3A%2F%2Fwww.ip138.com%2F) 可以看到此时我们的IP地址已经为B服务器的IP,说明代理成功。

![img](https:////upload-images.jianshu.io/upload_images/2660278-11a88d22a5b71572.png?imageMogr2/auto-orient/strip|imageView2/2/w/936/format/webp)


 然后我们再来访问一下test.html:

![img](https:////upload-images.jianshu.io/upload_images/2660278-180b6a4ea2aaa22e.png?imageMogr2/auto-orient/strip|imageView2/2/w/822/format/webp)


 结果证明,此时的客户端已经可以成功访问A服务器的资源。
 以上就是正向代理的一个场景演示,这个过程中可以知道,我们客户端是想要A的资源,但是A的资源只有B能拿到,便让B代理去帮助我们访问A的资源。整个过程A只知道B拿了他的资源,并不知道客户端拿到。

### 反向代理配置场景演示

反向代理的演示更为简单一些。
 首先在/etc/nginx/conf.d/下新建一个test.conf:

```python
server {
    listen       8080;
    server_name  localhost nginx.tangll.cn;

    location / {
        root   /opt/app/demo/html;
        index  index.html index.htm;
    }

    error_page   500 502 503 504 404  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
```

可以看到我server里listen的是8080端口,但是我的服务器本身不对外开放8080端口,只开放了80端口。
 所以我们此时访问test.html结果是访问不到的:

![img](https:////upload-images.jianshu.io/upload_images/2660278-a9a8483c9cd251b1.png?imageMogr2/auto-orient/strip|imageView2/2/w/1200/format/webp)


 然后我们打开我们的/etc/nginx/conf.d/default.conf
 添加`proxy_pass`设置如下:

```python
server {
    listen       80;
    server_name  localhost nginx.tangll.cn;
    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }
  
    #设置代理
    #location ~ /test.html$ {
    #    proxy_pass http://127.0.0.1:8080;
    #}

    error_page   500 502 503 504 404  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
```

我们设置当匹配test.html结尾的URL时就去代理访问本机的8080端口
 为了对比我们先注释掉,然后直接80端口访问一下test.html:

![img](https:////upload-images.jianshu.io/upload_images/2660278-c92869226489a4f7.png?imageMogr2/auto-orient/strip|imageView2/2/w/1200/format/webp)

可以看到此时返回的404。
 这时候取消注释我们reload一下nginx然后用80端口访问test.html

![img](https:////upload-images.jianshu.io/upload_images/2660278-bf0341255ce55a84.png?imageMogr2/auto-orient/strip|imageView2/2/w/758/format/webp)

 此时便可访问8080端口配置的资源。
 以上便是完成了一个反向代理的演示,这个过程中我们可以知道,客户端想要访问的是test.html,但是test.html实际上是8080端口下配置的,中间经过了代理才能拿到。也就是说客户端并不知道中间经历了什么代理过程,只有服务端知道。客户端只知道他拿到了test.html也就是8080端口下配置的资源内容。

