// ============================================
// PROJECT DATA — single source of truth
// Edit this to add/change projects across all pages
// ============================================

export const featuredProjects = [
  {
    id: 'runic-vanguard',
    number: '01',
    title: 'Runic Vanguard',
    subtitle: 'Asymmetric Co-op / Spell-Gesture System',
    year: '2026',
    engine: 'Unreal Engine 5 · Blueprint',
    role: 'Designer & Developer',
    tagline: 'A vow rendered as mechanics.',
    poster: '/runic-vanguard-poster-fallback.jpg',
    posterWebp:
      '/runic-vanguard-poster-600.webp 600w, /runic-vanguard-poster-1200.webp 1200w',
    posterWidth: 1600,
    posterHeight: 2399,
    trailer: {
      src: '/videos/runic-vanguard-trailer.mp4',
      poster: '/videos/runic-vanguard-trailer-poster.webp',
      width: 1920,
      height: 1080,
    },
    bossLoopVideo: {
      src: '/videos/runic-vanguard-boss-loop.mp4',
      poster: '/videos/runic-vanguard-boss-loop-poster.webp',
      width: 1280,
      height: 720,
    },
    showSpellAnatomy: true,
    showBossLoop: true,
    showPatrolAI: true,
    showWaveSpawner: true,
    logline:
      'Two players bound by an ancient pact — one wields the blade, the other draws magic from forbidden geometry. A spell-gesture system built on a 3×3 grid where every line is intention made manifest.',
    systems: [
      { label: 'Spell Gesture Grid', detail: '3×3 dot matrix · OnPaint line rendering · DataTable pattern matching' },
      { label: 'Gameplay Ability System', detail: 'GAS integration · rune charge resource gate · elemental binding' },
      { label: 'Room Encounter Design', detail: 'Wave spawn director · patrol/chase AI · Blueprint Interface tagging' },
      { label: 'Boss Encounter Design', detail: 'Four-phase teaching loop · elemental escalation · delayed-punishment & risk-economy mechanics · 25% HP phase gates' },
    ],
    media: [],
  },
  {
    id: 'sakura',
    number: '02',
    title: 'Sakura',
    subtitle: 'Niagara project',
    year: '2026',
    engine: 'Unreal Engine 5 · Niagara',
    role: 'VFX & Technical Designer',
    tagline: 'The wind is never drawn — only what it moves.',
    poster: '/sakura-poster-fallback.jpg',
    posterWebp: '/sakura-poster-1200.webp 1200w, /sakura-poster-2000.webp 2000w',
    posterWidth: 2000,
    posterHeight: 894,
    logline:
      'A riverside at dusk where every cherry petal is its own small state machine. Petals fall, settle on grass or water, drift down the channel, part around a passing boat, and lift again when a gust front sweeps through — all simulated on the GPU in a single Niagara system, driven by one custom HLSL module.',
    petalStateMachine: {
      title: 'Four states, one wind.',
      videoTitle: 'Sakura — Niagara showcase',
      video: {
        src: '/videos/sakura-showcase.mp4',
        poster: '/videos/sakura-showcase-poster.webp',
        width: 1920,
        height: 1080,
      },
      // Diagram nodes; `code` is the State value inside SP_PedalState
      states: [
        { id: 'falling', code: 0, name: 'Falling' },
        { id: 'grounded', code: 1, name: 'Grounded' },
        { id: 'drifting', code: 2, name: 'Drifting' },
        { id: 'airborne', code: 3, name: 'Airborne' },
      ],
      // Arrow labels, keyed "from>to"
      transitions: {
        'falling>airborne': 'caught by gust',
        'falling>grounded': 'lands on grass',
        'falling>drifting': 'lands on water',
        'grounded>airborne': 'lifts',
        'airborne>grounded': 'settles',
        'drifting>airborne': 'lifts',
        'airborne>drifting': 'settles',
        'drifting>grounded': 'reaches shore',
      },
      // Cards; `startSec` is where clicking jumps the showcase video
      behaviors: [
        {
          state: 'falling',
          name: 'Release',
          timestamp: '00:00',
          startSec: 0,
          mechanic: 'Gravity · curl noise · drag · per-petal tumble rate',
          intent:
            'A petal leaving the tree has one job: land. It settles on the first surface it reaches — grass or water — and becomes something else.',
        },
        {
          state: 'drifting',
          name: 'Current',
          timestamp: '00:08',
          startSec: 8,
          mechanic: 'Channel direction from two extra height samples · eases around bends · nudged mid-channel',
          intent:
            'No spline, no flow map. The riverbed itself tells each petal which way is downstream — sloped banks steer it, flat water lets it carry on. Reaching the shore turns it into a ground petal.',
        },
        {
          state: 'grounded',
          name: 'Rest',
          timestamp: '00:16',
          startSec: 16,
          mechanic: 'Pinned in place · aligned to the slope normal (distance field, landscape fallback)',
          intent:
            'Resting petals are not dead particles. They lie flush against the slope they landed on — and every one of them is still listening for wind.',
        },
        {
          state: 'airborne',
          name: 'Gust',
          timestamp: '00:22',
          startSec: 22,
          mechanic: 'Travelling gust front · 150 / 600 / 1200 cm profile · staggered lift thresholds · vortex ring at 0.6R',
          intent:
            'Wind is a front that sweeps the scene, not a switch. Each petal needs a different gust strength to let go, so the ground lifts in a ripple instead of all at once — and petals settle only once the air has passed.',
        },
        {
          state: 'drifting',
          name: 'Wake',
          timestamp: '00:26',
          startSec: 26,
          mechanic: 'Elliptical push zone, 3× longer along the hull · minimum outward speed, never braking',
          intent:
            'The boat parts the petals instead of ploughing through them. The push only guarantees a minimum outward speed, so petals already moving away keep their own momentum.',
        },
      ],
      footnote:
        'A fifth state, Placed, snaps hand-dressed petals onto the surface below them on their first frame — set dressing that obeys the same rules.',
      quote:
        'Every rule here is about letting go at the right moment: when to land, when to lift, when to stop steering and let the river decide.',
    },
    systems: [
      {
        label: 'Petal State Machine',
        detail: 'Niagara Scratch Pad module · custom HLSL · five states (falling, grounded, drifting, airborne, placed) · stable per-petal randoms from the spawn seed, so nothing jitters',
      },
      {
        label: 'Wind Front & Vortex',
        detail: 'Gust as a travelling front, not a global force · ramp / hold / fade over 150 / 600 / 1200 cm · staggered lift thresholds · vortex pulls petals onto a 0.6R ring and lifts them up to 6 m',
      },
      {
        label: 'River Drift & Boat Wake',
        detail: 'Channel direction from landscape height samples · smoothed turning and mid-channel pull · elliptical boat zone pushes petals aside without ever slowing them',
      },
      {
        label: 'Surface Response & Direction',
        detail: 'Landscape + distance-field sampling · grounded petals align to the slope with quaternions, water petals yaw only · Sequencer drives the wind front and vortex strength for the showcase',
      },
    ],
    credits: [
      { label: 'Niagara system & HLSL', value: 'Original work' },
      { label: 'Materials', value: 'Petal, river, boat wake, stylized sky, landscape blend — original work' },
      { label: 'Environment art', value: 'Asian Town and Cherry Tree asset packs, via Fab' },
      { label: 'Music', value: '“Merry Christmas Mr. Lawrence” — Ryuichi Sakamoto' },
    ],
    media: [],
  },
  {
    id: 'planet-generator',
    number: '03',
    title: 'Planet Generator',
    subtitle: 'Procedural Worlds / Percentage-Driven Terrain',
    year: '2026',
    role: 'Designer & Developer',
    tagline: 'Every slider is a share of the world, not a magic number.',
    // Rendered from the web build itself (seed 1337, default sliders).
    poster: '/planet-generator-poster-fallback.jpg',
    posterWebp:
      '/planet-generator-poster-1200.webp 1200w, /planet-generator-poster-2000.webp 2000w',
    posterWidth: 2000,
    posterHeight: 894,
    showPlanetGenerator: true,
    logline:
      'A procedural planet built from layered gradient noise — continents, ridged mountain ranges, rolling hills, inland lakes and a dozen biomes sorted by temperature and moisture. It runs live in the browser below: drag any slider and the world is rebuilt from the same seed, then export the result as a mesh.',
    systems: [
      {
        label: 'Percentage-Driven Thresholds',
        detail:
          'Each noise layer is divided by its own standard deviation, then a probit curve turns a slider percentage into a threshold · "Ocean 60%" covers ~60% of the sphere, and mountains, hills, lakes, forest and desert are shares of the land that remains',
      },
      {
        label: 'Layered Height Function',
        detail:
          '5-octave fbm continents · ridged multifractal mountains behind their own mask · hills kept off the ranges · lakes carved into high interior land · sea held flat at radius 1',
      },
      {
        label: 'Biome Classification',
        detail:
          'Temperature from latitude, altitude and noise · moisture from its own fbm · ten ordered rules, from savanna and grassland through forest, taiga, desert and beach to rock, peaks and polar snow',
      },
      {
        label: 'Real-Time Build',
        detail:
          'React Three Fiber · relief computed in a Web Worker on a cube-sphere welded before displacement, so seams never crack · biome colour evaluated per pixel by a GLSL twin of the same formula, sharp at any zoom · OBJ export with vertex colours',
      },
    ],
    media: [],
  },
]