<!-- 
# ============================================================================ #
# <script>
 -->
<script>
  import MyChart from './components/layer-cake/MyChart.svelte';

  let selection = {
    options: ['apples', 'bananas', 'cherries', 'dates'],
    selected: ['apples'],
  };
</script>

<!-- 
# ============================================================================ #
# <markup>
 -->

<div class="stickDev">
  {#each selection.selected as select}
    {select}
  {/each}
</div>
<div class="controls small">
  {#each selection.options as option}
    <label
      ><input type="radio" bind:group={selection.selected} value={option} />
      {option}</label
    >
  {/each}
</div>
<MyChart {selection} />

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
