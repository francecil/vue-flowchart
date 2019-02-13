function RectangleSelectFactory (store, initialState = {}) {
  this.store = store
  this.selectRect = {
    x1: 0,
    x2: 0,
    y1: 0,
    y2: 0
  }
  this.startSelect = false
  for (let prop in initialState) {
    if (initialState.hasOwnProperty(prop) && this.hasOwnProperty(prop)) {
      this[prop] = initialState[prop]
    }
  }
}

function updateSelectRect (selectRect, store) {
  var x3 = Math.min(selectRect.x1, selectRect.x2)
  var x4 = Math.max(selectRect.x1, selectRect.x2)
  var y3 = Math.min(selectRect.y1, selectRect.y2)
  var y4 = Math.max(selectRect.y1, selectRect.y2)
  store.commit('UPDATE_RECTANGLE_SELECT', {
    left: x3,
    top: y3,
    width: x4 - x3,
    height: y4 - y3,
    visibility: 'visible'
  })
}
RectangleSelectFactory.prototype.init = function () {
  this.store.commit('UPDATE_RECTANGLE_SELECT', {
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    visibility: 'hidden'
  })
  this.selectRect = {
    x1: 0,
    x2: 0,
    y1: 0,
    y2: 0
  }
  this.startSelect = false
}
RectangleSelectFactory.prototype.mousedown = function (e) {
  if (this.store.isEditable() && !e.ctrlKey && !e.metaKey && e.button === 0) {
    this.startSelect = true
    this.selectRect.x1 = Math.round(e.clientX - this.store.getCanvasOffsetRelativeLeft())
    this.selectRect.y1 = Math.round(e.clientY - this.store.getCanvasOffsetRelativeTop())
  }
}
RectangleSelectFactory.prototype.mousemove = function (e) {
  if (this.store.isEditable() && !e.ctrlKey && !e.metaKey && e.button === 0 && this.startSelect) {
    this.selectRect.x2 = Math.round(e.clientX - this.store.getCanvasOffsetRelativeLeft())
    this.selectRect.y2 = Math.round(e.clientY - this.store.getCanvasOffsetRelativeTop())
    updateSelectRect(this.selectRect, this.store)
  }
}
RectangleSelectFactory.prototype.mouseup = function (e) {
  if (this.store.isEditable() && !e.ctrlKey && !e.metaKey && e.button === 0 && this.startSelect) {
    // var rectBox = rectangleSelectService.selectElement.getBoundingClientRect()
    // rectBox.parentOffset = jquery(modelservice.getCanvasHtmlElement()).offset()
    this.store.selectAllInRect()
    this.init()
  }
}

export default RectangleSelectFactory
