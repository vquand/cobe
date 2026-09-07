[![COBE](card.png)](https://cobe.vercel.app)

<p align="center">Use any DOM element as bindable markers.<br/>CSS transitions, animations, filters, interactivity, all just work.</p>

<p align="center">High perf, zero deps, ~5KB.</p>

<p align="center">
  <video src="ideas-1_4x.mp4" poster="card.png" autoplay loop muted playsinline width="600"></video>
</p>

---

- [**Demo** and configurations](https://cobe.vercel.app)

## Quick Start

```html
<canvas
  id="cobe"
  style="width: 500px; height: 500px;"
  width="1000"
  height="1000"
></canvas>
```

```js
import createGlobe from 'cobe'

let phi = 0
const canvas = document.getElementById('cobe')

const globe = createGlobe(canvas, {
  devicePixelRatio: 2,
  width: 1000,
  height: 1000,
  phi: 0,
  theta: 0,
  dark: 0,
  diffuse: 1.2,
  scale: 1,
  mapSamples: 16000,
  mapBrightness: 6,
  baseColor: [0.3, 0.3, 0.3],
  markerColor: [1, 0.5, 1],
  glowColor: [1, 1, 1],
  offset: [0, 0],
  markers: [
    { location: [37.7595, -122.4367], size: 0.03 },
    { location: [40.7128, -74.006], size: 0.1, color: [1, 0, 0] }, // custom color
  ],
  arcs: [
    {
      from: [37.7595, -122.4367],
      to: [40.7128, -74.006],
      color: [1, 0.5, 0.5], // custom color (optional)
    },
  ],
  arcColor: [1, 0.5, 1],
  arcWidth: 0.5,
  arcHeight: 0.3,
  markerElevation: 0.02,
})

let animationFrame
function animate() {
  phi += 0.01
  globe.update({ phi })
  animationFrame = requestAnimationFrame(animate)
}
animate()

// When the globe is no longer needed:
// cancelAnimationFrame(animationFrame)
// globe.destroy()
```

## Arcs

Arcs connect two locations on the globe:

```js
arcs: [
  {
    from: [37.7595, -122.4367],
    to: [35.6762, 139.6503],
    color: [1, 0.5, 0.5], // optional, uses arcColor if not set
    height: 0.3,           // optional, uses arcHeight if not set
    width: 0.5,            // optional, uses arcWidth if not set
    progress: 1,           // optional visible portion, clamped to 0..1
    anchorProgress: 0.5,   // optional DOM anchor position, clamped to 0..1
  },
]
```

Each array entry is rendered independently. A route with multiple legs should
be passed as multiple arcs sharing endpoints. Per-arc `height`, `width`, and
`color` can distinguish the legs without putting application-specific route
semantics into COBE.

To reveal an arc and move its bindable DOM element along the same curve, update
`progress` and `anchorProgress` together:

```js
const activeArc = {
  id: 'active-leg',
  from: [37.7595, -122.4367],
  to: [35.6762, 139.6503],
  height: 0.3,
  progress: 0,
  anchorProgress: 0,
}

function renderProgress(progress) {
  globe.update({
    arcs: [{
      ...activeArc,
      progress,
      anchorProgress: progress,
    }],
  })
}
```

## Bindable Markers & Arcs

Markers and arcs can have an `id` property for [CSS Anchor Positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning):

```js
markers: [
  { location: [37.7595, -122.4367], size: 0.03, id: 'sf' },
],
arcs: [
  { from: [37.7595, -122.4367], to: [35.6762, 139.6503], id: 'sf-tokyo' },
]
```

```css
.marker-label {
  position: absolute;
  position-anchor: --cobe-sf;
  bottom: anchor(top);
  left: anchor(center);
  translate: -50% 0;
  opacity: var(--cobe-visible-sf, 0);
  filter: blur(calc((1 - var(--cobe-visible-sf, 0)) * 8px));
  transition: opacity 0.3s, filter 0.3s;
}

.arc-label {
  position: absolute;
  position-anchor: --cobe-arc-sf-tokyo;
  bottom: anchor(top);
  left: anchor(center);
  translate: -50% 0;
  opacity: var(--cobe-visible-arc-sf-tokyo, 0);
}

/* Fallback for browsers without CSS Anchor Positioning. */
@supports not (anchor-name: --x) {
  .marker-label {
    left: var(--cobe-sf-x);
    bottom: calc(100% - var(--cobe-sf-y));
  }

  .arc-label {
    left: var(--cobe-arc-sf-tokyo-x);
    bottom: calc(100% - var(--cobe-arc-sf-tokyo-y));
  }
}
```

The globe exposes:
- `--cobe-{id}` / `--cobe-arc-{id}` — CSS anchor names for positioning
- `--cobe-{id}-x` / `--cobe-{id}-y` — marker position percentages on the canvas parent
- `--cobe-arc-{id}-x` / `--cobe-arc-{id}-y` — arc anchor position percentages on the canvas parent
- `--cobe-visible-{id}` / `--cobe-visible-arc-{id}` — visibility variable (0 when behind globe, 1 when visible)

Overlay elements using the X/Y fallback variables must be descendants of the
canvas parent so the scoped variables inherit correctly. Use the visibility
variable to drive opacity, blur, scale, or any CSS property for smooth
transitions.

## Acknowledgment

This project is inspired & based on the great work of:

- [Spherical Fibonacci Mapping](https://dl.acm.org/doi/10.1145/2816795.2818131), Benjamin Keinert et al.
- https://www.shadertoy.com/view/lllXz4, Inigo Quilez
- https://github.blog/2020-12-21-how-we-built-the-github-globe
- https://github.com/vaneenige/phenomenon
- https://github.com/evanw/glslx

World map asset from:

- https://de.wikipedia.org/wiki/Datei:World_map_blank_without_borders.svg

## License

The MIT License.
