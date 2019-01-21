
<template>
  <div
    :draggable="true"
    :class="flowchartConstants.magnetClass">
    <slot/>
  </div>
</template>
<script>
// 放置connector的容器
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
