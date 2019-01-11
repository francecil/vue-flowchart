<template>
  <div class="tb-absolute-fill tb-rulechain-graph">
    <div
      id="tb-rulchain-canvas"
      class="ng-isolate-scope fc-canvas"
      style="width: 1000px; height: 653px;"
    >
      <svg
        width="100%"
        height="100%"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker
            id="arrow"
            markerUnits="strokeWidth"
            markerWidth="12"
            markerHeight="12"
            viewBox="0 0 12 12"
            refX="6"
            refY="6"
            orient="auto"
          >
            <path
              d="M2,2 L10,6 L2,10 L6,6 L2,2"
              style="fill: #000000;"/>
          </marker>
        </defs>

        <line
          x1="0"
          y1="0"
          x2="200"
          y2="50"
          stroke="red"
          stroke-width="2"
          marker-end="url(#arrow)"/>

        <path
          d="M20,70 T80,100 T160,80 T200,90"
          fill="white"
          stroke="red"
          stroke-width="2"
          marker-start="url(#arrow)"
          marker-mid="url(#arrow)"
          marker-end="url(#arrow)"
        />
      </svg>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'test'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* eslint-disable */
.tb-absolute-fill {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.fc-canvas {
  background-size: 25px 25px;
  background-image: linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.1) 1px,
      transparent 0
    ),
    linear-gradient(180deg, rgba(0, 0, 0, 0.1) 1px, transparent 0);
  /* background-color: transparent; */
}
/* background-color: transparent; */
.fc-edge {
  outline: none;
  stroke: gray;
  stroke-width: 4;
  fill: transparent;
  transition: stroke-width 0.2s;
}
</style>
