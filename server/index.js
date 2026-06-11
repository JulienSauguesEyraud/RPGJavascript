import { createServer } from 'http'
import { Server } from 'socket.io'
import {
  createInitialState,
  canMove, applyMove,
  canMelee, applyMelee,
  canFireball, applyFireball,
  canThunder, applyThunder,
  canTeleport, applyTeleport,
  TILE_EFFECT_TRIGGERS,
  resolveTileTrigger,
  createEventEffect,
  applyEventEffect,
  removeEventEffect,
  MONSTER_TYPES,
  distance8,
  checkDeadMonsters
} from '../src/lib/game/index.js'
import {randomInt} from "node:crypto";

const httpServer = createServer()
const io = new Server(httpServer, { cors: { origin: '*' } })

const EVENT_INTERVAL = 20000
const EVENT_DURATION = 5000

const rooms = {}

function generateCode() {
  let code = Math.random().toString(36).slice(2, 7).toUpperCase()
  while (rooms[code]) code = Math.random().toString(36).slice(2, 7).toUpperCase()
  return code
}

function broadcastRoom(code) {
  const room = rooms[code]
  if (!room) return
  io.to(code).emit('state', { ...room.state, serverTime: Date.now() })
}

function sendToPlayer(room, playerId, state) {
  const socketId = room.slots[playerId]
  if (socketId) io.to(socketId).emit('state', state)
}

function handleLeave(socket) {
  const code = socket.data.code
  const room = rooms[code]
  if (!room) return
  const wasPlayer = room.slots.player1 === socket.id ? 'player1'
      : room.slots.player2 === socket.id ? 'player2'
          : null
  if (wasPlayer) {
    room.slots[wasPlayer] = null
    clearInterval(room.interval)
    io.to(code).emit('opponent_left')
  }
  if (!room.slots.player1 && !room.slots.player2) {
    delete rooms[code]
  }
}
function startRoomLoop(code) {
  const room = rooms[code]
  if (!room) return

  room.interval = setInterval(() => {
    if (!rooms[code]) { clearInterval(room.interval); return }
    const now = Date.now()
    let changed = false

    for (const id in room.state.entities) {
      const entity = room.state.entities[id]
      if (!entity) continue
      if (entity.gambler && entity.gamblerInterval && entity.hpRegen && entity.mpRegen) {
        if (now - entity.lastGambler < entity.gamblerInterval) continue
        const rand = randomInt(4)
        if (rand === 0) {
          if (entity.mp >= entity.maxMp) continue
          room.state.entities[id].mp = Math.min(entity.maxMp, entity.mp + entity.mpRegen)
          room.state.entities[id].lastGambler = now
          room.state.log.push(id + ' gagne ' + entity.mpRegen + ' MP')
          changed = true
        }
        else if (rand === 1) {
          if (entity.mp <= 0) continue
          room.state.entities[id].mp = Math.max(0, entity.mp - entity.mpRegen)
          room.state.entities[id].lastGambler = now
          room.state.log.push(id+ ' perd ' + entity.mpRegen + ' MP')
          changed = true
        }
        else if (rand === 2) {
          if (entity.hp >= entity.maxHp) continue
          room.state.entities[id].hp = Math.min(entity.maxHp, entity.hp + entity.hpRegen)
          room.state.entities[id].lastGambler = now
          room.state.log.push(id + ' gagne ' + entity.hpRegen + ' HP')
          changed = true
        }
        else if (rand === 3) {
          if (entity.hp <= 0) continue
          room.state.entities[id].hp = Math.max(0, entity.hp - entity.hpRegen)
          room.state.entities[id].lastGambler = now
          room.state.log.push(id + ' perd ' + entity.hpRegen + ' HP')
          if (entity.hp <= 0) {
            const fresh = createInitialState(room.classes)
            fresh.lastEventAt = Date.now()
            room.state = fresh
          }
          changed = true
        }
      }
      else if (entity.mpRegen && entity.mpRegenInterval) {
        if (entity.mp >= entity.maxMp) continue
        if (now - entity.lastMpRegen >= entity.mpRegenInterval) {
          room.state.entities[id].mp = Math.min(entity.maxMp, entity.mp + entity.mpRegen)
          room.state.entities[id].lastMpRegen = now
          room.state.log.push(id + ' gagne ' + entity.mpRegen + ' MP')
          changed = true
        }
      }
      else if (entity.hpRegen && entity.hpRegenInterval) {
        if (entity.hp >= entity.maxHp) continue
        if (now - entity.lastHpRegen >= entity.hpRegenInterval) {
          room.state.entities[id].hp = Math.min(entity.maxHp, entity.hp + entity.hpRegen)
          room.state.entities[id].lastHpRegen = now
          room.state.log.push(id + ' gagne ' + entity.hpRegen + ' HP')
          changed = true
        }
      }
    }

    for (const monster of room.state.monsters ?? []) {
      const def = MONSTER_TYPES[monster.type]
      if (!def) continue

      for (const playerId of ['player1', 'player2']) {
        const player = room.state.entities[playerId]
        if (!player) continue

        const isAdjacent = distance8(player, monster) === 1

        if (isAdjacent) {
          if (!monster.adjacentSince[playerId]) {
            monster.adjacentSince[playerId] = now
          }
          if (now - monster.adjacentSince[playerId] >= def.attackDelay) {
            room.state.entities[playerId].hp -= def.damage
            monster.adjacentSince[playerId] = now
            monster.lastAttack = now
            room.state.log.push(`${monster.type} attaque ${playerId} pour ${def.damage} dégâts`)
            changed = true

            if (room.state.entities[playerId].hp <= 0) {
              const fresh = createInitialState(room.classes)
              fresh.lastEventAt = now
              room.state = fresh
              changed = true
              break
            }
          }
        } else {
          monster.adjacentSince[playerId] = 0
        }
      }
    }

    if (!room.state.activeEvent && now - room.state.lastEventAt >= EVENT_INTERVAL) {
      room.state.activeEvent = createEventEffect()
      room.state.activeEvent.startedAt = now
      room.state = applyEventEffect(room.state, 'player1', room.state.activeEvent)
      room.state = applyEventEffect(room.state, 'player2', room.state.activeEvent)
      room.state.log.push(`Événement : ${room.state.activeEvent.type} (5 sec)`)
      changed = true
    }

    if (room.state.activeEvent && now - room.state.activeEvent.startedAt >= EVENT_DURATION) {
      room.state = removeEventEffect(room.state, 'player1', room.state.activeEvent)
      room.state = removeEventEffect(room.state, 'player2', room.state.activeEvent)
      room.state.log.push(`Événement ${room.state.activeEvent.type} terminé`)
      room.state.activeEvent = null
      room.state.lastEventAt = now
      changed = true
    }

    if (changed) broadcastRoom(code)
  }, 1000)
}

