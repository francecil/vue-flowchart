
<template>
  <div
    :class="flowchartConstants.magnetClass"
    v-on="listenersComputed"
  >
    <slot/>
  </div>
</template>
<script>
// 放置connector的容器
import flowchartConstants from '@/config/flowchart'
export default {
  props: {
    store: {
      type: Object,
      default: () => {
        return {}
      }
    },
    connector: {
      type: Object,
      default: () => {
        return {}
      }
    },
    edgeDraggingService: {
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
  computed: {
    listenersComputed () {
      if (this.store.isEditable()) {
        return {
          drop: this.handleDrop
        }
      } else {
        return {}
      }
    }
  },
  methods: {
    handleDrop (event) {
      event.stopPropagation()
      this.edgeDraggingService.drop(this.connector)
    }
  }
}
</script>
