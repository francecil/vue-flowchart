<template>
  <div
    ref="connector"
    :draggable="true"
    :class="flowchartConstants.connectorClass"/>
</template>
<script>
import flowchartConstants from '@/config/flowchart'
export default {
  props: {
    connector: {
      type: Object,
      default: () => {
        return {}
      }
    },
    modelservice: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      flowchartConstants: flowchartConstants
    }
  },
  mounted () {
    this.modelservice.connectors.setHtmlElement(this.connector.id, this.$refs.connector)
  }
}
</script>
