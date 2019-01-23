<template>
  <div class="fc-container">
    <div class="fc-left-pane">
      <fc-canvas
        :model="nodeTypesModel"
        :is-type-model="true"
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
      <div class="main-container">
        <fc-canvas
          :model="model"
          edge-style="curved"
        />
      </div>
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
    let nodeTypesModel = {
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
      nodeTypesModel.nodes.push(node)
    }
    return {
      nodeTypesModel: nodeTypesModel,
      model: {
        nodes: [{
          id: 1,
          name: 'node1',
          x: 411, // x-coordinate of the node relative to the canvas.
          y: 74,
          connectors: [{
            id: 11,
            type: 'leftConnector'
          }]
        }, {
          id: 2,
          name: 'node2',
          x: 133, // x-coordinate of the node relative to the canvas.
          y: 254,
          connectors: [{
            id: 12,
            type: 'rightConnector'
          }]
        }],
        edges: [{
          source: 12,
          destination: 11,
          active: false,
          label: 'label0'
        }]
      }
    }
  },
  mounted () {
    // this.model = {
    //   nodes: {
    //     1: {
    //       name: 'node1',
    //       x: 411, // x-coordinate of the node relative to the canvas.
    //       y: 74,
    //       connectors: {
    //         11: {
    //           type: 'leftConnector'
    //         }
    //       }
    //     },
    //     2: {
    //       name: 'node2',
    //       x: 133, // x-coordinate of the node relative to the canvas.
    //       y: 254,
    //       connectors: {
    //         12: {
    //           type: 'rightConnector'
    //         }
    //       }
    //     }
    //   },
    //   edges: [{
    //     source: 12,
    //     destination: 11,
    //     active: false,
    //     label: 'label0'
    //   }]
    // }
  },
  methods: {
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
.main-container {
  width: 100%;
  height: 100vh;
}
.fc-container {
  display: flex;
  flex: 1;
  flex-direction: row;
}

.fc-left-pane {
  flex: 0.25;
  overflow: auto;
}

</style>
