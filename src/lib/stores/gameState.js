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
      previousState = newState
      gameState.set(newState)
    })
  })
}

if (browser) initSocket()

export function createRoom(className) {
  if (socket) socket.emit('create', className)
}

export function joinRoom(code, className) {
  if (socket) socket.emit('join', { code: code.trim().toUpperCase(), className })
}

export function dispatch(action) {
  if (socket) socket.emit('action', action)
}