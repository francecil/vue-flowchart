# vue-flowchart

> A flowchart base on Vue.js project

## Api

### The model

```javascript
{
  nodes: [Node],
  edges: [Edge]
}
```

#### Node
```javascript
id: {
  name: string,
  x: integer, // x-coordinate of the node relative to the canvas.
  y: integer, // y-coordinate of the node relative to the canvas.
  connectors: [Connector],
  readonly: boolean
}
```

#### Connector
```javascript
id : {
  type: string: leftConnector|rightConnector
}
```

#### Edge
```javascript
{
 source: Connector.id
 destination: Connector.id
 active: boolean
 label:string
}
```

## Build Setup

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

## 定义
节点

连接点：处于节点左右两侧

连线：连接点相连的svg图形，带箭头

标签：处于连线中心

## canvas

分为两种组件，一种是主界面，一种是放置模板节点（带drop-target-id参数）的，这里叫模板界面，可以有多个模板界面。

对于模板界面，仅显示节点，仅支持节点拖拽和鼠标悬浮弹窗

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

### 2. 触发容器的dropover事件

这样做的好处在于，被拖动元素将不可拖动至任意地方，仅在容器中重绘 


### 批量拖拽

## 鼠标悬浮mouseOver

类似 mouseover，它们两者之间的差别是 mouseenter 不会冒泡（bubble）