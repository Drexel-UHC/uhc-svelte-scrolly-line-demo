<script>
  import { getContext } from 'svelte';

  const { data, x, y, xDomain, xScale, yScale, xRange, yRange, custom } =
    getContext('LayerCake');
</script>

<div
  class="label"
  style="
  left: 40%; 
  width: 20%;
  height: 100%;
      background-color:blue; 
      opacity:0.5;
    "
/>

<style>
  .label {
    position: absolute;
    /* transform: translate(-0%, -0%) translateY(1px); */
  }
</style>
