import flowchartConstants from '@/config/flowchart'
import UUIDjs from '@/utils/uuid'
// require('../utils/setDragImage.polyfill.js')

function NodeDraggingFactory (store, initialState = {}) {
  // 待拖拽点相关信息,dragover时使用
  this.dropNodeInfo = null
  this.nodeAddCallback = () => { }
  // 所有待拖拽点
  this.draggedNodes = []
  this.store = store
  this.automaticResize = true
  this.dragAnimation = flowchartConstants.dragAnimationRepaint
  for (let prop in initialState) {
    if (initialState.hasOwnProperty(prop) && this.hasOwnProperty(prop)) {
      this[prop] = initialState[prop]
    }
  }
}
const resizeCanvas = function (node, automaticResize, store) {
  // 调整canvas画板，仅会不断变大
  if (automaticResize && !store.isDropSource()) {
    let canvasOffset = store.state.canvasOffset
    let newOffset = {
      width: canvasOffset.width,
      height: canvasOffset.height
    }
    let hasChange = false
    if (canvasOffset.width < node.x + flowchartConstants.canvasResizeThreshold) {
      hasChange = true
      newOffset.width = canvasOffset.width + flowchartConstants.canvasResizeStep
    }
    if (canvasOffset.height < node.y + flowchartConstants.canvasResizeThreshold) {
      hasChange = true
      newOffset.height = canvasOffset.height + flowchartConstants.canvasResizeStep
    }
    if (hasChange) {
      store.commit('UPDATE_CANVAS_OFFSET', newOffset)
    }
  }
}
// let dragImage = null
// // 一个透明图像
// const getDragImage = function () {
//   if (!dragImage) {
//     dragImage = new Image()
//     dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
//     dragImage.style.visibility = 'hidden'
//   }
//   return dragImage
// }
const getDragOffset = function (event, dropNodeInfo, canvasOffset) {
  return {
    x: event.clientX - dropNodeInfo.eventPointOffset.x - canvasOffset.left - dropNodeInfo.node.x,
    y: event.clientY - dropNodeInfo.eventPointOffset.y - canvasOffset.top - dropNodeInfo.node.y
  }
}
NodeDraggingFactory.prototype.init = function () {
  this.dropNodeInfo = null
  this.draggedNodes.length = 0
  let nodeDragging = {
    dragging: false,
    downOffset: null
  }
  console.log('nodedragging init')
  this.store.commit('UPDATE_NODE_DRAGGING', nodeDragging)
}
NodeDraggingFactory.prototype.dragstart = function (event, node, eventPointOffset) {
  if (node.readonly) {
    return
  }
  let nodeDragging = {}
  nodeDragging.dragging = true
  nodeDragging.downOffset = {
    x: event.clientX,
    y: event.clientY
  }
  this.dropNodeInfo = {
    node,
    eventPointOffset
  }
  this.draggedNodes.length = 0
  // 被拖拽节点处于选择状态，故可能还有其他被选择节点，将会一起拖动
  if (this.store.isSelectedObject(node)) {
    this.draggedNodes = this.store.getSelectedNodes()
  } else {
    this.draggedNodes.push(node)
  }
  if (this.store.isDropSource()) {
    this.dropNodeInfo.isDropSource = true
    // event.dataTransfer.setData('text', JSON.stringify(this.dropNodeInfo))
    // return
  }
  // try {
  //   event.dataTransfer.setData('text', JSON.stringify(this.dropNodeInfo))
  // } catch (error) {
  //   console.warn('ie will report error:', error)
  // }
  // if (event.dataTransfer.setDragImage) {
  //   event.dataTransfer.setDragImage(getDragImage(), 0, 0)
  // }
  this.store.commit('UPDATE_NODE_DRAGGING', nodeDragging)
}

NodeDraggingFactory.prototype.drop = async function (event) {
  // let dropNodeInfoStr = event.dataTransfer.getData('text')
  // console.log('dropNodeInfoStr:', dropNodeInfoStr)
  // 画板属于dropsource 或 dropNodeInfo信息不存在
  // if (this.store.isDropSource()
  // // || !dropNodeInfoStr
  // ) {
  //   return
  // }
  try {
    let dropNodeInfo = this.dropNodeInfo
    // 原节点属于类型节点
    if (dropNodeInfo.isDropSource) {
      let name = await this.nodeAddCallback(dropNodeInfo.node.name)
      let newNode = Object.assign(dropNodeInfo.node, {
        id: UUIDjs.create('node'),
        name: name,
        x: event.clientX - dropNodeInfo.eventPointOffset.x - this.store.getCanvasOffsetRelativeLeft(),
        y: event.clientY - dropNodeInfo.eventPointOffset.y - this.store.getCanvasOffsetRelativeTop()
      })
      for (let type in newNode.connectors) {
        newNode.connectors[type].id = UUIDjs.create('connector')
      }
      this.store.addNode({ node: newNode, isPushState: true })
    } else {
      let downOffset = this.store.state.nodeDragging.downOffset
      console.log(downOffset.x, event.clientX, downOffset.y, event.clientY)
      if (downOffset.x === event.clientX && downOffset.y === event.clientY) {
        // handle click
        setTimeout(() => {
          this.init()
        }, 0)
        return
      } else {
        // 节点属于目标画板节点，直接应用
        let offset = getDragOffset(event, this.dropNodeInfo, {
          left: this.store.getCanvasOffsetRelativeLeft(),
          top: this.store.getCanvasOffsetRelativeTop()
        })
        for (let node of this.draggedNodes) {
          let newNode = Object.assign(node, {
            x: node.x + offset.x,
            y: node.y + offset.y
          })
          this.store.updateNode({
            node: node,
            newNode,
            isPushState: true
          })
        }
      }
    }
  } catch (error) {

  }

  this.init()
}
NodeDraggingFactory.prototype.dragover = function (event) {
  // 画板属于dropsource 或 拖拽节点不在目标画板
  // if (this.store.isDropSource() || !this.dropNodeInfo) {
  //   return
  // }
  if (!this.store.state.nodeDragging.dragging) {
    return
  }
  let offset = getDragOffset(event, this.dropNodeInfo, {
    left: this.store.getCanvasOffsetRelativeLeft(),
    top: this.store.getCanvasOffsetRelativeTop()
  })
  for (let node of this.draggedNodes) {
    let newNode = Object.assign(node, {
      x: node.x + offset.x,
      y: node.y + offset.y
    })
    this.store.updateNode({
      node: node,
      newNode
    })
    resizeCanvas(newNode, this.automaticResize, this.store)
  }
}
export default NodeDraggingFactory
