import { createEventEffect } from "./index.js";
import { applyEventEffect, removeEventEffect } from "./applyEventEffect.js";
import { EVENT_CONFIG } from "../constants.js";

export function checkEventModification(room, now) {
    if (!room.state.activeEvent && now - room.state.lastEventAt >= EVENT_CONFIG.INTERVAL) {
        room.state.activeEvent = createEventEffect()
        room.state.activeEvent.startedAt = now

        for (const id in room.state.entities) {
            if (id.startsWith('player')) {
                room.state = applyEventEffect(room.state, id, room.state.activeEvent)
            }
        }

        room.state.log.push(`Événement : ${room.state.activeEvent.type} (${EVENT_CONFIG.DURATION / 1000} sec)`)
        return true
    }

    if (room.state.activeEvent && now - room.state.activeEvent.startedAt >= EVENT_CONFIG.DURATION) {

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