import {createEventEffect} from "./index.js";
import {applyEventEffect, removeEventEffect} from "./applyEventEffect.js";

const EVENT_INTERVAL = 20000
const EVENT_DURATION = 5000

export function checkEventModification(room, now) {
    if (!room.state.activeEvent && now - room.state.lastEventAt >= EVENT_INTERVAL) {
        room.state.activeEvent = createEventEffect()
        room.state.activeEvent.startedAt = now

        for (const id in room.state.entities) {
            if (id.startsWith('player')) {
                room.state = applyEventEffect(room.state, id, room.state.activeEvent)
            }
        }

        room.state.log.push(`Événement : ${room.state.activeEvent.type} (5 sec)`)
        return true
    }

    if (room.state.activeEvent && now - room.state.activeEvent.startedAt >= EVENT_DURATION) {

        for (const id in room.state.entities) {
            if (id.startsWith('player')) {
                room.state = removeEventEffect(room.state, id, room.state.activeEvent)
            }
        }

        room.state.log.push(`Événement ${room.state.activeEvent.type} terminé`)
        room.state.activeEvent = null
        room.state.lastEventAt = now
        return true
    }

    return false
}