<template>
  <div
    :draggable="true"
    :class="flowchartConstants.magnetClass">
    <slot/>
  </div>
</template>
<script>
import flowchartConstants from '@/config/flowchart'
export default {
  props: {
  },
  data () {
    return {
      flowchartConstants: flowchartConstants
    }
  }
}
</script>
