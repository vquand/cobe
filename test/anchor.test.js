import assert from 'node:assert/strict'
import test from 'node:test'

import { createAnchorManager } from '../src/anchor.js'

function createStyle() {
  const properties = new Map()
  return {
    cssText: '',
    left: '',
    top: '',
    setProperty(name, value) {
      properties.set(name, value)
    },
    getPropertyValue(name) {
      return properties.get(name) ?? ''
    },
    removeProperty(name) {
      properties.delete(name)
    },
  }
}

function createElement() {
  return {
    style: createStyle(),
    textContent: '',
    removed: false,
    remove() {
      this.removed = true
    },
  }
}

function installFakeDocument() {
  const styleElements = []
  const previousDocument = globalThis.document
  globalThis.document = {
    head: {
      append(element) {
        styleElements.push(element)
      },
    },
    createElement,
  }
  return () => {
    globalThis.document = previousDocument
  }
}

test('publishes marker and arc positions on the globe host for CSS fallbacks', () => {
  const restoreDocument = installFakeDocument()
  const host = { style: createStyle() }
  const wrapper = {
    parentElement: host,
    children: [],
    append(element) {
      this.children.push(element)
    },
  }

  try {
    const anchors = createAnchorManager(wrapper)
    anchors.m(
      [{ id: 'item-1', location: [10, 20] }],
      () => ({ x: 0.25, y: 0.75, visible: true }),
    )
    anchors.a(
      [{ id: 'leg-1', from: [10, 20], to: [30, 40] }],
      () => ({ x: 0.5, y: 0.4, visible: true }),
    )

    assert.equal(host.style.getPropertyValue('--cobe-item-1-x'), '25%')
    assert.equal(host.style.getPropertyValue('--cobe-item-1-y'), '75%')
    assert.equal(host.style.getPropertyValue('--cobe-arc-leg-1-x'), '50%')
    assert.equal(host.style.getPropertyValue('--cobe-arc-leg-1-y'), '40%')

    anchors.m([], () => null)
    anchors.a([], () => null)

    assert.equal(host.style.getPropertyValue('--cobe-item-1-x'), '')
    assert.equal(host.style.getPropertyValue('--cobe-arc-leg-1-x'), '')
    anchors.r()
  } finally {
    restoreDocument()
  }
})

test('skips an overlay anchor when its projection is unavailable', () => {
  const restoreDocument = installFakeDocument()
  const wrapper = {
    parentElement: { style: createStyle() },
    append() {},
  }

  try {
    const anchors = createAnchorManager(wrapper)
    assert.doesNotThrow(() => {
      anchors.a(
        [{ id: 'antipodal', from: [0, 0], to: [0, 180] }],
        () => null,
      )
    })
    anchors.r()
  } finally {
    restoreDocument()
  }
})
