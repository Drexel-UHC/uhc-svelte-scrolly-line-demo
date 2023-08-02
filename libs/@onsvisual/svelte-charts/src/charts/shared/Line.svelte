<script>
  import { getContext, createEventDispatcher } from 'svelte';

  let {
    data,
    xScale,
    yScale,
    zGet,
    config,
    custom,
    x,
    y,
    r,
    xGet,
    yGet,
    rGet,
    yRange,
    rRange,
    width,
  } = getContext('LayerCake');

  const dispatch = createEventDispatcher();

  export let lineWidth = 2.5;
  export let hover = false;
  export let hovered = null;
  export let select = false;
  export let selected = null;
  export let highlighted = [];

  let coords = $custom.coords;
  let step = $custom.step;
  let idKey = $custom.idKey;
  let colorHover = $custom.colorHover ? $custom.colorHover : 'orange';
  let colorSelect = $custom.colorSelect ? $custom.colorSelect : '#206095';
  let colorHighlight = $custom.colorHighlight
    ? $custom.colorHighlight
    : '#206095';
  let type = $custom.type;
  let prevWidth = $width;
  let coord_needs_update = false;

  // Initialize coord if needed

  if (!$coords) {
    setCoords($custom.customData, $custom, $x, $y, $r, $width);
  }

  $: {
    console.log(`************* Line ${$custom.step}`);
    console.log($custom.customData);
    // const changed_data = $coords.length != $custom.customData.length;
    // coord_needs_update = changed_data;
  }

  $: {
    // console.log('REFRESH COORDS REACTIVELY');
    // setCoords($custom.customData, $custom, $x, $y, $r, $width);
  }
  let debounceTimer;
  let debounceValue = 200;
  $: {
    debouncedSetCoords($custom.customData, $custom, $x, $y, $r, $width);
  }
  // Function to make SVG path
  const makePath = (group) => {
    let path =
      'M' +
      group
        .map((d) => {
          return $xScale(d.x) + ',' + $yScale(d.y);
        })
        .join('L');
    return path;
  };

  function doHover(e, d) {
    if (hover) {
      hovered = d ? d[0][idKey] : null;
      dispatch('hover', {
        id: hovered,
        data: d,
        event: e,
      });
    }
  }

  function doSelect(e, d) {
    if (select) {
      selected = d ? d[0][idKey] : null;
      dispatch('select', {
        id: selected,
        data: d,
        event: e,
      });
    }
  }
  function setCoords(data, custom, x, y, r, width) {
    console.log(
      `///////////////  Start setCoords()  Line.svelte ${custom.step}`
    );
    console.log(`original coords`);
    console.log($coords);
    let mode = custom.mode;
    let padding = custom.padding;
    let duration = custom.animation && width == prevWidth ? custom.duration : 0;

    prevWidth = width;

    let newcoords;
    if (type == 'line') {
      newcoords = data.map((d) =>
        d.map((e) => {
          return {
            x: x(e),
            y: y(e),
          };
        })
      );
    }
    coords.set(newcoords, { duration });
    console.log(`new coords`);
    console.log(newcoords);
    console.log(`///////////////  END setCoords()  Line.svelte ${custom.step}`);
  }

  function debouncedSetCoords(data, custom, x, y, r, width) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.log(
        `///////////////  Start setCoords()  Line.svelte ${custom.step}`
      );
      console.log(`original coords`);
      console.log($coords);
      let mode = custom.mode;
      let padding = custom.padding;
      let duration =
        custom.animation && width == prevWidth ? custom.duration : 0;

      prevWidth = width;

      let newcoords;
      if (type == 'line') {
        newcoords = data.map((d) =>
          d.map((e) => {
            return {
              x: x(e),
              y: y(e),
            };
          })
        );
      }
      coords.set(newcoords, { duration });
      console.log(`new coords`);
      console.log(newcoords);
      console.log(
        `///////////////  END setCoords()  Line.svelte ${custom.step}`
      );
    }, debounceValue); // Debounce time: 200 milliseconds (adjust as needed)
  }
</script>

{#if $coords}
  <g class="line-group">
    {#each $coords as group, i}
      <path
        class="path-hover"
        d={makePath(group)}
        on:mouseover={(e) => doHover(e, $data[i])}
        on:mouseleave={(e) => doHover(e, null)}
        on:focus={(e) => doHover(e, $data[i])}
        on:blur={(e) => doHover(e, null)}
        on:click={(e) => doSelect(e, $data[i])}
      />
      <path
        class="path-line"
        d={makePath(group)}
        stroke={$config.z ? $zGet($data[i][0]) : $config.zRange[0]}
        stroke-width={lineWidth}
      />
    {/each}

    {#if idKey && (hover || selected || highlighted[0])}
      {#each $coords as group, i}
        {#if [hovered, selected, ...highlighted].includes($data[i][0][idKey])}
          <path
            class="path-overlay"
            d={makePath(group)}
            stroke={$data[i][0][idKey] == hovered
              ? colorHover
              : $data[i][0][idKey] == selected
              ? colorSelect
              : colorHighlight}
            stroke-width={lineWidth + 1.5}
          />
        {/if}
      {/each}
    {/if}
  </g>
{/if}

<style>
  path {
    fill: none;
    stroke-linejoin: round;
    stroke-linecap: round;
  }
  .path-hover {
    stroke: rgba(255, 255, 255, 0);
    stroke-width: 7;
  }
  .path-line,
  .path-overlay {
    pointer-events: none;
  }
</style>
