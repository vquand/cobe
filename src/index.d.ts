export interface Marker {
  location: [number, number]
  size: number
  color?: [number, number, number]
  id?: string
}

export interface Arc {
  from: [number, number]
  to: [number, number]
  color?: [number, number, number]
  id?: string
  /** Curve height above the globe. Overrides the global arcHeight. */
  height?: number
  /** Line width. Overrides the global arcWidth. */
  width?: number
  /** Visible portion of the arc, clamped to 0..1. Defaults to 1. */
  progress?: number
  /** Position of the bindable DOM anchor along the arc. Defaults to 0.5. */
  anchorProgress?: number
}

export interface COBEOptions {
  width: number
  height: number
  phi: number
  theta: number
  mapSamples: number
  mapBrightness: number
  mapBaseBrightness?: number
  baseColor: [number, number, number]
  markerColor: [number, number, number]
  glowColor: [number, number, number]
  markers?: Marker[]
  diffuse: number
  devicePixelRatio: number
  dark: number
  opacity?: number
  offset?: [number, number]
  scale?: number
  context?: WebGLContextAttributes

  // New in v2
  arcs?: Arc[]
  arcColor?: [number, number, number]
  arcWidth?: number
  arcHeight?: number
  markerElevation?: number
}

export interface Globe {
  update: (state: Partial<COBEOptions>) => void
  destroy: () => void
}

export default function createGlobe(
  canvas: HTMLCanvasElement,
  opts: COBEOptions,
): Globe
