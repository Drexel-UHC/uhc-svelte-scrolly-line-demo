<!-- 
  # ============================================================================ #
  #  ............... script ...............
-->

<script>
  // # ============================================================================ #
  // 1. Core imports
  import { setContext, onMount } from 'svelte';
  import { getMotion } from './utils.js';
  import { themes } from './config.js';
  import data from './data/data_line.js';
  import UHCHeader from './layout/UHCHeader.svelte';
  import UHCFooter from './layout/UHCFooter.svelte';
  import Header from './layout/Header.svelte';
  import Section from './layout/Section.svelte';
  import Media from './layout/Media.svelte';
  import Scroller from './layout/Scroller.svelte';
  import Filler from './layout/Filler.svelte';
  import Divider from './layout/Divider.svelte';
  import Toggle from './ui/Toggle.svelte';
  import Arrow from './ui/Arrow.svelte';

  // # ============================================================================ #
  // 2. Project sepecific imports
  import { getData, setColors, getBreaks, getColor } from './utils.js';
  import { colors } from './config.js';
  import { ScatterChart, LineChart } from '@onsvisual/svelte-charts';

  // # ============================================================================ #
  // 3. Core config
  // Set theme globally (options are 'light', 'dark' or 'lightblue')
  let theme = 'light';
  setContext('theme', theme);
  setColors(themes, theme);

  // # ============================================================================ #
  // 4. Scroller Configs
  //  - These dont change much between projects.
  //// Config
  const threshold = 0.65;

  //// State
  let animation = getMotion(); // Set animation preference depending on browser preference
  let hover = true;
  let hovered = null;
  let hoveredScatter = null;
  let select = true;
  let selected = null;
  let selectedScatter = null;
  let id = {}; // Object to hold visible section IDs of Scroller components
  let idPrev = {}; // Object to keep track of previous IDs, to compare for changes
  let barchart1 = {
    options: ['apples', 'bananas', 'cherries', 'dates'],
    selected: 'apples',
  };
  let barchart2 = {
    options: ['stacked', 'comparison', 'barcode', 'grouped'],
    selected: 'stacked',
  };
  let linechart = {
    stacked: true,
    line: true,
    area: true,
    transparent: true,
  };
  let beeswarm = {
    yKey: false,
    zKey: false,
    rKey: true,
  };
  const doHover = (e) => (hovered = e.detail.id);
  const doSelect = (e) => (selected = e.detail.id);
  const doHoverScatter = (e) => (hoveredScatter = e.detail.id);
  const doSelectScatter = (e) => (selectedScatter = e.detail.id);

  //// Code to run Scroller actions when new caption IDs come into view
  function runActions(codes = []) {
    codes.forEach((code) => {
      if (id[code] != idPrev[code]) {
        if (actions[code][id[code]]) {
          actions[code][id[code]]();
        }
        idPrev[code] = id[code];
      }
    });
  }
  $: id && runActions(Object.keys(actions)); // Run above code when 'id' object changes

  // # ============================================================================ #
  // 5. Project Configs
  // THese will change across projects

  // # ============================================================================ #
  //   5.1 Scrolly actions
  let actions = {
    chart: {
      chart01: () => {
        xKey = 'area';
        yKey = null;
        zKey = null;
        rKey = null;
        explore = false;
      },
    },
  };
  // # ============================================================================ #
  //   5.2 Constants

  // # ============================================================================ #
  //   5.3 Data

  // # ============================================================================ #

  // # ============================================================================ #
  //   5.4 State

  // # ============================================================================ #
  //   5.5 Initialisation code
</script>

<!-- 
  # ============================================================================ #
  #  ............... markup ...............
-->

<!-- 
  # ============================================================================ #
  #  Header
-->

<UHCHeader filled={true} center={false} />

<Header
  bgcolor="#206095"
  bgfixed={true}
  theme="dark"
  center={false}
  short={true}
>
  <h1>UHC Svelte Scrolly Template</h1>
  <p class="text-big" style="margin-top: 5px">
    Epsom Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sequi
    voluptate sed quisquam inventore quia odio illo maiores cum enim, aspernatur
    laboriosam amet ipsam, eligendi optio dolor doloribus minus! Dicta, laborum?
  </p>
  <p style="margin-top: 20px">DD MMM YYYY</p>
  <p>
    <Toggle
      label="Animation {animation ? 'on' : 'off'}"
      mono={true}
      bind:checked={animation}
    />
  </p>
  <div style="margin-top: 90px;">
    <Arrow color="white" {animation}>Scroll to begin</Arrow>
  </div>
