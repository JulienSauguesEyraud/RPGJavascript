import { createServer } from 'http'
import { Server } from 'socket.io'
import {
  createInitialState,
  canMove, applyMove,
  canMelee, applyMelee,
  canMagic, applyMagic,
  endTurn,
  TILE_EFFECT_TRIGGERS,
  resolveTileTrigger,
} from '../src/lib/game/index.js'

const httpServer = createServer()
const io = new Server(httpServer, { cors: { origin: '*' } })

let gameState = createInitialState()
// player1 = premier connecté, player2 = second
const playerSlots = {}   // socketId -> 'player1' | 'player2'

function broadcast() {
  io.emit('state', gameState)
}

let slots = {
  player1: null,
  player2: null,
}

io.on('connection', (socket) => {
    console.log('connexion', socket.id)

    socket.on('join', () => {
        console.log('join demandé par', socket.id, 'slots:', JSON.stringify(slots))

        const slot = slots.player1 === null ? 'player1'
                : slots.player2 === null ? 'player2'
                : null

        if (!slot) {
            console.log('Partie pleine, refus de', socket.id)
            socket.emit('full')
            return
        }

        slots[slot] = socket.id
        console.log(`${slot} assigné à`, socket.id)
        socket.emit('assigned', slot)
        socket.emit('state', gameState)
    })

    socket.on('action', (action) => {
        // Identifier le joueur par son socketId
        const playerId = slots.player1 === socket.id ? 'player1'
                    : slots.player2 === socket.id ? 'player2'
                    : null
        if (!playerId || gameState.turn !== playerId) return

    let next = structuredClone(gameState)

    if (action.type === 'MOVE') {
        const { id, to } = action.payload
        if (id !== playerId) return
        if (next.entities[id].hasMoved) return
        if (!canMove(next, id, to)) return
        next = applyMove(next, id, to)
        next = resolveTileTrigger(next, id, TILE_EFFECT_TRIGGERS.ON_ENTER)
    }
    else if (action.type === 'MELEE') {
        const { attackerId, targetId } = action.payload
        if (attackerId !== playerId) return
        if (next.entities[attackerId].hasAttacked) return
        if (!canMelee(next, attackerId, targetId)) return
        next = applyMelee(next, attackerId, targetId)
    }
    else if (action.type === 'MAGIC') {
        const { attackerId, targetId } = action.payload
        if (attackerId !== playerId) return
        if (next.entities[attackerId].hasAttacked) return
        if (!canMagic(next, attackerId, targetId)) return
        next = applyMagic(next, attackerId, targetId)
    }
    else if (action.type === 'PASS') {
        next.log.push(`${playerId} passe son tour`)
        next = endTurn(next)
    }
    else return

    const actor = next.entities[playerId]
    if (actor && actor.hasMoved && actor.hasAttacked) {
        next = endTurn(next)
    }

    if (next.entities.player1.hp <= 0 || next.entities.player2.hp <= 0) {
        next = createInitialState()
    }

        gameState = next
        broadcast()
    })

    socket.on('reset', () => {
        gameState = createInitialState()
        broadcast()
    })

    socket.on('disconnect', () => {
        delete playerSlots[socket.id]
    })
})

httpServer.listen(3001, () => console.log('Game server on :3001'))