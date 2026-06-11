import {createEventEffect} from "./createEventEffects.js";
import {applyEventEffect, removeEventEffect} from "./applyEventEffect.js";

const EVENT_INTERVAL = 20000
const EVENT_DURATION = 5000

export function checkEventModification(room, now) {
    if (!room.state.activeEvent && now - room.state.lastEventAt >= EVENT_INTERVAL) {
        room.state.activeEvent = createEventEffect()
        room.state.activeEvent.startedAt = now
        room.state = applyEventEffect(room.state, 'player1', room.state.activeEvent)
        room.state = applyEventEffect(room.state, 'player2', room.state.activeEvent)
        room.state.log.push(`Événement : ${room.state.activeEvent.type} (5 sec)`)
        return true
    }

    if (room.state.activeEvent && now - room.state.activeEvent.startedAt >= EVENT_DURATION) {
        room.state = removeEventEffect(room.state, 'player1', room.state.activeEvent)
        room.state = removeEventEffect(room.state, 'player2', room.state.activeEvent)
        room.state.log.push(`Événement ${room.state.activeEvent.type} terminé`)
        room.state.activeEvent = null
        room.state.lastEventAt = now
        return true
    }
}