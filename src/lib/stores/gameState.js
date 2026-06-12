import { writable } from 'svelte/store'
import { browser } from '$app/environment'
import { createInitialState } from '../game/index.js'

export const gameState = writable(createInitialState())
export const myPlayerId = writable(null)
export const roomCode = writable(null)
export const lobbyStatus = writable('idle') // 'idle' | 'waiting' | 'playing' | 'full'
export const lobbyError = writable(null)
export const lobbySlots = writable({ player1: null, player2: null, player3: null, player4: null })
export const winner = writable(null);
export const getPlayersList = (state) => {
  const list = [];
  if (!state || !state.entities) return list;

  const ids = ['player1', 'player2', 'player3', 'player4'];
  for (const id of ids) {
    if (state.entities[id]) {
      list.push({ ...state.entities[id], id });
    }
  }
  return list;
};

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
      lobbyStatus.set('waiting')
    })

    socket.on('assigned', (slot) => {
      myPlayerId.set(slot)
      lobbyError.set('')
    })

    socket.on('opponent_left', () => {
      lobbyStatus.set('waiting')
    })

    socket.on('error', (msg) => {
      lobbyError.set(msg)
    })

    socket.on('state', (newState) => {
      previousState = newState
      gameState.set(newState)
    })

    socket.on('lobby_update', (data) => {
      lobbySlots.set(data.slots)
    })

    socket.on('game_started', (newState) => {
      gameState.set(newState)
      lobbyStatus.set('playing')
    })

    socket.on('game_over', ({ winner: winnerName }) => {
      winner.set(winnerName);
      lobbyStatus.set('waiting');
    });
  })
}

if (browser) initSocket()

export function createRoom(className) {
  if (socket) socket.emit('create', className)
}

export function joinRoom(code, className) {
  if (socket) socket.emit('join', { code: code.trim().toUpperCase(), className })
}

export function startGame() {
  if (socket) socket.emit('start')
}

export function dispatch(action) {
  if (socket) socket.emit('action', action)
}

export function leaveRoom() {
  if (socket) {
    lobbyStatus.set('idle')
    roomCode.set(null)
    myPlayerId.set(null)
    lobbyError.set('')
    socket.emit('leave')
  }
}