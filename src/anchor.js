// CSS Anchor Element Management for COBE v2
// Creates invisible anchor elements for DOM positioning of popups/tooltips

/**
 * Create and manage anchor elements for markers and arcs
 * @param {HTMLElement} wrapper - The wrapper element containing the canvas
 * @returns {{ m: Function, a: Function, r: Function }}
 */
export function createAnchorManager(wrapper) {
  const markerAnchors = {}
  const arcAnchors = {}
  const visibilityVars = {}
  const host = wrapper.parentElement || wrapper

  // Create a style tag for :root CSS variables
  const styleEl = document.createElement('style')
  document.head.append(styleEl)

  function setPosition(name, position) {
    host.style.setProperty(name + '-x', position.x * 100 + '%')
    host.style.setProperty(name + '-y', position.y * 100 + '%')
  }

  function removePosition(name) {
    host.style.removeProperty(name + '-x')
    host.style.removeProperty(name + '-y')
  }

  function removeAnchor(anchors, key, variableName) {
    if (anchors[key]) {
      anchors[key].remove()
      delete anchors[key]
    }
    delete visibilityVars['--cobe-visible-' + variableName]
    removePosition('--cobe-' + variableName)
  }

  function updateStyleTag() {
    let vars = ''
    for (let key in visibilityVars) {
      vars += key + ':' + visibilityVars[key] + ';'
    }
    // Only rewrite the <style> when its content actually changed. Reassigning textContent
    // swaps a document-level stylesheet, which invalidates style and layout for the whole
    // page; doing it every frame is expensive. When the visible marker set is unchanged
    // frame to frame, skip the write.
    const next = ':root{' + vars + '}'
    if (next !== styleEl.textContent) {
      styleEl.textContent = next
    }
  }

  function updateAnchor(anchors, key, anchorName, position) {
    let anchor = anchors[key]

    if (!anchor) {
      anchor = document.createElement('div')
      anchor.style.cssText =
        'position:absolute;width:1px;height:1px;pointer-events:none;anchor-name:' +
        anchorName
      wrapper.append(anchor)
      anchors[key] = anchor
    }

    anchor.style.left = position.x * 100 + '%'
    anchor.style.top = position.y * 100 + '%'
  }

  function m(markers, project) {
    const activeKeys = {}

    for (let marker of markers) {
      const key = marker.id
      if (!key) continue

      const pos = project(marker.location)

      activeKeys[key] = 1

      if (!pos) {
        removeAnchor(markerAnchors, key, key)
        continue
      }

      updateAnchor(markerAnchors, key, `--cobe-${key}`, pos)
      setPosition('--cobe-' + key, pos)

      if (pos.visible) {
        visibilityVars['--cobe-visible-' + key] = 'N'
      } else {
        delete visibilityVars['--cobe-visible-' + key]
      }
    }

    for (const key in markerAnchors) {
      if (!activeKeys[key]) {
        removeAnchor(markerAnchors, key, key)
      }
    }
  }

  function a(arcs, project) {
    const activeKeys = {}

    for (let arc of arcs) {
      const key = arc.id
      if (!key) continue

      const pos = project(arc)

      activeKeys[key] = 1

      const variableName = 'arc-' + key

      if (!pos) {
        removeAnchor(arcAnchors, key, variableName)
        continue
      }

      updateAnchor(arcAnchors, key, `--cobe-arc-${key}`, pos)
      setPosition('--cobe-' + variableName, pos)

      if (pos.visible) {
        visibilityVars['--cobe-visible-arc-' + key] = 'N'
      } else {
        delete visibilityVars['--cobe-visible-arc-' + key]
      }
    }

    for (const key in arcAnchors) {
      if (!activeKeys[key]) {
        removeAnchor(arcAnchors, key, 'arc-' + key)
      }
    }
  }

  function r() {
    for (const key in markerAnchors) {
      removeAnchor(markerAnchors, key, key)
    }
    for (const key in arcAnchors) {
      removeAnchor(arcAnchors, key, 'arc-' + key)
    }
    styleEl.remove()
  }

  return { m, a, r, s: updateStyleTag }
}
