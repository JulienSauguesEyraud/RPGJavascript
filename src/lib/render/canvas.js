import { gameState, myPlayerId } from '../stores/gameState.js'
import { selectedAction } from '../stores/gameUi.js'
import { ATTACKS_VISUAL, MONSTERS_VISUAL, CLASSES_VISUAL } from './index.js'
import { distanceFromTile } from "../game/index.js"
import { MONSTER_ATTACK_KIND } from '../game/constants.js'
import { 
  drawGrid, drawEntities, drawMonsters , 
  drawTileEffects, drawProjectiles, drawSpinner 
} from './drawHelpers.js'

export function initGameCanvas(canvas, getState, dispatch, uiStores) {
  const context = canvas.getContext('2d')
  let tileSize = 64
  let canvasWidth = 0
  let canvasHeight = 0
  let frameId = null

  const effects = []
  let prevState = null
  let currentSelectedAction = ''
  let currentPlayerId = ''

  const observer = new ResizeObserver(() => resize())
  observer.observe(canvas.parentElement)

  const tileCenter = (x, y) => ({ x: x * tileSize + tileSize / 2, y: y * tileSize + tileSize / 2 })

  function pushAttackEffect(kind, from, to) {
    const visual = ATTACKS_VISUAL[kind]
    if (!visual) return

    let startTime = performance.now()
    const activeEffects = effects.filter(e => e.kind === kind)
    if (activeEffects.length > 0) {
      startTime = Math.max(startTime, activeEffects[activeEffects.length - 1].start + visual.duration * 0.4)
    }

    effects.push({
      kind,
      from,
      to,
      start: startTime,
      duration: visual.duration,
    })
  }

  const unsubState = gameState.subscribe(state => {
    if (!state || !prevState) {
      prevState = state;
      return
    }

    for (const id in state.entities) {
      const curr = state.entities[id]
      const prev = prevState.entities[id]
      if (!curr || !prev) continue

      if (curr.x !== prev.x || curr.y !== prev.y) {
        let startTime = performance.now()
        if (curr.lastAction === 'teleport') {
          effects.push({
            kind: 'teleport',
            entityId: id,
            from: tileCenter(prev.x, prev.y),
            to: tileCenter(curr.x, curr.y),
            start: performance.now(),
            duration: 600,
          })
        } else {
          const entityMoves = effects.filter(e => e.kind === 'move' && e.entityId === id)
          if (entityMoves.length > 0) {
            startTime = Math.max(startTime, entityMoves[entityMoves.length - 1].start + 200)
          }
          effects.push({
            kind: 'move',
            entityId: id,
            from: tileCenter(prev.x, prev.y),
            to: tileCenter(curr.x, curr.y),
            start: startTime,
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
          pushAttackEffect(
              state.entities[attacker.id]?.lastAction ?? 'melee',
              tileCenter(attacker.x, attacker.y),
              tileCenter(prev.x, prev.y)
          )
        }
        else if (!attacker) {
          const attackingMonsters = state.monsters?.filter(m => {
            const pm = prevState.monsters?.find(p => p.id === m.id)
            return pm && m.lastAttack && m.lastAttack !== pm.lastAttack
          }) ?? []
          for (const monster of attackingMonsters) {
            if (distanceFromTile(monster, curr) === 1) {
              pushAttackEffect(
                  MONSTER_ATTACK_KIND[monster.type] ?? 'melee',
                  tileCenter(monster.x, monster.y),
                  tileCenter(curr.x, curr.y)
              )
            }
          }
        }
      }
    }

    for (const prevMonster of prevState.monsters ?? []) {
      const currentMonster = state.monsters?.find(m => m.id === prevMonster.id)
      if (!currentMonster || currentMonster.hp < prevMonster.hp) {
        const attacker = Object.values(state.entities).find(p => {
          const prevPlayer = prevState.entities[p.id]
          return prevPlayer && p.lastAttacked > prevPlayer.lastAttacked
        })
        if (attacker) {
          pushAttackEffect(
              attacker.lastAction ?? 'melee',
              tileCenter(attacker.x, attacker.y),
              tileCenter(
                  currentMonster ? currentMonster.x : prevMonster.x,
                  currentMonster ? currentMonster.y : prevMonster.y
              )
          )
        }
      }
    }
    prevState = state
  })

  const unsubSelected = selectedAction.subscribe(val => currentSelectedAction = val)
  const unsubPlayerId = myPlayerId.subscribe(val => currentPlayerId = val)

  function getDisplayPos(id, entity, now) {
    const tp = effects.find(e => e.kind === 'teleport' && e.entityId === id)
    if (tp && now - tp.start >= 0 && now - tp.start <= tp.duration) return null

    const moves = effects.filter(e => e.kind === 'move' && e.entityId === id)
    if (moves.length > 0) {
      const active = moves.find(e => now >= e.start && now <= e.start + e.duration)
      if (active) {
        const t = (now - active.start) / active.duration
        return { x: active.from.x + (active.to.x - active.from.x) * t, y: active.from.y + (active.to.y - active.from.y) * t }
      }
      const future = moves.filter(e => now < e.start).sort((a, b) => a.start - b.start)
      if (future.length > 0) return future[0].from
    }
    return tileCenter(entity.x, entity.y)
  }

  function draw(now = performance.now()) {
    const state = getState()
    if (!state) return

    for (let i = effects.length - 1; i >= 0; i--) {
      if (now >= effects[i].start + effects[i].duration) effects.splice(i, 1)
    }

    context.clearRect(0, 0, canvasWidth, canvasHeight)
    const me = state.entities[currentPlayerId]

    drawGrid(context, state, me, currentSelectedAction, tileSize)
    drawTileEffects(context, effects, now, tileSize)

    if (uiStores.hover) {
      context.fillStyle = 'rgba(255,255,255,0.12)'
      context.fillRect(uiStores.hover.x * tileSize, uiStores.hover.y * tileSize, tileSize - 1, tileSize - 1)
    }

    drawMonsters(context, state.monsters ?? [], tileSize, MONSTERS_VISUAL)
    drawEntities(context, state.entities, currentPlayerId, getDisplayPos, now, tileSize, CLASSES_VISUAL)
    drawProjectiles(context, effects, now, tileSize, ATTACKS_VISUAL)
  }

  function resize() {
    const state = getState()
    if (!state) return
    const rect = canvas.parentElement.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    tileSize = Math.max(32, Math.floor(Math.min(rect.width / state.width, rect.height / state.height)))
    canvasWidth = state.width * tileSize
    canvasHeight = state.height * tileSize

    canvas.style.width = `${canvasWidth}px`
    canvas.style.height = `${canvasHeight}px`
    canvas.width = Math.round(canvasWidth * dpr)
    canvas.height = Math.round(canvasHeight * dpr)
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  const getTile = (evt) => {
    const rect = canvas.getBoundingClientRect()
    const state = getState()
    return {
      x: Math.floor((evt.clientX - rect.left) / (rect.width / state.width)),
      y: Math.floor((evt.clientY - rect.top) / (rect.height / state.height))
    }
  }

  canvas.addEventListener('mousemove', e => { uiStores.hover = getTile(e) })
  canvas.addEventListener('mouseleave', () => { uiStores.hover = null })
  canvas.addEventListener('click', e => {
    const tile = getTile(e)
    const selected = currentSelectedAction
    const state = getState()

    if (selected === 'move' || selected === 'teleport') {
      dispatch({ type: selected === 'move' ? 'MOVE' : 'TELEPORT', payload: { id: currentPlayerId, to: tile } })
    }
    else if (['melee', 'fireball', 'thunder'].includes(selected)) {
      const targetMonster = state.monsters?.find(m => m.x === tile.x && m.y === tile.y)
      const actionType = selected.toUpperCase()

      if (targetMonster) {
        dispatch({ type: actionType, payload: { attackerId: currentPlayerId, targetId: targetMonster.id } })
        return
      }
      for (const id in state.entities) {
        const entity = state.entities[id]
        if (entity.x === tile.x && entity.y === tile.y && id !== currentPlayerId) {
          dispatch({ type: actionType, payload: { attackerId: currentPlayerId, targetId: id } })
          break
        }
      }
    }
  })

  function loop(now) { draw(now); frameId = requestAnimationFrame(loop) }
  window.addEventListener('resize', resize)
  resize()
  frameId = requestAnimationFrame(loop)

  return {
    resize,
    destroy() {
      unsubState()
      unsubSelected()
      unsubPlayerId()
      observer.disconnect()
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(frameId)
    }
  }
}