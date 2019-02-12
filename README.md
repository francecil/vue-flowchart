## vue-flowchart

> 基于Vue.js的流程图框架

目前进度：

[x] 数据显示
[x] 节点拖拽
[x] 节点、连线编辑和删除
[x] 节点新增，预置节点拖拽
[] 画板缩放
[] 撤销删除
[x] 多节点的拖拽
[] 节点样式自定义
[] 节点svg化
[] 节点悬浮提示
[x] 连线拖拽

## 构建

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```
## 使用文档

...

## 定义

### 画板 Canvas

分为两种组件，一种是主界面，一种是放置模板节点的这里叫模板界面，可以有多个模板界面。

对于模板界面，没有连线，且仅支持节点拖拽和鼠标悬浮事件

canvas画板由一个 model 对象控制数据，其中包含两种元素，即节点和连线

```javascript
{
  nodes: [Node],
  edges: [Edge]
}
```

元素的操作，除了在各种组件上的处理外，事件还会派发到canvas上，由canvas决定是否推入历史栈

一些功能按钮，在外部通过slot插槽传入canvas组件，样式让用户自定义

### 节点 Node

主要元素之一

```js
{
  id: Number | String, //唯一标识符
  name: String,//节点名称
  x: Number, // 节点相对canvas的x坐标
  y: Number, // 节点相对canvas的y坐标
  connectors: [Connector],// 连接点
  readonly: Boolean=false,// 是否只读,只读模式下仅支持鼠标悬浮事件
  addition:Object// 支持拓展
}
```

### 连接点 Connector

一个node最多仅有两个connector(左右两侧两种类型)

用于连线时使用

```javascript
{
  // 连接点类型，取值范围:leftConnector/rightConnector
  [type: String]: {
    id: Number | String, //唯一标识符
  }
}
```

组件配置：


### 连线 Edge

主要元素之一

由某节点的rightConnector连接点和另一节点的leftConnector连接点相连，带箭头

```javascript
{
  source: Connector.id,
  destination: Connector.id,
  active: Boolean=false,// 应用连线流动动画
  label:String//连线的标签
}
```

### 标签 

处于连线中心

### 其他坐标

event.clientX： 基于浏览器窗口的x坐标



## 拖拽

连线随节点变动而变动

如何做到高效实时拖拽？

### 1. 监听待拖放节点的drag事件，跟随clientX/Y移动

```js
    handleDragstart () {
      console.log('node Dragstart:', event)
      let elementBox = this.$el.getBoundingClientRect()
      this.eventPointOffset.x = event.clientX - elementBox.left
      this.eventPointOffset.y = event.clientY - elementBox.top
      // this.nodedraggingservice.dragstart(event)
      let dataTransfer = event.dataTransfer
      dataTransfer.dropEffect = 'move'
      dataTransfer.setData('Text', event.target.id)
      dataTransfer.setDragImage(this.$el, this.eventPointOffset.x, this.eventPointOffset.y)
      this.$emit('node-dragstart', this.node)
      this.updateConnectorPosition()
    },
    handleDragging (event) {
      console.log('handleDragging')
      if (!(event.clientX && event.clientY)) {
        return
      }
      let newNode = Object.assign(this.node, {
        x: event.clientX - this.canvas.left - this.eventPointOffset.x,
        y: event.clientY - this.canvas.top - this.eventPointOffset.y
      })
      this.updateNode({
        node: this.node,
        newNode
      })
      this.updateConnectorPosition()
    },
    handleDragend () {
      console.log('node Dragend:', event)
      let newNode = Object.assign(this.node, {
        x: event.clientX - this.canvas.left - this.eventPointOffset.x,
        y: event.clientY - this.canvas.top - this.eventPointOffset.y
      })
      this.updateNode({
        node: this.node,
        newNode,
        isPushState: true
      })
      this.$emit('node-dragend', event)
      // this.updateConnectorPosition()
    }
```
firefox 下 drag,dragend拿到的event.clientX/Y 为0,只能从容器的 dragover 和drop事件的event中获取

firefox 必须使用`dataTransfer.setData('text', xxx)` ie11上会报错且getData拿不到数据?

dragover时拿不到`dataTransfer.getData`

### 2. 触发容器的dragover事件

这样做的好处在于，被拖动元素将不可拖动至任意地方，仅在容器中重绘 

chrome 中 dragover 不能拿到`event.dataTransfer.getData('Text')`

### 批量拖拽

## 鼠标悬浮mouseOver

类似 mouseover，它们两者之间的差别是 mouseenter 不会冒泡（bubble）