import flowchartConstants from '@/config/flowchart'
/**
 * Kahn算法 检测有向图是否存在环
 * @param {*} graph
 */
export function checkGraph (graph) {
  // 计算出所有顶点的入度
  let adjacentList = {}
  graph.nodes.forEach(function (node) {
    adjacentList[node.id] = {incoming: 0, outgoing: []}
  })
  graph.edges.forEach(function (edge) {
    let sourceNode = graph.nodes.filter(function (node) {
      return node.connectors && node.connectors[flowchartConstants.rightConnectorType] && node.connectors[flowchartConstants.rightConnectorType].id === edge.source
    })[0]
    let destinationNode = graph.nodes.filter(function (node) {
      return node.connectors && node.connectors[flowchartConstants.leftConnectorType] && node.connectors[flowchartConstants.leftConnectorType].id === edge.destination
    })[0]

    adjacentList[sourceNode.id].outgoing.push(destinationNode.id)
    adjacentList[destinationNode.id].incoming++
  })
  // 保存出队元素
  let orderedNodes = []
  // 将所有入度为0的点加入到一个队列
  let sourceNodes = []
  for (let id in adjacentList) {
    if (adjacentList[id].incoming === 0) {
      sourceNodes.push(id)
    }
  }
  // 记录访问过的顶点个数
  let count = 0
  while (sourceNodes.length !== 0) {
    // 将队头元素pop
    let sourceNode = sourceNodes.pop()
    count++
    // 将这个点的所有相邻点的入度减一，如果某个相邻点的入度减小为0，则将这个相邻点加入到队列中
    for (let destinationNode of adjacentList[sourceNode].outgoing) {
      if (--adjacentList[destinationNode].incoming === 0) {
        sourceNodes.push(destinationNode)
      }
    }
    orderedNodes.push(sourceNode)
  }
  return count === graph.nodes.length
}
