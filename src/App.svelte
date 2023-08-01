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
  import { LineChart } from '@onsvisual/svelte-charts';

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
  onMount(() => {
    idPrev = { ...id };
  });
  console.log(id);

  // Scroll Updater
  function runActions(codes = []) {
    //// Code to run Scroller actions when new caption IDs come into view
    console.log(
      'runActionsrunActionsrunActionsrunActionsrunActionsrunActionsrunActions'
    );
    codes.forEach((code) => {
      if (id[code] != idPrev[code]) {
        if (actions[code][id[code]]) {
          actions[code][id[code]]();
        }
        idPrev[code] = id[code];
      }
    });
  }
  $: {
    // Run above code when 'id' object changes
    if (id) {
      runActions(Object.keys(actions));
    }
  }
  // # ============================================================================ #
  // 5. Project Configs
  // THese will change across projects

  // # ============================================================================ #
  //   5.1 Scrolly actions
  let yKey = 'cherries';
  let data;
  let dataKey;
  let actions = {
    chart: {
      chart01: () => {
        dataKey = data;
        yKey = 'cherries';
      },
      chart02: () => {
        dataKey = data;
        yKey = 'apples';
      },
      chart03: () => {
        dataKey = data;
        yKey = 'apples';
      },
    },
  };

  // # ============================================================================ #
  //   5.4 State

  // # ============================================================================ #
  //   5.5 Initialisation code (get data)

  getData(`./data/data_line_wide.csv`).then((arr) => {
    data = arr;
    dataKey = arr;
  });

  console.log('Original Data');
  console.log(data);
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
</Section>

<Divider />

<!-- 
  # ============================================================================ #
  #  Scrolly 1
-->

<Scroller {threshold} bind:id={id['chart']} splitscreen={true}>
  <div slot="background">
    <figure>
      <div class="col-wide height-full">
        <div class="chart">
          {#if dataKey && id && yKey}
            <LineChart
              data={dataKey}
              height={500}
              xKey="year"
              area={false}
              {yKey}
              areaOpacity={0.3}
              {animation}
            />
          {/if}
        </div>
      </div>
    </figure>
  </div>

  <div slot="foreground">
    <section data-id="chart01">
      <div class="col-medium">
        <p>
          Here is value of <strong>apples</strong> over time in USD.
        </p>
      </div>
    </section>
    <section data-id="chart02">
      <div class="col-medium">
        <p>
          Here is value of <strong>cherries</strong> over time in USD. (<em
            >This transition demostrate changing data across actions</em
          >)
        </p>
      </div>
    </section>
    <section data-id="chart03">
      <div class="col-medium">
        <p>Modification of x-axis to zoom in on years of interest</p>
      </div>
    </section>
  </div>
</Scroller>

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