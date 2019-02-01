import flowchartConstants from '@/config/flowchart'

function NodeDraggingFactory (store, initialState = {}) {
  // 待拖拽点相关信息
  this.dropNodeInfo = null
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
    if (this.dropElement) {
      // this.dropElement.parentNode.removeChild(this.dropElement)
      // this.dropElement = null
    }
    // nodeDropScope.dropElement = elements[0][0].cloneNode(true)

    // let canvasOffset = this.store.state.canvasOffset

    // this.dropElement.offsetInfo = {
    //   offsetX: Math.round(offsetsX[0] + canvasOffset.left),
    //   offsetY: Math.round(offsetsY[0] + canvasOffset.top)
    // }
    // this.dropElement.style.position = 'absolute'
    // this.dropElement.style.pointerEvents = 'none'
    // this.dropElement.style.zIndex = '9999'

    // document.body.appendChild(this.dropElement)

    // let dropNodeInfo = {
    //   node: node,
    //   dropTargetId: this.store.state.dropTargetId,
    //   offsetX: Math.round(offsetsX[0] + canvasOffset.left),
    //   offsetY: Math.round(offsetsY[0] + canvasOffset.top)
    // }
    // event.originalEvent.dataTransfer.setData('text', JSON.stringify(dropNodeInfo))

    if (event.originalEvent.dataTransfer.setDragImage) {
      // var invisibleDiv = angular.element('<div></div>')[0]; // This divs stays invisible, because it is not in the dom.
      // event.originalEvent.dataTransfer.setDragImage(invisibleDiv, 0, 0);
      event.originalEvent.dataTransfer.setDragImage(getDragImage(), 0, 0)
    } else {
      // destinationHtmlElements.push(event.target)
      // oldDisplayStyles.push(event.target.style.display)
      // event.target.style.display = 'none'
      // nodeDraggingScope.shadowDragStarted = true
    }
    return
  }

  // if (dragAnimation === flowchartConstants.dragAnimationShadow) {
  //   for (let i = 0; i < draggedElements.length; i++) {
  //     var dragOffset = dragOffsets[i]
  //     var draggedNode = nodeDraggingScope.draggedNodes[i]
  //     var shadowElement = angular.element('<div style="position: absolute; opacity: 0.7; top: ' + getYCoordinate(dragOffset.y + event.clientY) + 'px; left: ' + getXCoordinate(dragOffset.x + event.clientX) + 'px; "><div class="innerNode"><p style="padding: 0 15px;">' + draggedNode.name + '</p> </div></div>')
  //     var targetInnerNode = angular.element(draggedElements[i]).children()[0]
  //     shadowElement.children()[0].style.backgroundColor = targetInnerNode.style.backgroundColor
  //     nodeDraggingScope.shadowElements.push(shadowElement)
  //     modelservice.getCanvasHtmlElement().appendChild(nodeDraggingScope.shadowElements[i][0])
  //   }
  // }
  try {
    event.dataTransfer.setData('text', 'Just to support firefox')
  } catch (error) {
    console.warn('ie will report error:', error)
  }
  if (event.dataTransfer.setDragImage) {
    // var invisibleDiv = angular.element('<div></div>')[0]; // This divs stays invisible, because it is not in the dom.
    // event.originalEvent.dataTransfer.setDragImage(invisibleDiv, 0, 0);
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
  if (this.store.isDropSource()) {
    return
  }
  // var dropNode = null
  // var infoText = event.originalEvent.dataTransfer.getData('text')
  // if (infoText) {
  //   var dropNodeInfo = null
  //   try {
  //     dropNodeInfo = angular.fromJson(infoText)
  //   } catch (e) {}
  //   if (dropNodeInfo && dropNodeInfo.dropTargetId) {
  //     if (modelservice.getCanvasHtmlElement().id &&
  //         modelservice.getCanvasHtmlElement().id === dropNodeInfo.dropTargetId) {
  //       dropNode = dropNodeInfo.node
  //       var offset = angular.element(modelservice.getCanvasHtmlElement()).offset()
  //       var x = event.clientX - offset.left
  //       var y = event.clientY - offset.top
  //       dropNode.x = Math.round(getXCoordinate(dropNodeInfo.offsetX + x))
  //       dropNode.y = Math.round(getYCoordinate(dropNodeInfo.offsetY + y))
  //     }
  //   }
  // }
  // if (dropNode) {
  //   modelservice.dropNode(event, dropNode)
  //   event.preventDefault()
  //   return false
  // } else if (nodeDraggingScope.draggedNodes.length) {
  //   return applyFunction(function () {
  //     for (var i = 0; i < nodeDraggingScope.draggedNodes.length; i++) {
  //       var draggedNode = nodeDraggingScope.draggedNodes[i]
  //       var dragOffset = dragOffsets[i]
  //       draggedNode.x = Math.round(getXCoordinate(dragOffset.x + event.clientX))
  //       draggedNode.y = Math.round(getYCoordinate(dragOffset.y + event.clientY))
  //     }
  //     event.preventDefault()
  //     return false
  //   })
  // }
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
NodeDraggingFactory.prototype.dragover = function (event) {
  if (this.dropElement) {
    // var offsetInfo = nodeDropScope.dropElement.offsetInfo
    // nodeDropScope.dropElement.style.left = (offsetInfo.offsetX + event.clientX) + 'px'
    // nodeDropScope.dropElement.style.top = (offsetInfo.offsetY + event.clientY) + 'px'
    // if (nodeDraggingScope.shadowDragStarted) {
    //   applyFunction(function () {
    //     destinationHtmlElements[0].style.display = oldDisplayStyles[0]
    //     nodeDraggingScope.shadowDragStarted = false
    //   })
    // }
    return
  }
  if (this.store.isDropSource()) {
    return
  }
  if (!this.draggedNodes.length) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  if (this.dragAnimation === flowchartConstants.dragAnimationRepaint) {
    // if (this.draggedNodes.length) {
    //   for (let i = 0; i < this.draggedNodes.length; i++) {
    //     var draggedNode = this.draggedNodes[i]
    //     var dragOffset = this.dragOffsets[i]
    //     draggedNode.x = getXCoordinate(dragOffset.x + event.clientX)
    //     draggedNode.y = getYCoordinate(dragOffset.y + event.clientY)
    //     resizeCanvas(draggedNode, draggedElements[i])
    //   }
    // }
  } else if (this.dragAnimation === flowchartConstants.dragAnimationShadow) {
    // if (nodeDraggingScope.draggedNodes.length) {
    //   if (nodeDraggingScope.shadowDragStarted) {
    //     applyFunction(function () {
    //       for (var i = 0; i < nodeDraggingScope.draggedNodes.length; i++) {
    //         destinationHtmlElements[i].style.display = oldDisplayStyles[i]
    //       }
    //       nodeDraggingScope.shadowDragStarted = false
    //     })
    //   }
    //   for (var i = 0; i < nodeDraggingScope.draggedNodes.length; i++) {
    //     var draggedNode = nodeDraggingScope.draggedNodes[i]
    //     var dragOffset = dragOffsets[i]
    //     nodeDraggingScope.shadowElements[i].css('left', getXCoordinate(dragOffset.x + event.clientX) + 'px')
    //     nodeDraggingScope.shadowElements[i].css('top', getYCoordinate(dragOffset.y + event.clientY) + 'px')
    //     resizeCanvas(draggedNode, draggedElements[i])
    //   }
    //   event.preventDefault()
    // }
  }
}
export default NodeDraggingFactory
