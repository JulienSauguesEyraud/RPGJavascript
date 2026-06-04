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

const rooms = {}

function generateCode() {
  return Math.random().toString(36).slice(2, 7).toUpperCase()
}

function broadcastRoom(code) {
  const room = rooms[code]
  if (!room) return
  io.to(code).emit('state', room.state)
}

io.on('connection', (socket) => {
  console.log('connexion', socket.id)

  socket.on('create', () => {
    let code = generateCode()
    while (rooms[code]) code = generateCode()
    rooms[code] = {
      state: createInitialState(),
      slots: { player1: socket.id, player2: null },
    }
    socket.join(code)
    socket.data.code = code
    socket.data.playerId = 'player1'
    socket.emit('created', code)
    socket.emit('assigned', 'player1')
    socket.emit('state', rooms[code].state)
    console.log(`Room ${code} créée par ${socket.id}`)
  })

  socket.on('join', (code) => {
    const room = rooms[code]
    if (!room) {
      socket.emit('error', 'Code invalide')
      return
    }
    if (room.slots.player2 !== null) {
      socket.emit('error', 'Partie pleine')
      return
    }
    room.slots.player2 = socket.id
    socket.join(code)
    socket.data.code = code
    socket.data.playerId = 'player2'
    socket.emit('joined', code)
    socket.emit('assigned', 'player2')
    socket.emit('state', room.state)
    io.to(room.slots.player1).emit('opponent_joined')
    console.log(`Room ${code} : player2 = ${socket.id}`)
  })

  socket.on('action', (action) => {
    const code = socket.data.code
    const playerId = socket.data.playerId
    const room = rooms[code]
    if (!room || room.state.turn !== playerId) return

    let next = structuredClone(room.state)

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
    if (actor?.hasMoved && actor?.hasAttacked) {
      next = endTurn(next)
    }

    if (next.entities.player1.hp <= 0 || next.entities.player2.hp <= 0) {
      next = createInitialState()
    }

    room.state = next
    broadcastRoom(code)
  })

  socket.on('reset', () => {
    const code = socket.data.code
    const room = rooms[code]
    if (!room) return
    room.state = createInitialState()
    broadcastRoom(code)
  })

  socket.on('disconnect', () => {
    const code = socket.data.code
    const room = rooms[code]
    if (!room) return
    const playerId = socket.data.playerId
    room.slots[playerId] = null
    io.to(code).emit('opponent_left')
    console.log(`${playerId} quitté room ${code}`)
    if (!room.slots.player1 && !room.slots.player2) {
      delete rooms[code]
      console.log(`Room ${code} supprimée`)
    }
  })
})

httpServer.listen(3001, () => console.log('Game server on :3001'))