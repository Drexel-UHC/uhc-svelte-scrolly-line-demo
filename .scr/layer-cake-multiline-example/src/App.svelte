<!-- 
# ============================================================================ #
# <script>
 -->
<script>
  import MyChart from './components/layer-cake/MyChart.svelte';

  let barchart1 = {
    options: ['apples', 'bananas', 'cherries', 'dates'],
    selected: 'apples',
  };
</script>

<!-- 
# ============================================================================ #
# <markup>
 -->

<div class="stickDev">
  {#each barchart1.selected as select}
    {select}
  {/each}
</div>
<div class="controls small">
  {#each barchart1.options as option}
    <label
      ><input type="radio" bind:group={barchart1.selected} value={option} />
      {option}</label
    >
  {/each}
</div>
<MyChart />

<!-- 
# ============================================================================ #
# <style>
 -->

<style>
  .controls > label {
    display: inline;
    margin-right: 8px;
  }
  .small {
    font-size: 0.8em;
  }
  .stickDev {
    position: fixed;
    bottom: 100;
    right: 0;
    background-color: white;
    padding: 10px;
  }
</style>
