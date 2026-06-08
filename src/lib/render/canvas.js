import { gameState } from '../stores/gameState.js'
import { ATTACKS_VISUAL, MONSTERS_VISUAL, CLASSES_VISUAL } from './index.js'

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
    const visual = ATTACKS_VISUAL[kind]
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
          if (curr.lastAction === 'teleport' && prev.lastAction !== 'teleport') {
            effects.push({
              kind: 'teleport',
              entityId: id,
              from: tileCenter(prev.x, prev.y),
              to: tileCenter(curr.x, curr.y),
              start: performance.now(),
              duration: 600,
            })
          }
          else {
            effects.push({
              kind: 'move',
              entityId: id,
              from: tileCenter(prev.x, prev.y),
              to: tileCenter(curr.x, curr.y),
              start: performance.now(),
              duration: 200,
            })
          }

          const tileEffect = state.tileEffects?.find(e =>
              e.x === curr.x &&
              e.y === curr.y &&
              e.activatedAt && Date.now() - e.activatedAt < 1000
          )
          if (tileEffect) {
            effects.push({
              kind: 'tile',
              type: tileEffect.type,
              x: tileEffect.x,
              y: tileEffect.y,
              start: performance.now(),
              duration: 1000,
            })
          }
        }

        if (curr.hp < prev.hp) {
          const attacker = Object.values(prevState.entities).find(e =>
              state.entities[e.id] &&
              state.entities[e.id].lastAttacked > e.lastAttacked
          )
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

      for (const monster of state.monsters ?? []) {
        const prevMonster = prevState.monsters?.find(m => m.id === monster.id)
        if (!prevMonster) continue

        if (monster.hp < prevMonster.hp) {
          const attacker = Object.values(state.entities).find(p => {
            const prevPlayer = prevState.entities[p.id]
            return prevPlayer && p.lastAttacked > prevPlayer.lastAttacked
          })

          if (attacker) {
            const kind = attacker.lastAction ?? 'melee'
            pushAttackEffect(
                kind,
                tileCenter(attacker.x, attacker.y),
                tileCenter(prevMonster.x, prevMonster.y),
            )
          }
        }
      }
    }

    prevState = state
  })

  function getDisplayPos(id, entity, now) {
    for (const effect of effects) {
      if (effect.kind === 'teleport' && effect.entityId === id) {
        return null
      }
    }

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

    for (const effect of effects) {
      if (effect.kind !== 'tile') continue
      const t = (now - effect.start) / effect.duration
      if (t > 1) continue
      const alpha = (1 - t) * 0.6
      context.fillStyle =
          effect.type === 'heal'
              ? `rgba(80,220,130,${alpha})`
              : effect.type === 'mana'
                  ? `rgba(90,150,255,${alpha})`
                  : effect.type === 'boost_melee'
                      ? `rgba(245,210,80,${alpha})`
                      : `rgba(255,110,90,${alpha})`

      context.fillRect(
          effect.x * tileSize,
          effect.y * tileSize,
          tileSize,
          tileSize,
      )
    }

    if (uiStores.hover) {
      const { x, y } = uiStores.hover
      context.fillStyle = 'rgba(255,255,255,0.12)'
      context.fillRect(x * tileSize, y * tileSize, tileSize - 1, tileSize - 1)
    }

    for (const monster of state.monsters ?? []) {
      const visual = MONSTERS_VISUAL[monster.type]
      if (!visual) continue
      const px = monster.x * tileSize + tileSize / 2
      const py = monster.y * tileSize + tileSize / 2
      const r  = tileSize * 0.3

      context.save()
      visual.draw(context, px, py, r, tileSize)
      context.restore()

      context.fillStyle = '#fff'
      context.textAlign = 'center'
      context.font = `${Math.floor(tileSize * 0.14)}px sans-serif`
      context.fillText(
          `${monster.hp}/${monster.maxHp}`,
          px,
          py + r + 14
      )
    }

    for (const id in state.entities) {
      const entity = state.entities[id]
      if (!entity) continue
      const pos = getDisplayPos(id, entity, now)
      if (!pos) continue
      const { x: px, y: py } = pos

      context.beginPath()
      context.fillStyle = id === 'player1' ? '#4cf' : '#f66'
      context.arc(px, py, tileSize * 0.35, 0, Math.PI * 2)
      context.fill()

      const accessory = CLASSES_VISUAL[entity.className]
      if (accessory) accessory.draw(context, px, py, tileSize)

      context.fillStyle = '#fff'
      context.textAlign = 'center'
      context.font = `${Math.floor(tileSize * 0.18)}px sans-serif`
      context.fillText(`${entity.hp}/${entity.maxHp}`, px, py - 4)
      context.fillText(`MP:${entity.mp}`, px, py + tileSize * 0.22)
    }

    for (const effect of effects) {
      if (effect.kind === 'move' || effect.kind === 'tile') continue
      const visual = ATTACKS_VISUAL[effect.kind]
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
        rect.width / state.width,
        rect.height / state.height,
    )))

    canvasWidth = state.width * tileSize
    canvasHeight = state.height * tileSize

    canvas.style.width = `${canvasWidth}px`
    canvas.style.height = `${canvasHeight}px`
    canvas.width = Math.round(canvasWidth * dpr)
    canvas.height = Math.round(canvasHeight * dpr)
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function getTile(evt) {
    const rect = canvas.getBoundingClientRect()
    const state = getState()
    return {
      x: Math.floor((evt.clientX - rect.left) / (rect.width / state.width)),
      y: Math.floor((evt.clientY - rect.top) / (rect.height / state.height)),
    }
  }

  canvas.addEventListener('mousemove', e => { uiStores.hover = getTile(e) })
  canvas.addEventListener('mouseleave', () => { uiStores.hover = null })

  canvas.addEventListener('click', e => {
    const tile = getTile(e)
    const selected = uiStores.selected
    const state = getState()

    if (selected === 'move' || selected === 'teleport') {
      dispatch({
        type: selected === 'move' ? 'MOVE' : 'TELEPORT',
        payload: { id: uiStores.playerId, to: tile },
      })
    } else if (selected === 'melee' || selected === 'fireball' || selected === 'thunder') {
      const monster = state.monsters?.find(m => m.x === tile.x && m.y === tile.y)
      if (monster) {
        dispatch({
          type: selected === 'melee' ? 'MELEE' : selected === 'fireball' ? 'FIREBALL' : 'THUNDER',
          payload: { attackerId: uiStores.playerId, targetId: monster.id },
        })
        return
      }
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