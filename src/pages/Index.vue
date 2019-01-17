<template>
  <div class="main-container">
    <fc-canvas
      :model="model"
      edge-style="curved"
      @edge-edit="handleEdgeEdit"
      @node-edit="handleNodeEdit"
    />
  </div>
</template>

<script>
// import EdgedrawingService from '@/service/edgedrawing'
// import flowchartConstants from '@/config/flowchart'
import FcCanvas from '@/components/FcCanvas'
export default {
  name: 'HelloWorld',
  components: {
    'fc-canvas': FcCanvas
  },
  data () {
    return {
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
  },
  methods: {
    handleEdgeEdit (edge) {
      edge.label = 'tesr'
    },
    handleNodeEdit (node) {
      node.name = 'test'
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
