import {
    checkClassesTimeSpecificities,
    checkEventModification,
    checkMonstersAttacks,
    createInitialState,
} from "../src/lib/game/index.js";
import {ACTION_HANDLERS} from "../src/lib/game/actions/actionHandlers.js";
import {checkVictory} from "../src/lib/game/globalUtils.js";

const rooms = {}

function startRoomLoop(io, code) {
    const room = rooms[code]
    if (!room) return

    room.interval = setInterval(() => {
        const room = rooms[code]
        if (!room || room.status !== 'playing') {
            clearInterval(room.interval);
            return;
        }

        const now = Date.now()
        let changed = false

        if (checkClassesTimeSpecificities(room, io, now, code)) changed = true
        if (checkMonstersAttacks(room, io, now, code)) changed = true
        if (checkEventModification(room, now)) changed = true
        if (changed) broadcastRoom(io, code)
    }, 1000)
}

function generateCode() {
    let code = Math.random().toString(36).slice(2, 7).toUpperCase()
    while (rooms[code]) code = Math.random().toString(36).slice(2, 7).toUpperCase()
    return code
}

function broadcastRoom(io, code) {
    const room = rooms[code]
    if (!room) return
    io.to(code).emit('state', { ...room.state, serverTime: Date.now() })
}

function assignPlayer(io, socket, room, code, playerId, className) {
    room.slots[playerId] = socket.id
    room.classes[playerId] = className ?? 'warrior'

    socket.join(code)
    socket.data.code = code
    socket.data.playerId = playerId

    socket.emit('joined', code)
    socket.emit('assigned', playerId)
    socket.to(code).emit('opponent_joined', playerId)

    io.to(code).emit('lobby_update', { slots: room.slots })
}

export function handleCreate(socket, className) {
    const code = generateCode()
    rooms[code] = {
        status: 'waiting',
        state: null,
        slots: { player1: socket.id, player2: null, player3: null, player4: null },
        classes: { player1: className ?? 'warrior', player2: null, player3: null, player4: null },
        interval: null,
    }
    socket.join(code)
    socket.data.code = code
    socket.data.playerId = 'player1'
    socket.emit('created', code)
    socket.emit('assigned', 'player1')
    socket.emit('lobby_update', { slots: rooms[code].slots })
}

export function handleStart(io, socket) {
    const room = rooms[socket.data.code]
    if (!room) return

    let hostSlot = null
    for (const key in room.slots) {
        if (room.slots[key] !== null) {
            hostSlot = key
            break
        }
    }

    if (socket.id !== room.slots[hostSlot]) {
        return socket.emit('error', 'Seul le premier joueur de la salle peut lancer la partie')
    }

    let activePlayers = 0 
    for (const key in room.slots) {
        if (room.slots[key] !== null) activePlayers++
    }

    if (activePlayers >= 2) {
        room.status = 'playing'
        room.state = createInitialState(room.classes)
        room.state.lastEventAt = Date.now()
        startRoomLoop(io, socket.data.code)
        io.to(socket.data.code).emit('game_started', room.state)
    } else {
        socket.emit('error', 'Il faut au moins 2 joueurs')
    }
}

export function handleJoin(io, socket, code, className) {
    const room = rooms[code]
    if (!room) {
        return socket.emit('error', 'Code invalide')
    }

    let availableSlot = null
    for (const key in room.slots) {
        if (room.slots[key] === null) {
            availableSlot = key
            break
        }
    }

    if (availableSlot) {
        assignPlayer(io, socket, room, code, availableSlot, className)
        socket.emit('lobby_update', { slots: room.slots })
    } else {
        socket.emit('error', 'Partie pleine')
    }
}

export function handleReset(io, socket) {
    const room = rooms[socket.data.code]
    if (!room) return
    const fresh = createInitialState(room.classes)
    fresh.lastEventAt = Date.now()
    room.state = fresh
    broadcastRoom(io, socket.data.code)
}

export function handleLeave(io, socket) {
    const code = socket.data.code
    const room = rooms[code]
    if (!room) return

    let wasPlayer = null
    for (const p in room.slots) {
        if (room.slots[p] === socket.id) wasPlayer = p
    }

    if (wasPlayer) {
        room.slots[wasPlayer] = null
        room.classes[wasPlayer] = null

        socket.leave(code)
        socket.data.code = null
        socket.data.playerId = null

        let remainingPlayers = 0
        for (const p in room.slots) {
            if (room.slots[p] !== null) remainingPlayers++
        }

        if (remainingPlayers < 2 && room.interval) {
            clearInterval(room.interval)
            room.interval = null
            room.status = 'waiting'
        }

        io.to(code).emit('opponent_left', wasPlayer)
        io.to(code).emit('lobby_update', { slots: room.slots })
        if (room.state) broadcastRoom(io, code)
    }

    let allEmpty = true
    for (const p in room.slots) {
        if (room.slots[p] !== null) allEmpty = false
    }
    if (allEmpty) delete rooms[code]
}

export function handleAction(io, socket, action) {
    const code = socket.data.code
    const playerId = socket.data.playerId
    const room = rooms[code]
    if (!room || !room.state) return

    const now = Date.now()
    let next = structuredClone(room.state)
    const entity = next.entities[playerId]
    if (!entity) return

    const handler = ACTION_HANDLERS[action.type]
    if (!handler) return

    const resultState = handler({ next, entity, action, playerId, now, room, io })
    if (!resultState) return
    next = resultState

    for (const key in next.entities) {
        if (key.startsWith('player') && next.entities[key].hp <= 0) {
            next.log.push(`${key} est mort !`)
            delete next.entities[key]
        }
    }
    room.state = next

    if (checkVictory(io, room, code)) {
        return
    }
    broadcastRoom(io, code)
}