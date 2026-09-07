const { PI, cos, sin, sqrt } = Math

export const GLOBE_RADIUS = 0.8

function finiteOr(value, fallback) {
  return Number.isFinite(value) ? value : fallback
}

function nonNegative(value, fallback) {
  return Math.max(0, finiteOr(value, fallback))
}

function clamp01(value, fallback) {
  return Math.min(1, Math.max(0, finiteOr(value, fallback)))
}

export function latLonTo3D([lat, lon]) {
  const latRad = (lat * PI) / 180
  const lonRad = (lon * PI) / 180 - PI
  const cosLat = cos(latRad)
  return [-cosLat * cos(lonRad), sin(latRad), cosLat * sin(lonRad)]
}

export function resolveArcOptions(arc, defaults) {
  return {
    height: nonNegative(arc.height, defaults.arcHeight),
    width: nonNegative(arc.width, defaults.arcWidth),
    progress: clamp01(arc.progress, 1),
    anchorProgress: clamp01(arc.anchorProgress, 0.5),
  }
}

function normalize(vector) {
  const length = sqrt(
    vector[0] * vector[0] +
      vector[1] * vector[1] +
      vector[2] * vector[2],
  )
  if (length < 0.000001) return [0, 1, 0]
  return vector.map((value) => value / length)
}

function orthogonalDirection(vector) {
  const axis = Math.abs(vector[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]
  return normalize([
    vector[1] * axis[2] - vector[2] * axis[1],
    vector[2] * axis[0] - vector[0] * axis[2],
    vector[0] * axis[1] - vector[1] * axis[0],
  ])
}

function scale(vector, amount) {
  return vector.map((value) => value * amount)
}

function quadraticBezier(from, midpoint, to, progress) {
  const inverse = 1 - progress
  return [0, 1, 2].map(
    (index) =>
      inverse * inverse * from[index] +
      2 * inverse * progress * midpoint[index] +
      progress * progress * to[index],
  )
}

export function pointOnArc(arc, progress, defaults) {
  const options = resolveArcOptions(arc, defaults)
  const fromDirection = latLonTo3D(arc.from)
  const toDirection = latLonTo3D(arc.to)
  const midpointSum = fromDirection.map(
    (value, index) => value + toDirection[index],
  )
  const midpointLength = sqrt(
    midpointSum[0] * midpointSum[0] +
      midpointSum[1] * midpointSum[1] +
      midpointSum[2] * midpointSum[2],
  )
  const midpointDirection =
    midpointLength > 0.001
      ? midpointSum.map((value) => value / midpointLength)
      : orthogonalDirection(fromDirection)
  const endpointRadius = GLOBE_RADIUS + defaults.markerElevation
  const midpointRadius =
    GLOBE_RADIUS + options.height + defaults.markerElevation

  return quadraticBezier(
    scale(fromDirection, endpointRadius),
    scale(midpointDirection, midpointRadius),
    scale(toDirection, endpointRadius),
    clamp01(progress, options.anchorProgress),
  )
}

export function createArcInstanceData(arcs, defaults) {
  const arcData = new Float32Array(arcs.length * 13)

  arcs.forEach((arc, index) => {
    const options = resolveArcOptions(arc, defaults)
    arcData.set(
      [
        ...latLonTo3D(arc.from),
        ...latLonTo3D(arc.to),
        options.height + defaults.markerElevation,
        options.width * 0.005,
        ...(arc.color || [0, 0, 0]),
        arc.color ? 1 : 0,
        options.progress,
      ],
      index * 13,
    )
  })

  return arcData
}