</Header>
<!-- 
  # ============================================================================ #
  #  Intro
-->
<Section>
  <h2>Line Chart</h2>
  <p style="padding-bottom: 1rem;">
    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Impedit commodi
    aperiam autem doloremque, sapiente est facere quidem praesentium expedita
    rerum reprehenderit esse fuga, animi pariatur itaque ullam optio minima eum?
  </p>
  <LineChart
    data={data.filter((d) => d.group == barchart1.selected)}
    xKey="year"
    yKey="value"
    areaOpacity={0.3}
    title=""
    {animation}
  >
    <div slot="options" class="controls small">
      {#each barchart1.options as option}
        <label
          ><input type="radio" bind:group={barchart1.selected} value={option} />
          {option}</label
        >
      {/each}
    </div>
  </LineChart>
</Section>

<Divider />

<!-- 
  # ============================================================================ #
  #  Scrolly 1
-->

<!-- <Scroller {threshold} bind:id={id['chart']} splitscreen={true}>
  <div slot="background">
    <figure>
      <div class="col-wide height-full">
        {#if data.district.indicators && metadata.region.lookup}
          <div class="chart">
            <ScatterChart
              height="calc(100vh - 150px)"
              data={data.district.indicators.map((d) => ({
                ...d,
                parent_name: metadata.region.lookup[d.parent].name,
              }))}
              colors={explore ? ['lightgrey'] : colors.cat}
              {xKey}
              {yKey}
              {zKey}
              {rKey}
              idKey="code"
              labelKey="name"
              r={[3, 10]}
              xScale="log"
              xTicks={[10, 100, 1000, 10000]}
              xFormatTick={(d) => d.toLocaleString()}
              xSuffix=" sq.km"
              yFormatTick={(d) => d.toLocaleString()}
              legend={zKey != null}
              labels
              select={explore}
              selected={explore ? selected : null}
              hover
              {hovered}
              highlighted={explore ? chartHighlighted : []}
              colorSelect="#206095"
              colorHighlight="#999"
              overlayFill
              {animation}
            />
          </div>
        {/if}
      </div>
    </figure>
  </div>

  <div slot="foreground">
    <section data-id="chart01">
      <div class="col-medium">
        <p>
          This chart shows the <strong>area in square miles</strong> of each county
          in the North East census region. Each circle represents one county. The
          scale is logarithmic.
        </p>
      </div>
    </section>
    <section data-id="chart02">
      <div class="col-medium">
        <p>
          The radius of each circle shows the <strong>total population</strong> of
          the county.
        </p>
      </div>
    </section>
    <section data-id="chart03">
      <div class="col-medium">
        <p>
          The vertical axis shows the <strong>density</strong> of the county in people
          per square miles.
        </p>
      </div>
    </section>
    <section data-id="chart04">
      <div class="col-medium">
        <p>
          The colour of each circle shows the <strong>state</strong> that the county
          is within.
        </p>
      </div>
    </section>
  </div>
</Scroller> -->

<Divider />

<!-- 
  # ============================================================================ #
  #  Conclusion
-->

<Section>
  <h2>Conclusions</h2>
  <p>
    Epsom Lorem ipsum dolor sit amet consectetur adipisicing elit. A magni
    ducimus amet repellendus cupiditate? Ad optio saepe ducimus. At eveniet ad
    delectus enim voluptatibus. Quaerat eligendi eaque corrupti possimus
    molestiae?
  </p>
</Section>

<!-- 
  # ============================================================================ #
  #  Footer
-->

<UHCFooter />

<!-- 
  # ============================================================================ #
  #  ............... style ...............
-->
<style>
  /* Styles specific to elements within the demo */
  :global(svelte-scroller-foreground) {
    pointer-events: none !important;
  }
  :global(svelte-scroller-foreground section div) {
    pointer-events: all !important;
  }
  select {
    max-width: 350px;
  }
  .chart {
    margin-top: 45px;
    width: calc(100% - 5px);
  }
  .chart-full {
    margin: 0 20px;
  }
  .chart-sml {
    font-size: 0.85em;
  }
  /* The properties below make the media DIVs grey, for visual purposes in demo */
  .media {
    background-color: #f0f0f0;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-flow: column;
    flex-flow: column;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    text-align: center;
    color: #aaa;
  }
</style>
