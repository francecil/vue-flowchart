import flowchartConstants from '@/config/flowchart'
import { checkGraph } from '@/service/topsort'
function Modelvalidation () {
  function ModelvalidationError (message) {
    this.message = message
  }
  ModelvalidationError.prototype = new Error()
  ModelvalidationError.prototype.name = 'ModelvalidationError'
  ModelvalidationError.prototype.constructor = ModelvalidationError
  this.ModelvalidationError = ModelvalidationError

  this.validateModel = function (model) {
    console.log('validateModel')
    this.validateNodes(model.nodes)
    this._validateEdges(model.edges, model.nodes)
    return model
  }

  this.validateNodes = function (nodes) {
    let ids = []
    for (let node of nodes) {
      this.validateNode(node)
      if (ids.indexOf(node.id) !== -1) {
        throw new ModelvalidationError('Id not unique.')
      }
      ids.push(node.id)
    }

    let connectorIds = []
    for (let node of nodes) {
      for (let type in node.connectors) {
        this.validateConnector(node.connectors[type])
        if (connectorIds.indexOf(node.connectors[type].id) !== -1) {
          throw new ModelvalidationError('Id not unique.')
        }
        connectorIds.push(node.connectors[type].id)
      }
    }
    return nodes
  }

  this.validateNode = function (node) {
    if (node.id === undefined) {
      throw new ModelvalidationError('Id not valid.')
    }
    if (typeof node.name !== 'string') {
      throw new ModelvalidationError('Name not valid.')
    }
    if (typeof node.x !== 'number' || node.x < 0) {
      throw new ModelvalidationError('Coordinates not valid.')
    }
    if (typeof node.y !== 'number' || node.y < 0) {
      throw new ModelvalidationError('Coordinates not valid.')
    }
    if (typeof node.connectors !== 'object') {
      throw new ModelvalidationError('Connectors not valid.')
    }
    for (let type in node.connectors) {
      if (type !== flowchartConstants.leftConnectorType && type !== flowchartConstants.rightConnectorType) {
        throw new ModelvalidationError('Connectors not valid.')
      }
      this.validateConnector(node.connectors[type])
    }
    return node
  }

  this._validateEdges = function (edges, nodes) {
    edges.forEach((edge) => {
      this._validateEdge(edge, nodes)
    })
    // 验证重复边，算法可优化
    edges.forEach(function (edge1, index1) {
      edges.forEach(function (edge2, index2) {
        if (index1 !== index2) {
          if ((edge1.source === edge2.source && edge1.destination === edge2.destination) || (edge1.source === edge2.destination && edge1.destination === edge2.source)) {
            throw new ModelvalidationError('Duplicated edge.')
          }
        }
      })
    })

    if (!checkGraph({nodes: nodes, edges: edges})) {
      throw new ModelvalidationError('Graph has a circle.')
    }

    return edges
  }

  this.validateEdges = function (edges, nodes) {
    this.validateNodes(nodes)
    return this._validateEdges(edges, nodes)
  }

  this._validateEdge = function (edge, nodes) {
    if (edge.source === undefined) {
      throw new ModelvalidationError('Source not valid.')
    }
    if (edge.destination === undefined) {
      throw new ModelvalidationError('Destination not valid.')
    }

    if (edge.source === edge.destination) {
      throw new ModelvalidationError('Edge with same source and destination connectors.')
    }
    let sourceNode = nodes.filter(function (node) {
      return node.connectors && node.connectors[flowchartConstants.rightConnectorType] && node.connectors[flowchartConstants.rightConnectorType].id === edge.source
    })[0]
    if (!sourceNode) {
      throw new ModelvalidationError('Source not valid.')
    }
    let destinationNode = nodes.filter(function (node) {
      return node.connectors && node.connectors[flowchartConstants.leftConnectorType] && node.connectors[flowchartConstants.leftConnectorType].id === edge.destination
    })[0]
    if (!destinationNode) {
      throw new ModelvalidationError('Destination not valid.')
    }
    if (sourceNode === destinationNode) {
      throw new ModelvalidationError('Edge with same source and destination nodes.')
    }
    return edge
  }

  this.validateEdge = function (edge, nodes) {
    this.validateNodes(nodes)
    return this._validateEdge(edge, nodes)
  }

  this.validateConnector = function (connector) {
    if (connector.id === undefined) {
      throw new ModelvalidationError('Id not valid.')
    }
    return connector
  }
}
export default new Modelvalidation()
