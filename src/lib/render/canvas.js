import { animationEvents } from '../stores/gameState.js'

export function initGameCanvas(canvas, getState, dispatch, uiStores) {
  const ctx = canvas.getContext('2d')
  let tileSize = 100
  let canvasWidth = 0
  let canvasHeight = 0
  const effects = []
  let frameId = null
  let resizeObserver = null

  function tileCenter(pos) {
    return {
      x: pos.x * tileSize + tileSize / 2,
      y: pos.y * tileSize + tileSize / 2,
    }
  }

  function addMeleeEffect(from, to) {
    effects.push({
      kind: 'melee',
      from,
      to,
      start: performance.now(),
      duration: 180,
    })
  }

  function addMagicEffect(from, to) {
    effects.push({
      kind: 'magic',
      from,
      to,
      start: performance.now(),
      duration: 420,
    })
  }

  function addMoveEffect(entityId, from, to, duration) {
    effects.push({
      kind: 'move',
      entityId,
      from,
      to,
      start: performance.now(),
      duration,
    })
  }

  function addAnimationEffect(event) {
    if (event.kind === 'move') {
      addMoveEffect(event.entityId, event.from, event.to, event.duration)
    } else if (event.kind === 'melee') {
      addMeleeEffect(event.from, event.to)
    } else if (event.kind === 'magic') {
      addMagicEffect(event.from, event.to)
    }
  }

  const unsubscribeAnimations = animationEvents.subscribe(event => {
    if (!event) {
      return
    }

    addAnimationEffect(event)
    draw()
  })

  function getAnimatedEntityPosition(id, entity, now) {
    for (let i = effects.length - 1; i >= 0; i--) {
      const fx = effects[i]
      if (fx.kind !== 'move' || fx.entityId !== id) {
        continue
      }

      const t = Math.min((now - fx.start) / fx.duration, 1)
      const from = tileCenter(fx.from)
      const to = tileCenter(fx.to)
      return {
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t,
      }
    }

    return tileCenter(entity)
  }

  function drawEffects(now) {
    for (let i = effects.length - 1; i >= 0; i--) {
      const fx = effects[i]
      const t = (now - fx.start) / fx.duration
      if (t >= 1) {
        effects.splice(i, 1)
        continue
      }

      if (fx.kind === 'move') {
        continue
      }

      if (fx.kind === 'melee') {
        const from = tileCenter(fx.from)
        const to = tileCenter(fx.to)
        const angle = Math.atan2(to.y - from.y, to.x - from.x)
        const unitX = Math.cos(angle)
        const unitY = Math.sin(angle)
        const pivotX = from.x + unitX * (tileSize * 0.28)
        const pivotY = from.y + unitY * (tileSize * 0.28)
        const swordLen = tileSize * 0.82
        const swingStart = -0.85
        const swingEnd = 0.28
        const swing = swingStart + (swingEnd - swingStart) * t
        const swordAngle = angle + swing
        const fade = 1 - t

        ctx.save()
        ctx.translate(pivotX, pivotY)
        ctx.rotate(swordAngle)
        ctx.globalAlpha = fade

        // Slash trail in front of the blade
        ctx.strokeStyle = 'rgba(170, 235, 255, 0.35)'
        ctx.lineWidth = 12
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(swordLen * 0.25, 0)
        ctx.lineTo(swordLen * 0.95, 0)
        ctx.stroke()

        // Blade
        ctx.strokeStyle = '#f4f8ff'
        ctx.lineWidth = 6
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(swordLen, 0)
        ctx.stroke()

        // Bright edge
        ctx.strokeStyle = '#9ee7ff'
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.moveTo(swordLen * 0.15, 0)
        ctx.lineTo(swordLen * 0.98, 0)
        ctx.stroke()

        // Hilt at the pivot (attacker side)
        ctx.strokeStyle = '#c9a46a'
        ctx.lineWidth = 5
        ctx.beginPath()
        ctx.moveTo(-8, -8)
        ctx.lineTo(-8, 8)
        ctx.stroke()

        ctx.restore()
      }

      if (fx.kind === 'magic') {
        const from = tileCenter(fx.from)
        const to = tileCenter(fx.to)
        const x = from.x + (to.x - from.x) * t
        const y = from.y + (to.y - from.y) * t

        ctx.save()
        ctx.globalAlpha = 0.9
        ctx.strokeStyle = 'rgba(255, 140, 60, 0.45)'
        ctx.lineWidth = 6
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(x, y)
        ctx.stroke()

        ctx.fillStyle = '#ff8a3d'
        ctx.beginPath()
        ctx.arc(x, y, tileSize * 0.12, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#ffd37a'
        ctx.beginPath()
        ctx.arc(x, y, tileSize * 0.06, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }
  }

  function resize() {
    const state = getState()
    const parent = canvas.parentElement
    const rect = parent?.getBoundingClientRect()
    const availableWidth = Math.max(rect?.width ?? window.innerWidth, 1)
    const availableHeight = Math.max(rect?.height ?? window.innerHeight, 1)
    const dpr = window.devicePixelRatio || 1

    tileSize = Math.max(32, Math.floor(Math.min(
      availableWidth / state.width,
      availableHeight / state.height,
    )))
    canvasWidth = state.width * tileSize
    canvasHeight = state.height * tileSize

    canvas.style.width = `${canvasWidth}px`
    canvas.style.height = `${canvasHeight}px`
    canvas.width = Math.round(canvasWidth * dpr)
    canvas.height = Math.round(canvasHeight * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    draw()
  }

  function draw(now = performance.now()) {
    const state = getState()
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    for (let y = 0; y < state.height; y++) {
      for (let x = 0; x < state.width; x++) {
        ctx.fillStyle = '#223'
        ctx.fillRect(x * tileSize, y * tileSize, tileSize - 1, tileSize - 1)
      }
    }
    for (const effect of state.tileEffects ?? []) {
      if (effect.consumed) {
        continue
      }

      const x = effect.x * tileSize
      const y = effect.y * tileSize
      ctx.fillStyle = effect.type === 'heal'
        ? 'rgba(80, 220, 130, 0.28)'
        : effect.type === 'mana'
          ? 'rgba(90, 150, 255, 0.28)'
          : effect.type === 'boost_melee'
            ? 'rgba(245, 210, 80, 0.32)'
            : 'rgba(255, 110, 90, 0.28)'
      ctx.fillRect(x + tileSize * 0.08, y + tileSize * 0.08, tileSize * 0.84, tileSize * 0.84)
    }
    for (const id in state.entities) {
      const e = state.entities[id]
      if (!e) continue
      const position = getAnimatedEntityPosition(id, e, now)
      const px = position.x
      const py = position.y
      ctx.beginPath()
      ctx.fillStyle = id === 'player1' ? '#4cf' : '#f66'
      ctx.arc(px, py, tileSize * 0.35, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = `${Math.max(10, Math.floor(tileSize * 0.12))}px sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(`${e.hp}/${e.maxHp}`, px, py - tileSize * 0.08)
      ctx.fillText(`MP:${e.mp}`, px, py + tileSize * 0.12)
    }
    const hover = uiStores.hover
    if (hover) {
      ctx.fillStyle = 'rgba(255,255,255,0.12)'
      ctx.fillRect(hover.x * tileSize, hover.y * tileSize, tileSize - 1, tileSize - 1)
    }

    drawEffects(now)
  }

  function getTileFromEvent(evt) {
    const rect = canvas.getBoundingClientRect()
    const state = getState()
    const x = Math.floor((evt.clientX - rect.left) / (rect.width / state.width))
    const y = Math.floor((evt.clientY - rect.top) / (rect.height / state.height))
    return { x, y }
  }

  canvas.addEventListener('mousemove', (e) => {
    const t = getTileFromEvent(e)
    uiStores.hover = t
    draw()
  })

  canvas.addEventListener('mouseleave', () => {
    uiStores.hover = null
    draw()
  })

  canvas.addEventListener('click', (e) => {
    const tile = getTileFromEvent(e)
    const state = getState()
    const selected = uiStores.selected
    if (selected === 'move') {
      dispatch({ type: 'MOVE', payload: { id: state.turn, to: tile } })
    } 
    else if (selected === 'melee') {
      for (const id in state.entities) {
        const ent = state.entities[id]
        if (ent.x === tile.x && ent.y === tile.y && id !== state.turn) {
          dispatch({ type: 'MELEE', payload: { attackerId: state.turn, targetId: id } })
          break
        }
      }
    } 
    else if (selected === 'magic') {
      for (const id in state.entities) {
        const ent = state.entities[id]
        if (ent.x === tile.x && ent.y === tile.y && id !== state.turn) {
          dispatch({ type: 'MAGIC', payload: { attackerId: state.turn, targetId: id } })
          break
        }
      }
    }
    draw()
  })

  function loop(now) {
    draw(now)
    frameId = requestAnimationFrame(loop)
  }
  resize()
  window.addEventListener('resize', resize)
  if ('ResizeObserver' in window && canvas.parentElement) {
    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas.parentElement)
  }
  frameId = requestAnimationFrame(loop)

  return {
    resize,
    destroy() {
      unsubscribeAnimations()
      window.removeEventListener('resize', resize)
      resizeObserver?.disconnect()
      if (frameId) {
        cancelAnimationFrame(frameId)
      }
    },
  }
}
