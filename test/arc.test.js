import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createArcInstanceData,
  pointOnArc,
  resolveArcOptions,
} from '../src/geometry.js'

const DEFAULTS = {
  arcHeight: 0.25,
  arcWidth: 0.5,
  markerElevation: 0.02,
}

function assertClose(actual, expected) {
  assert.ok(
    Math.abs(actual - expected) < 1e-6,
    `expected ${actual} to be within 1e-6 of ${expected}`,
  )
}

test('encodes independent style and progress for every arc', () => {
  const arcs = [
    {
      from: [10, 20],
      to: [30, 40],
      height: 0.4,
      width: 0.8,
      progress: 0.25,
    },
    {
      from: [30, 40],
      to: [35, 50],
    },
    {
      from: [35, 50],
      to: [45, 60],
      height: 0,
      width: 0,
      progress: 0,
    },
  ]

  const data = createArcInstanceData(arcs, DEFAULTS)

  assert.equal(data.length, 39)
  assertClose(data[6], 0.42)
  assertClose(data[7], 0.004)
  assertClose(data[12], 0.25)
  assertClose(data[19], 0.27)
  assertClose(data[20], 0.0025)
  assert.equal(data[25], 1)
  assertClose(data[32], 0.02)
  assert.equal(data[33], 0)
  assert.equal(data[38], 0)
})

test('clamps progress values and defaults the projected anchor to the midpoint', () => {
  assert.deepEqual(
    resolveArcOptions({ progress: 2, anchorProgress: -1 }, DEFAULTS),
    {
      height: 0.25,
      width: 0.5,
      progress: 1,
      anchorProgress: 0,
    },
  )

  assert.deepEqual(resolveArcOptions({}, DEFAULTS), {
    height: 0.25,
    width: 0.5,
    progress: 1,
    anchorProgress: 0.5,
  })
})

test('projects stable finite points for antipodal arcs', () => {
  const arc = {
    from: [0, 0],
    to: [0, 180],
    height: 0.3,
  }

  const start = pointOnArc(arc, 0, DEFAULTS)
  const midpoint = pointOnArc(arc, 0.5, DEFAULTS)
  const end = pointOnArc(arc, 1, DEFAULTS)

  assert.ok(start.every(Number.isFinite))
  assert.ok(midpoint.every(Number.isFinite))
  assert.ok(end.every(Number.isFinite))
  assert.notDeepEqual(midpoint, [0, 0, 0])
})
