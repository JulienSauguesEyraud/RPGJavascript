import {createInitialState} from "../index.js";

export function checkClassesTimeSpecificities(room, now) {
    let changed = false
    for (const id in room.state.entities) {
        const entity = room.state.entities[id]
        if (!entity) continue
        if(gamblerApplyEffect(room, now, entity, id)) {
            changed = true
            continue
        }
        if (mageRegenMp(room, now, entity, id)) {
            changed = true
            continue
        }
        if (priestRegenHp(room, now, entity, id)) {
            changed = true
        }
    }
    return changed
}
function mageRegenMp(room, now, entity, id) {
    if (entity.mpRegen && entity.mpRegenInterval) {
        if (entity.mp >= entity.maxMp) return false
        if (now - entity.lastMpRegen >= entity.mpRegenInterval) {
            room.state.entities[id].mp = Math.min(entity.maxMp, entity.mp + entity.mpRegen)
            room.state.entities[id].lastMpRegen = now
            room.state.log.push(id + ' gagne ' + entity.mpRegen + ' MP')
            return true
        }
    }
    return false
}

function priestRegenHp(room, now, entity, id) {
    if (entity.hpRegen && entity.hpRegenInterval) {
        if (entity.hp >= entity.maxHp) return false
        if (now - entity.lastHpRegen >= entity.hpRegenInterval) {
            room.state.entities[id].hp = Math.min(entity.maxHp, entity.hp + entity.hpRegen)
            room.state.entities[id].lastHpRegen = now
            room.state.log.push(id + ' gagne ' + entity.hpRegen + ' HP')
            return true
        }
    }
    return false
}

function gamblerApplyEffect(room, now, entity, id) {
    if (entity.gambler && entity.gamblerInterval && entity.hpRegen && entity.mpRegen) {
        if (now - entity.lastGambler < entity.gamblerInterval) return false
        const rand = Math.floor(Math.random() * 4)
        if (rand === 0) {
            return gamblerRegenMp(room, now, entity, id)
        }
        else if (rand === 1) {
            return gamblerLoseMp(room, now, entity, id)
        }
        else if (rand === 2) {
            return gamblerRegenHp(room, now, entity, id)
        }
        else if (rand === 3) {
            return gamblerLoseHp(room, now, entity, id)
        }
    }
    return false
}

function gamblerRegenMp(room, now, entity, id) {
    if (entity.mp >= entity.maxMp) return false
    room.state.entities[id].mp = Math.min(entity.maxMp, entity.mp + entity.mpRegen)
    room.state.entities[id].lastGambler = now
    room.state.log.push(id + ' gagne ' + entity.mpRegen + ' MP')
    return true
}

function gamblerLoseMp(room, now, entity, id) {
    if (entity.mp <= 0) return false
    room.state.entities[id].mp = Math.max(0, entity.mp - entity.mpRegen)
    room.state.entities[id].lastGambler = now
    room.state.log.push(id+ ' perd ' + entity.mpRegen + ' MP')
    return true
}

function gamblerRegenHp(room, now, entity, id) {
    if (entity.hp >= entity.maxHp) return false
    room.state.entities[id].hp = Math.min(entity.maxHp, entity.hp + entity.hpRegen)
    room.state.entities[id].lastGambler = now
    room.state.log.push(id + ' gagne ' + entity.hpRegen + ' HP')
    return true
}

function gamblerLoseHp(room, now, entity, id) {
    if (entity.hp <= 0) return false
    room.state.entities[id].hp = Math.max(0, entity.hp - entity.hpRegen)
    room.state.entities[id].lastGambler = now
    room.state.log.push(id + ' perd ' + entity.hpRegen + ' HP')
    if (entity.hp <= 0) {
        const fresh = createInitialState(room.classes)
        fresh.lastEventAt = Date.now()
        room.state = fresh
    }
    return true
}