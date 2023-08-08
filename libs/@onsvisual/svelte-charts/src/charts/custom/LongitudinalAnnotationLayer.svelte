<script>
  import { getContext } from 'svelte';
  import { fade } from 'svelte/transition';

  const { data, x, y, xDomain, xScale, yScale, xRange, yRange, custom } =
    getContext('LayerCake');

  $: show_longitudinal_annotation_layer = $custom.longitudinal_annotation_layer;
</script>

{#if show_longitudinal_annotation_layer}
  <div
    class="label"
    style="
  left: 40%; 
  width: 20%;
  height: 100%;
      background-color:blue; 
      opacity:0.5;
    "
    transition:fade={{ delay: 0, duration: 300 }}
  />
{/if}

<style>
  .label {
    position: absolute;
    /* transform: translate(-0%, -0%) translateY(1px); */
  }
</style>
