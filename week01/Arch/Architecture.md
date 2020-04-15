# Architecture

### MVC / MVP / MVVM

#### MVC

MVC把软件系统分为三个基本部分：模型（Model）、视图（View）和控制器（Controller），关系如下图所示：

<img src="https://images2015.cnblogs.com/blog/842381/201609/842381-20160922113536902-586893703.png" alt="img" style="zoom:80%;" />

模型（Model）：数据库相关的操作、文件的访问和数据结构等。

视图（View）：专注于显示，如Web前端（HTML/CSS/Java Script）

控制器（Controller）：连接模型和视图，如把视图的请求发送给模型或把数据返回给视图等



#####MVC只是一种框架模式，针对不同的平台环境的实现方式会有些区别：

##### Web MVC

经典的Web MVC模式，实现的框架有ASP.Net MVC/Spring MVC 等，在Web MVC中Model的数据通过Controller返回给View。

##### 总结：

MVC的实现了视图和模型的分离，避免了视图和模型糅合在一起，当视图改变的时候只要业务逻辑没变不需要改变模型；但是它有一个缺点缺点是因为MVC中的控制器并不能直接更新视图，所以MVC并不能实现视图和模型的完全分离，视图依然依赖模型的数据（数据结构）来显示，也就是说视图依赖模型。

 ### MVP

MVP是针对MVC的缺点而进行了改进，它把软件系统分为三个基本部分：模型（Model）、视图（View）和展示器（Presenter），关系如下图所示：

<img src="https://images2015.cnblogs.com/blog/842381/201609/842381-20160922143006512-1416459650.png" alt="img" style="zoom:80%;" />

模型（Model）：数据库相关的操作、文件的访问和数据结构等。

视图（View）：专注于显示，如Web前端（HTML/CSS/Java Script）

展示器（Presenter）：连接模型和视图，处理视图的请求并根据模型更新视图。

##### 总结：

MVP用展示器代替了控制器，而展示器是可以直接更新视图，所以MVP中展示器可以处理视图的请求并递送到模型又可以根据模型的变化更新视图，实现了视图和模型的完全分离。

 

#### MVVM

MVVM是MVP更进一步的发展，把软件系统分为三个基本部分：模型（Model）、视图（View）和视图模型（ViewModel），关系如下图所示：

<img src="https://images2015.cnblogs.com/blog/842381/201609/842381-20160922143035715-932467285.png" alt="img" style="zoom:80%;" />

模型（Model）：数据库相关的操作、文件的访问和数据结构等。

视图（View）：专注于显示，如Web前端（HTML/CSS/Java Script）

视图模型（ViewModel）：连接模型和视图，视图模型和视图是双向绑定的。



##### 总结：

MVVM用视图模型代替了MVP中的展示器，视图模型和视图实现了双向绑定，当视图发生变化的时候视图模型也会发生改变，当视图模型变化的时候视图也随之变化。

 