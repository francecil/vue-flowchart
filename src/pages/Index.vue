<template>
  <div class="fc-container">
    <div class="fc-left-pane">
      <fc-canvas
        :model="dropSourceModel"
        :automatic-resize="false"
        drop-target-id="fc-target-canvas"
      />
    </div>
    <div
      class="fc-divider"
      style="background-color: gray;"/>
    <div class="fc-right-pane">
      <div class="button-overlay">
        <button
          ng-click="addNewNode()"
          title="Add a new node to then chart">Add Node</button>
        <button
          ng-click="deleteSelected()"
          ng-disabled="modelservice.nodes.getSelectedNodes().length == 0 && modelservice.edges.getSelectedEdges().length == 0"
          title="Delete selected nodes and connections">
          Delete Selected
        </button>
        <button ng-click="activateWorkflow()">
          Activate Workflow
        </button>
      </div>
      <fc-canvas
        :model="model"
        :node-add-callback="nodeAddCallback"
        edge-style="curved"
      />
    </div>
  </div>

</template>

<script>
// import EdgedrawingService from '@/service/edgedrawing'
import flowchartConstants from '@/config/flowchart'
import FcCanvas from '@/components/FcCanvas'
export default {
  name: 'HelloWorld',
  components: {
    'fc-canvas': FcCanvas
  },
  data () {
    let dropSourceModel = {
      nodes: [],
      edges: []
    }
    for (let i = 0; i < 10; i++) {
      let node = {
        name: 'type' + i,
        id: (i + 1) + 10000,
        x: 50,
        y: 100 * (i + 1),
        connectors: [
          {
            type: flowchartConstants.leftConnectorType,
            id: i * 2 + 1 + 10000
          },
          {
            type: flowchartConstants.rightConnectorType,
            id: i * 2 + 2 + 10000
          }
        ]
      }
      dropSourceModel.nodes.push(node)
    }
    return {
      dropSourceModel: dropSourceModel,
      model: {
        nodes: [{
          id: 1,
          name: 'root',
          x: 120, // x-coordinate of the node relative to the canvas.
          y: 400,
          readonly: true,
          connectors: [{
            id: 11,
            type: flowchartConstants.rightConnectorType
          }]
        }, {
          id: 2,
          name: 'node1',
          x: 411, // x-coordinate of the node relative to the canvas.
          y: 200,
          connectors: [{
            id: 12,
            type: flowchartConstants.leftConnectorType
          }, {
            id: 13,
            type: flowchartConstants.rightConnectorType
          }]
        }, {
          id: 3,
          name: 'node2',
          x: 800, // x-coordinate of the node relative to the canvas.
          y: 500,
          connectors: [{
            id: 14,
            type: flowchartConstants.leftConnectorType
          }, {
            id: 15,
            type: flowchartConstants.leftConnectorType
          }]
        }],
        edges: [{
          source: 11,
          destination: 12,
          active: false,
          label: 'label0'
        }, {
          source: 13,
          destination: 14,
          active: true,
          label: 'label1'
        }, {
          source: 11,
          destination: 15,
          active: true,
          label: 'label3'
        }]
      }
    }
  },
  mounted () {
    // 模拟数据获取
    // setTimeout(() => {
    //   this.model = {
    //     nodes: [{
    //       id: 1,
    //       name: 'root',
    //       x: 120, // x-coordinate of the node relative to the canvas.
    //       y: 400,
    //       readonly: true,
    //       connectors: [{
    //         id: 11,
    //         type: flowchartConstants.rightConnectorType
    //       }]
    //     }, {
    //       id: 2,
    //       name: 'node1',
    //       x: 411, // x-coordinate of the node relative to the canvas.
    //       y: 200,
    //       connectors: [{
    //         id: 12,
    //         type: flowchartConstants.leftConnectorType
    //       }, {
    //         id: 13,
    //         type: flowchartConstants.rightConnectorType
    //       }]
    //     }, {
    //       id: 3,
    //       name: 'node2',
    //       x: 800, // x-coordinate of the node relative to the canvas.
    //       y: 500,
    //       connectors: [{
    //         id: 14,
    //         type: flowchartConstants.leftConnectorType
    //       }]
    //     }],
    //     edges: [{
    //       source: 11,
    //       destination: 12,
    //       active: false,
    //       label: 'label0'
    //     }, {
    //       source: 13,
    //       destination: 14,
    //       active: true,
    //       label: 'label1'
    //     }]
    //   }
    // }, 2000)
  },
  methods: {
    nodeAddCallback (name) {
      return prompt('新增节点', name)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
/* eslint-disable */
body {
  font-family: sans-serif;
  margin: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100vh;
}
.fc-container {
  display: flex;
  flex: 1;
  flex-direction: row;
}

.fc-left-pane {
  flex: 0.25;
}

</style>
