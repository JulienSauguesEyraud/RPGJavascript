import { writable } from 'svelte/store'
import { browser } from '$app/environment'
import { createInitialState } from '../game/index.js'

export const gameState = writable(createInitialState())
export const animationEvents = writable(null)
export const myPlayerId = writable(null)

let socket = null
let previousState = null
let animationSequence = 0
const ANIMATION_DURATIONS = { move: 260, melee: 180, magic: 420 }

function detectAndEmitAnimations(prev, next) {
  for (const id in next.entities) {
    const e = next.entities[id]
    const p = prev.entities[id]
    if (!p || !e) continue
    if (e.x !== p.x || e.y !== p.y) {
      animationEvents.set({
        kind: 'move',
        entityId: id,
        from: { x: p.x, y: p.y },
        to: { x: e.x, y: e.y },
        duration: ANIMATION_DURATIONS.move,
        sequence: ++animationSequence,
      })
    }
    if (e.hp < p.hp) {
      const attackerId = prev.turn
      const attacker = prev.entities[attackerId]
      const victim = prev.entities[id]
      if (!attacker || !victim || attackerId === id) continue
      const dx = Math.abs(attacker.x - victim.x)
      const dy = Math.abs(attacker.y - victim.y)
      const kind = dx <= 1 && dy <= 1 ? 'melee' : 'magic'
      animationEvents.set({
        kind,
        from: { x: attacker.x, y: attacker.y },
        to: { x: victim.x, y: victim.y },
        duration: ANIMATION_DURATIONS[kind],
        sequence: ++animationSequence,
      })
    }
  }
}

function getSocket() {
  if (!browser) return null
  if (socket) return socket

  import('socket.io-client').then(({ io }) => {
    socket = io('http://localhost:3001')

    socket.on('connect', () => {
      if (sessionStorage.getItem('rpg_joined')) return
      sessionStorage.setItem('rpg_joined', '1')
      socket.emit('join')
    })

    socket.on('disconnect', () => {
      sessionStorage.removeItem('rpg_joined')
    })

    socket.on('assigned', (slot) => {
      myPlayerId.set(slot)
    })

    socket.on('full', () => {
      console.warn('Partie pleine')
    })

    socket.on('state', (newState) => {
      if (previousState) detectAndEmitAnimations(previousState, newState)
      previousState = newState
      gameState.set(newState)
    })
  })

  return null
}

if (browser) {
  getSocket()
}

export function dispatch(action) {
  if (socket) socket.emit('action', action)
}

export function resetGame() {
  if (socket) socket.emit('reset')
}