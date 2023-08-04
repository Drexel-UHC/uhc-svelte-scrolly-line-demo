<script>
  import { getContext } from 'svelte';
  import { max } from 'd3-array';

  const { data, x, y, xScale, yScale, xRange, yRange, custom } =
    getContext('LayerCake');

  let groups_all = $custom.groups_all;
  let groups_selected = $custom.groups_selected;
  let index_subset;
  let data_subset;
  $: {
    index_subset = groups_all
      .map((item, index) => (groups_selected.includes(item) ? index : -1))
      .filter((index) => index !== -1);
    data_subset = index_subset.map((index) => $data[index]);

    // console.log(`index_subset`);
    // console.log(index_subset);
    // console.log(`data_subset`);
    // console.log(data_subset);
  }
  /* --------------------------------------------
   * Title case the first letter
   */
  const cap = (val) => val.replace(/^\w/, (d) => d.toUpperCase());

  /* --------------------------------------------
   * Put the label on the highest value
   */

  $: left = (group) => {
    const x_values_all = group.map((d) => d.year);
    const xMax = Math.max(...x_values_all);
    const result = $xScale(xMax) / Math.max(...$xRange);
    console.log(`---------------- left() -------------`);
    console.log(result);
    return result;
  };

  $: top = (group) => {
    const y_values_all = group.map((d) => d.value);
    const yMax = Math.max(...y_values_all);
    const result = $yScale(yMax) / Math.max(...$yRange);
    console.log(`---------------- top() -------------`);
    console.log(result);
    return result;
  };
</script>

{#if data_subset}
  {#each data_subset as group, i}
    <div
      class="label"
      style="
      top:{top(group) * 100}%;
      left:{left(group) * 100}%;
    "
    >
      {`cap(group.key)`}
    </div>
  {/each}
{/if}

<style>
  .label {
    position: absolute;
    transform: translate(-100%, -100%) translateY(1px);
    font-size: 13px;
  }
</style>
