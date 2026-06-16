import {
    applyFireball, applyMelee, applyMove, applyTeleport, applyThunder,
    canFireball, canMelee, canMove, canTeleport, canThunder,
    checkDeadMonsters, resolveTileTrigger, TILE_EFFECT_TRIGGERS
} from "../index.js";
import { ACTIONS_CONFIG } from "../constants.js";

function sendToPlayer(room, io, playerId, state) {
    const socketId = room.slots[playerId]
    if (socketId) io.to(socketId).emit('state', state)
}

function checkAttackCooldown(next, entity, playerId, now, room, io, actionType) {
    const maxCooldown = entity.cooldownAttack ?? ACTIONS_CONFIG[actionType].cooldown;
    if (now - entity.lastAttacked < maxCooldown) {
        next.log.push('Attaque en recharge')
        sendToPlayer(room, io, playerId, next)
        return false
    }
    return true
}

function handleAttackResult(next, playerId, now, actionType) {
    if (next.entities[playerId].doubleAttack) {
        next.entities[playerId].doubleAttack = false
    } else {
        next.entities[playerId].lastAttacked = now
    }
    next.entities[playerId].lastAction = actionType
    checkDeadMonsters(next, playerId)
    return next
}

export const ACTION_HANDLERS = {
    'MOVE': ({ next, entity, action, playerId, now, room, io }) =>
        moveAction(next, entity, action, playerId, now, room, io),
    'MELEE': ({ next, entity, action, playerId, now, room, io }) =>
        meleeAction(next, entity, action, playerId, now, room, io),
    'FIREBALL': ({ next, entity, action, playerId, now, room, io }) =>
        fireballAction(next, entity, action, playerId, now, room, io),
    'THUNDER': ({ next, entity, action, playerId, now, room, io }) =>
        thunderAction(next, entity, action, playerId, now, room, io),
    'TELEPORT': ({ next, entity, action, playerId, now, room, io }) =>
        teleportAction(next, entity, action, playerId, now, room, io),
}

function moveAction(next, entity, action, playerId, now, room, io) {
    const { to } = action.payload
    const cooldownMove = entity.cooldownMove ?? ACTIONS_CONFIG.move.cooldown

    if (now - entity.lastMoved < cooldownMove) {
        next.log.push('Déplacement en recharge')
        sendToPlayer(room, io, playerId, next)
        return
    }
    if (!canMove(next, playerId, to)) {
        sendToPlayer(room, io, playerId, next)
        return
    }
    next = applyMove(next, playerId, to)
    if(!next.entities[playerId].infiniteMove) {
        next.entities[playerId].lastMoved = now
    }
    next.entities[playerId].lastAction = 'move'
    next = resolveTileTrigger(next, playerId, TILE_EFFECT_TRIGGERS.ON_ENTER)
    return next
}

function meleeAction(next, entity, action, playerId, now, room, io) {
    const { targetId } = action.payload
    if (!checkAttackCooldown(next, entity, playerId, now, room, io, 'melee')) return
    if (!canMelee(next, playerId, targetId)) {
        sendToPlayer(room, io, playerId, next)
        return
    }
    next = applyMelee(next, playerId, targetId)
    return handleAttackResult(next, playerId, now, 'melee')
}

function fireballAction(next, entity, action, playerId, now, room, io) {
    const { targetId } = action.payload
    if (!checkAttackCooldown(next, entity, playerId, now, room, io, 'fireball')) return
    if (!canFireball(next, playerId, targetId)) {
        sendToPlayer(room, io, playerId, next)
        return
    }
    next = applyFireball(next, playerId, targetId)
    return handleAttackResult(next, playerId, now, 'fireball')
}

function thunderAction(next, entity, action, playerId, now, room, io) {
    const { targetId } = action.payload
    if (!checkAttackCooldown(next, entity, playerId, now, room, io, 'thunder')) return
    if (!canThunder(next, playerId, targetId)) {
        sendToPlayer(room, io, playerId, next)
        return
    }
    next = applyThunder(next, playerId, targetId)
    return handleAttackResult(next, playerId, now, 'thunder')
}

function teleportAction(next, entity, action, playerId, now, room, io) {
    const { to } = action.payload
    if (!checkAttackCooldown(next, entity, playerId, now, room, io, 'teleport')) return
    if (!canTeleport(next, playerId, to)) {
        sendToPlayer(room, io, playerId, next)
        return
    }
    next = applyTeleport(next, playerId, to)
    return handleAttackResult(next, playerId, now, 'teleport')
}