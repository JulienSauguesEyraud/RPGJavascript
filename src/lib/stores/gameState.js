import { get, writable } from 'svelte/store'
import {
  TILE_EFFECT_TRIGGERS,
  applyMagic,
  applyMelee,
  applyMove,
  canMagic,
  canMelee,
  canMove,
  createInitialState,
  distance8,
  endTurn,
  resolveTileTrigger,
} from '../game/index.js'

const initial = createInitialState()
export const gameState = writable(initial)
export const animationEvents = writable(null)

let animationSequence = 0
let isResolvingTurn = false

const ANIMATION_DURATIONS = {
  move: 260,
  melee: 180,
  magic: 420,
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function emitAnimation(event) {
  if (!event) {
    return 0
  }

  const duration = event.duration ?? ANIMATION_DURATIONS[event.kind] ?? 0
  animationEvents.set({
    ...event,
    duration,
    sequence: ++animationSequence,
  })
  return duration
}

async function playAnimation(event) {
  const duration = emitAnimation(event)
  if (duration > 0) {
    await wait(duration)
  }
}

function createPlayerAnimation(state, action) {
  if (action.type === 'MOVE') {
    const actor = state.entities[action.payload.id]
    return {
      kind: 'move',
      entityId: action.payload.id,
      from: { x: actor.x, y: actor.y },
      to: action.payload.to,
    }
  }

  if (action.type === 'MELEE' || action.type === 'MAGIC') {
    const attacker = state.entities[action.payload.attackerId]
    const target = state.entities[action.payload.targetId]
    return {
      kind: action.type === 'MELEE' ? 'melee' : 'magic',
      from: { x: attacker.x, y: attacker.y },
      to: { x: target.x, y: target.y },
    }
  }

  return null
}

function hasFinishedActions(entity) {
  return entity.hasMoved && entity.hasAttacked
}

async function finishTurn(next) {
  next = endTurn(next)
  gameState.set(next)

  return next
}

export async function dispatch(action) {
  if (isResolvingTurn) {
    return
  }

  isResolvingTurn = true

  try {
    const state = get(gameState)
    let next = structuredClone(state)
    let animation = null

    if (action.type === 'MOVE') {
      const { id, to } = action.payload
      if (applyMove && typeof applyMove === 'function') {
        if (state.turn !== id) {
          next.log.push('Ce n\'est pas ton tour')
          gameState.set(next)
          return
        }
        if (next.entities[id].hasMoved) {
          next.log.push(`${id} a deja bouge ce tour`)
          gameState.set(next)
          return
        }
        if (!canMove(next, id, to)) {
          gameState.set(next)
          return
        }
        animation = createPlayerAnimation(state, action)
        next = applyMove(next, id, to)
        next = resolveTileTrigger(next, id, TILE_EFFECT_TRIGGERS.ON_ENTER)
      }
    } 
    else if (action.type === 'MELEE') {
      const { attackerId, targetId } = action.payload
      if (state.turn !== attackerId) {
        next.log.push('Ce n\'est pas ton tour')
        gameState.set(next)
        return
      }
      if (next.entities[attackerId].hasAttacked) {
        next.log.push(`${attackerId} a deja attaque ce tour`)
        gameState.set(next)
        return
      }
      if (!canMelee(next, attackerId, targetId)) {
        gameState.set(next)
        return
      }
      animation = createPlayerAnimation(state, action)
      next = applyMelee(next, attackerId, targetId)
    } 
    else if (action.type === 'MAGIC') {
      const { attackerId, targetId } = action.payload
      if (state.turn !== attackerId) {
        next.log.push('Ce n\'est pas ton tour')
        gameState.set(next)
        return
      }
      if (next.entities[attackerId].hasAttacked) {
        next.log.push(`${attackerId} a deja attaque ce tour`)
        gameState.set(next)
        return
      }
      if (!canMagic(next, attackerId, targetId)) {
        gameState.set(next)
        return
      }
      animation = createPlayerAnimation(state, action)
      next = applyMagic(next, attackerId, targetId)
    } else if (action.type === 'PASS') {
      const id = action.payload?.id ?? state.turn
      if (state.turn !== id) {
        next.log.push('Ce n\'est pas ton tour')
        gameState.set(next)
        return
      }
      next.log.push(`${id} passe son tour`)
      await finishTurn(next)
      return
    } else {
      return
    }

    await playAnimation(animation)
    gameState.set(next)

    if (next.entities.player1.hp <= 0 || next.entities.player2.hp <= 0) {
      resetGame()
      return
    }

    if (hasFinishedActions(next.entities[next.turn])) {
      await finishTurn(next)
    }
  } finally {
    isResolvingTurn = false
  }
}

export function resetGame() {
  gameState.set(createInitialState())
}