io.on('connection', (socket) => {
  socket.on('create', (className) => {
    const code = generateCode()
    rooms[code] = {
      state: null,
      slots: { player1: socket.id, player2: null },
      classes: { player1: className ?? 'warrior', player2: null },
      interval: null,
    }
    socket.join(code)
    socket.data.code = code
    socket.data.playerId = 'player1'
    socket.emit('created', code)
    socket.emit('assigned', 'player1')
  })

  socket.on('join', ({ code, className }) => {
    const room = rooms[code]
    if (!room) {
      socket.emit('error', 'Code invalide')
      return
    }
    if (!room.slots.player2) {
      room.slots.player2 = socket.id
      room.classes.player2 = className ?? 'warrior'
      socket.join(code)
      socket.data.code = code
      socket.data.playerId = 'player2'

      const state = createInitialState(room.classes)
      state.lastEventAt = Date.now()
      room.state = state

      socket.emit('joined', code)
      socket.emit('assigned', 'player2')
      broadcastRoom(code)
      io.to(room.slots.player1).emit('opponent_joined')
      startRoomLoop(code)
    }
    else if (!room.slots.player1) {
      room.slots.player1 = socket.id
      room.classes.player1 = className ?? 'warrior'
      socket.join(code)
      socket.data.code = code
      socket.data.playerId = 'player1'

      const state = createInitialState(room.classes)
      state.lastEventAt = Date.now()
      room.state = state

      socket.emit('joined', code)
      socket.emit('assigned', 'player1')
      broadcastRoom(code)
      io.to(room.slots.player2).emit('opponent_joined')
      startRoomLoop(code)
    }
    else {
      socket.emit('error', 'Partie pleine')
    }
  })

  socket.on('action', (action) => {
    const code = socket.data.code
    const playerId = socket.data.playerId
    const room = rooms[code]
    if (!room || !room.state) return

    const now = Date.now()
    let next = structuredClone(room.state)
    const entity = next.entities[playerId]
    if (!entity) return

    const cooldownMove = entity.cooldownMove   ?? 3000
    const cooldownAttack = entity.cooldownAttack ?? 5000

    if (action.type === 'MOVE') {
      const { to } = action.payload
      if (now - entity.lastMoved < cooldownMove) {
        next.log.push('Déplacement en recharge')
        sendToPlayer(room, playerId, next)
        return
      }
      if (!canMove(next, playerId, to)) {
        sendToPlayer(room, playerId, next)
        return
      }
      next = applyMove(next, playerId, to)
      if(!next.entities[playerId].infiniteMove) {
        next.entities[playerId].lastMoved = now
      }
      next.entities[playerId].lastAction = 'move'
      next = resolveTileTrigger(next, playerId, TILE_EFFECT_TRIGGERS.ON_ENTER)
    }
    else if (action.type === 'MELEE') {
      const { targetId } = action.payload
      if (now - entity.lastAttacked < cooldownAttack) {
        next.log.push('Attaque en recharge')
        sendToPlayer(room, playerId, next)
        return
      }
      if (!canMelee(next, playerId, targetId)) {
        sendToPlayer(room, playerId, next)
        return
      }
      next = applyMelee(next, playerId, targetId)
      if (next.entities[playerId].doubleAttack) {
        next.entities[playerId].doubleAttack = false
      } else {
        next.entities[playerId].lastAttacked = now
      }
      next.entities[playerId].lastAction = 'melee'
      checkDeadMonsters(next, playerId)
    }
    else if (action.type === 'FIREBALL') {
      const { targetId } = action.payload
      if (now - entity.lastAttacked < cooldownAttack) {
        next.log.push('Attaque en recharge')
        sendToPlayer(room, playerId, next)
        return
      }
      if (!canFireball(next, playerId, targetId)) {
        sendToPlayer(room, playerId, next)
        return
      }
      next = applyFireball(next, playerId, targetId)
      if (next.entities[playerId].doubleAttack) {
        next.entities[playerId].doubleAttack = false
      } else {
        next.entities[playerId].lastAttacked = now
      }
      next.entities[playerId].lastAction = 'fireball'
      checkDeadMonsters(next, playerId)
    }
    else if (action.type === 'THUNDER') {
      const { targetId } = action.payload
      if (now - entity.lastAttacked < cooldownAttack) {
        next.log.push('Attaque en recharge')
        sendToPlayer(room, playerId, next)
        return
      }
      if (!canThunder(next, playerId, targetId)) {
        sendToPlayer(room, playerId, next)
        return
      }
      next = applyThunder(next, playerId, targetId)
      if (next.entities[playerId].doubleAttack) {
        next.entities[playerId].doubleAttack = false
      } else {
        next.entities[playerId].lastAttacked = now
      }
      next.entities[playerId].lastAction = 'thunder'
      checkDeadMonsters(next, playerId)
    }
    else if (action.type === 'TELEPORT') {
      const { to } = action.payload
      if (now - entity.lastAttacked < cooldownAttack) {
        next.log.push('Attaque en recharge')
        sendToPlayer(room, playerId, next)
        return
      }
      if (!canTeleport(next, playerId, to)) {
        sendToPlayer(room, playerId, next)
        return
      }
      next = applyTeleport(next, playerId, to)
      if (next.entities[playerId].doubleAttack) {
        next.entities[playerId].doubleAttack = false
      } else {
        next.entities[playerId].lastAttacked = now
      }
      next.entities[playerId].lastAction = 'teleport'
      next = resolveTileTrigger(next, playerId, TILE_EFFECT_TRIGGERS.ON_ENTER)
    }
    else return

    if (next.entities.player1?.hp <= 0 || next.entities.player2?.hp <= 0) {
      const fresh = createInitialState(room.classes)
      fresh.lastEventAt = Date.now()
      next = fresh
    }

    room.state = next
    broadcastRoom(code)
  })

  socket.on('reset', () => {
    const room = rooms[socket.data.code]
    if (!room) return
    const fresh = createInitialState(room.classes)
    fresh.lastEventAt = Date.now()
    room.state = fresh
    broadcastRoom(socket.data.code)
  })

  socket.on('leave', () => handleLeave(socket));
  socket.on('disconnect', () => handleLeave(socket));
})

httpServer.listen(3001, () => console.log('Game server on :3001'))