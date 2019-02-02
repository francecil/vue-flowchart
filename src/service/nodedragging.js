import flowchartConstants from '@/config/flowchart'

function NodeDraggingFactory (store, initialState = {}) {
  // 待拖拽点相关信息,dragover时使用
  this.dropNodeInfo = null
  // 所有待拖拽点
  this.draggedNodes = []
  this.store = store
  this.automaticResize = true
  this.dragThreshold = 0
  this.dragAnimation = flowchartConstants.dragAnimationRepaint
  for (let prop in initialState) {
    if (initialState.hasOwnProperty(prop) && this.hasOwnProperty(prop)) {
      this[prop] = initialState[prop]
    }
  }
}
// function getCoordinate (coordinate, max) {
//   coordinate = Math.max(coordinate, 0)
//   coordinate = Math.min(coordinate, max)
//   return coordinate
// }
// function getXCoordinate (x) {
//   return getCoordinate(x, store.state.canvasOffset.width)
// }
// function getYCoordinate (y) {
//   return getCoordinate(y, store.state.canvasOffset.height)
// }
// const resizeCanvas = function (draggedNode, nodeElement) {
//   // 调整canvas画板，仅会不断变大
//   if (automaticResize && !store.isDropSource()) {
//     let canvasOffset = store.state.canvasOffset
//     let newOffset = {
//       width: canvasOffset.width,
//       height: canvasOffset.height
//     }
//     if (canvasOffset.width < draggedNode.x + nodeElement.offsetWidth + flowchartConstants.canvasResizeThreshold) {
//       newOffset.width = canvasOffset.width + flowchartConstants.canvasResizeStep + 'px'
//     }
//     if (canvasOffset.height < draggedNode.y + nodeElement.offsetHeight + flowchartConstants.canvasResizeThreshold) {
//       newOffset.height = canvasOffset.height + flowchartConstants.canvasResizeStep + 'px'
//     }
//     store.commit('UPDATE_CANVAS_OFFSET', newOffset)
//   }
// }
let dragImage = null
// 一个透明图像
const getDragImage = function () {
  if (!dragImage) {
    dragImage = new Image()
    dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    dragImage.style.visibility = 'hidden'
  }
  return dragImage
}
const getDragOffset = function (event, dropNodeInfo, canvasOffset) {
  return {
    x: event.clientX - dropNodeInfo.eventPointOffset.x - canvasOffset.left - dropNodeInfo.node.x,
    y: event.clientY - dropNodeInfo.eventPointOffset.y - canvasOffset.top - dropNodeInfo.node.y
  }
}
NodeDraggingFactory.prototype.init = function () {
  this.dropNodeInfo = null
  this.draggedNodes.length = 0
}
NodeDraggingFactory.prototype.dragstart = function (event, node, eventPointOffset) {
  if (node.readonly) {
    return
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
    event.dataTransfer.setData('text', JSON.stringify(this.dropNodeInfo))
    return
  }
  try {
    event.dataTransfer.setData('text', JSON.stringify(this.dropNodeInfo))
  } catch (error) {
    console.warn('ie will report error:', error)
  }
  if (event.dataTransfer.setDragImage) {
    event.dataTransfer.setDragImage(getDragImage(), 0, 0)
  } else {
    // 兼容ie
    // for (let i = 0; i < draggedElements.length; i++) {
    //   destinationHtmlElements.push(draggedElements[i])
    //   oldDisplayStyles.push(destinationHtmlElements[i].style.display)
    //   destinationHtmlElements[i].style.display = 'none' // Internetexplorer does not support setDragImage, but it takes an screenshot, from the draggedelement and uses it as dragimage.
    // }
    // // Since angular redraws the element in the next dragover call, display: none never gets visible to the user.
    // if (dragAnimation === flowchartConstants.dragAnimationShadow) {
    //   // IE Drag Fix
    //   nodeDraggingScope.shadowDragStarted = true
    // }
  }
}

NodeDraggingFactory.prototype.drop = function (event) {
  let dropNodeInfoStr = event.dataTransfer.getData('text')
  console.log('dropNodeInfoStr:', dropNodeInfoStr)
  // 画板属于dropsource 或 dropNodeInfo信息不存在
  if (this.store.isDropSource() || !dropNodeInfoStr) {
    return
  }
  try {
    let dropNodeInfo = JSON.parse(dropNodeInfoStr)
    // 原节点属于类型节点
    if (dropNodeInfo.isDropSource) {

    } else {
      // 节点属于目标画板节点，直接应用
      let offset = getDragOffset(event, this.dropNodeInfo, this.store.state.canvasOffset)
      for (let node of this.draggedNodes) {
        let newNode = Object.assign(node, {
          x: node.x + offset.x,
          y: node.y + offset.y
        })
        this.store.updateNode({
          node: node,
          newNode
        })
      }
    }
  } catch (error) {

  }

  this.init()
}
NodeDraggingFactory.prototype.dragover = function (event) {
  // 画板属于dropsource 或 拖拽节点不在目标画板
  if (this.store.isDropSource() || !this.dropNodeInfo) {
    return
  }
  let offset = getDragOffset(event, this.dropNodeInfo, this.store.state.canvasOffset)
  if (offset.x < this.dragThreshold && offset.y < this.dragThreshold) {
    return
  }
  for (let node of this.draggedNodes) {
    let newNode = Object.assign(node, {
      x: node.x + offset.x,
      y: node.y + offset.y
    })
    this.store.updateNode({
      node: node,
      newNode
    })
  }
}
export default NodeDraggingFactory
