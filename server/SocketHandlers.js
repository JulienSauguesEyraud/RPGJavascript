import {
    checkClassesTimeSpecificities,
    checkEventModification,
    checkMonstersAttacks,
    createInitialState,
} from "../src/lib/game/index.js";
import {ACTION_HANDLERS} from "./actionHandlers.js";

const rooms = {}

function startRoomLoop(io, code) {
    const room = rooms[code]
    if (!room) return

    room.interval = setInterval(() => {
        if (!rooms[code]) {
            clearInterval(room.interval);
            return
        }
        const now = Date.now()

        let changed = false
        if (checkClassesTimeSpecificities(room, now)) {
            changed = true
        }

        if (checkMonstersAttacks(room, now)) {
            changed = true
        }

        if(checkEventModification(room, now)) {
            changed = true
        }

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

export function handleCreate(socket, className) {
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
}

export function handleJoin(io, socket, code, className) {
    {
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
            broadcastRoom(io, code)
            io.to(room.slots.player1).emit('opponent_joined')
            startRoomLoop(io, code)
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
            broadcastRoom(io, code)
            io.to(room.slots.player2).emit('opponent_joined')
            startRoomLoop(io, code)
        }
        else {
            socket.emit('error', 'Partie pleine')
        }
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

    if (next.entities.player1?.hp <= 0 || next.entities.player2?.hp <= 0) {
        const fresh = createInitialState(room.classes)
        fresh.lastEventAt = Date.now()
        next = fresh
    }

    room.state = next
    broadcastRoom(io, code)
}