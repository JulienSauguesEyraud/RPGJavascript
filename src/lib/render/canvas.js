import { gameState } from '../stores/gameState.js'

const ATTACK_VISUALS = {
  melee: {
    duration: 200,
    draw(context, fx, t) {
      const x = fx.from.x + (fx.to.x - fx.from.x) * t
      const y = fx.from.y + (fx.to.y - fx.from.y) * t
      context.save()
      context.globalAlpha = 1 - t
      context.strokeStyle = '#fff'
      context.lineWidth = 4
      context.lineCap = 'round'
      context.beginPath()
      context.moveTo(fx.from.x, fx.from.y)
      context.lineTo(x, y)
      context.stroke()
      context.restore()
    },
  },
  fireball: {
    duration: 400,
    draw(context, fx, t, tileSize) {
      const x = fx.from.x + (fx.to.x - fx.from.x) * t
      const y = fx.from.y + (fx.to.y - fx.from.y) * t
      context.save()
      context.fillStyle = '#f90'
      context.shadowColor = '#f90'
      context.shadowBlur = 12
      context.beginPath()
      context.arc(x, y, tileSize * 0.12, 0, Math.PI * 2)
      context.fill()
      context.restore()
    },
  },
  thunder: {
    duration: 350,

    draw(context, fx, t, tileSize) {
      const alpha = 1 - t

      const startX = fx.to.x
      const startY = fx.to.y - tileSize * 1.5

      const midY1 = startY + tileSize * 0.5
      const midY2 = startY + tileSize

      const offset = tileSize * 0.15

      context.save()
      context.globalAlpha = alpha

      context.strokeStyle = '#7af'
      context.lineWidth = 3
      context.beginPath()
      context.moveTo(startX, startY)
      context.lineTo(startX + offset, midY1)
      context.lineTo(startX - offset, midY2)
      context.lineTo(fx.to.x, fx.to.y)
      context.stroke()

      context.restore()
    },
  },
}

