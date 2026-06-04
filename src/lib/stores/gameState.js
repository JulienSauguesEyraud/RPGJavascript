import { writable } from 'svelte/store'
import { browser } from '$app/environment'
import { createInitialState } from '../game/index.js'

export const gameState = writable(createInitialState())
export const myPlayerId = writable(null)
export const roomCode = writable(null)
export const lobbyStatus = writable('idle') // 'idle' | 'waiting' | 'playing' | 'full' | 'error'
export const lobbyError = writable(null)

let socket = null
let previousState = null
let animationSequence = 0
const ANIMATION_DURATIONS = { move: 260, melee: 180, magic: 420 }

function initSocket() {
  import('socket.io-client').then(({ io }) => {
    socket = io('http://localhost:3001')

    socket.on('created', (code) => {
      roomCode.set(code)
      lobbyStatus.set('waiting')
    })

    socket.on('joined', (code) => {
      roomCode.set(code)
      lobbyStatus.set('playing')
    })

    socket.on('assigned', (slot) => {
      myPlayerId.set(slot)
    })

    socket.on('opponent_joined', () => {
      lobbyStatus.set('playing')
    })

    socket.on('opponent_left', () => {
      lobbyStatus.set('waiting')
    })

    socket.on('error', (msg) => {
      lobbyError.set(msg)
      lobbyStatus.set('error')
    })

    socket.on('state', (newState) => {
      lobbyStatus.set('playing')
      previousState = newState
      gameState.set(newState)
    })
  })
}

if (browser) initSocket()

export function createRoom() {
  if (socket) socket.emit('create')
}

export function joinRoom(code) {
  if (socket) socket.emit('join', code.trim().toUpperCase())
}

export function dispatch(action) {
  if (socket) socket.emit('action', action)
}

export function resetGame() {
  if (socket) socket.emit('reset')
}