export function initGameCanvas(canvas, getState, dispatch, uiStores) {
  const context = canvas.getContext('2d')
  let tileSize = 64
  let canvasWidth = 0
  let canvasHeight = 0
  let frameId = null

  const effects = []
  let prevState = null

  const observer = new ResizeObserver(() => resize())
  observer.observe(canvas.parentElement)

  function tileCenter(x, y) {
    return {
      x: x * tileSize + tileSize / 2,
      y: y * tileSize + tileSize / 2,
    }
  }

  function pushAttackEffect(kind, from, to) {
    const visual = ATTACK_VISUALS[kind]
    if (!visual) return
    effects.push({
      kind,
      from,
      to,
      start: performance.now(),
      duration: visual.duration,
    })
  }

  const unsub = gameState.subscribe(state => {
    if (!state) return

    if (prevState) {
      for (const id in state.entities) {
        const curr = state.entities[id]
        const prev = prevState.entities[id]
        if (!curr || !prev) continue

        if (curr.x !== prev.x || curr.y !== prev.y) {
          effects.push({
            kind: 'move',
            entityId: id,
            from: tileCenter(prev.x, prev.y),
            to: tileCenter(curr.x, curr.y),
            start: performance.now(),
            duration: 200,
          })
        }

        if (curr.hp < prev.hp) {
          const attacker = Object.values(prevState.entities).find(e => {
            const currE = state.entities[e.id]
            return currE && currE.lastAttacked > e.lastAttacked
          })
          if (attacker && attacker.id !== id) {
            const kind = state.entities[attacker.id]?.lastAction ?? 'melee'
            pushAttackEffect(
                kind,
                tileCenter(attacker.x, attacker.y),
                tileCenter(prev.x, prev.y),
            )
          }
        }
      }
    }

    prevState = state
  })

  function getDisplayPos(id, entity, now) {
    for (const effect of effects) {
      if (effect.kind !== 'move' || effect.entityId !== id) continue
      const t = Math.min((now - effect.start) / effect.duration, 1)
      return {
        x: effect.from.x + (effect.to.x - effect.from.x) * t,
        y: effect.from.y + (effect.to.y - effect.from.y) * t,
      }
    }
    return tileCenter(entity.x, entity.y)
  }

  function draw(now = performance.now()) {
    const state = getState()
    if (!state) return

    for (let i = effects.length - 1; i >= 0; i--) {
      if (now - effects[i].start >= effects[i].duration) effects.splice(i, 1)
    }

    context.clearRect(0, 0, canvasWidth, canvasHeight)

    for (let y = 0; y < state.height; y++) {
      for (let x = 0; x < state.width; x++) {
        context.fillStyle = '#223'
        context.fillRect(x * tileSize, y * tileSize, tileSize - 1, tileSize - 1)
      }
    }

    for (const effect of state.tileEffects ?? []) {
      if (effect.consumed) continue
      context.fillStyle =
          effect.type === 'heal'        ? 'rgba(80,220,130,0.4)' :
              effect.type === 'mana'        ? 'rgba(90,150,255,0.4)' :
                  effect.type === 'boost_melee' ? 'rgba(245,210,80,0.4)' :
                      'rgba(255,110,90,0.4)'
      context.fillRect(
          effect.x * tileSize + 4,
          effect.y * tileSize + 4,
          tileSize - 8,
          tileSize - 8,
      )
    }

    if (uiStores.hover) {
      const { x, y } = uiStores.hover
      context.fillStyle = 'rgba(255,255,255,0.12)'
      context.fillRect(x * tileSize, y * tileSize, tileSize - 1, tileSize - 1)
    }

    for (const id in state.entities) {
      const entity = state.entities[id]
      if (!entity) continue
      const { x: px, y: py } = getDisplayPos(id, entity, now)

      context.beginPath()
      context.fillStyle = id === 'player1' ? '#4cf' : '#f66'
      context.arc(px, py, tileSize * 0.35, 0, Math.PI * 2)
      context.fill()

      context.fillStyle = '#fff'
      context.textAlign = 'center'
      context.font = `${Math.floor(tileSize * 0.18)}px sans-serif`
      context.fillText(`${entity.hp}/${entity.maxHp}`, px, py - 4)
      context.fillText(`MP:${entity.mp}`, px, py + tileSize * 0.22)
    }

    for (const effect of effects) {
      if (effect.kind === 'move') continue
      const visual = ATTACK_VISUALS[effect.kind]
      if (!visual) continue
      const t = (now - effect.start) / effect.duration
      visual.draw(context, effect, t, tileSize)
    }
  }

  function resize() {
    const state = getState()
    if (!state) return
    const rect = canvas.parentElement.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    tileSize = Math.max(32, Math.floor(Math.min(
        rect.width  / state.width,
        rect.height / state.height,
    )))

    canvasWidth  = state.width  * tileSize
    canvasHeight = state.height * tileSize

    canvas.style.width  = `${canvasWidth}px`
    canvas.style.height = `${canvasHeight}px`
    canvas.width  = Math.round(canvasWidth * dpr)
    canvas.height = Math.round(canvasHeight * dpr)
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function getTile(evt) {
    const rect = canvas.getBoundingClientRect()
    const state = getState()
    return {
      x: Math.floor((evt.clientX - rect.left) / (rect.width  / state.width)),
      y: Math.floor((evt.clientY - rect.top)  / (rect.height / state.height)),
    }
  }

  canvas.addEventListener('mousemove', e => { uiStores.hover = getTile(e) })
  canvas.addEventListener('mouseleave', () => { uiStores.hover = null })
  canvas.addEventListener('click', e => {
    const tile = getTile(e)
    const selected = uiStores.selected
    const state = getState()

    if (selected === 'move') {
      dispatch({ type: 'MOVE', payload: { id: uiStores.playerId, to: tile } })
    } else if (selected === 'melee' || selected === 'fireball' || selected === 'thunder') {
      for (const id in state.entities) {
        const entity = state.entities[id]
        if (entity.x === tile.x && entity.y === tile.y && id !== uiStores.playerId) {
          dispatch({
            type: selected === 'melee' ? 'MELEE'
                : selected === 'fireball' ? 'FIREBALL'
                    : 'THUNDER',
            payload: { attackerId: uiStores.playerId, targetId: id },
          })
          break
        }
      }
    }
  })

  function loop(now) {
    draw(now)
    frameId = requestAnimationFrame(loop)
  }

  window.addEventListener('resize', resize)
  resize()
  frameId = requestAnimationFrame(loop)

  return {
    destroy() {
      unsub()
      observer.disconnect()
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(frameId)
    },
  }
}