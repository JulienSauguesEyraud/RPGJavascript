import { distance8 } from '../index.js'

export function canFireball(state, attackerId, targetId) {
  const attacker = state.entities[attackerId]
  const target = state.entities[targetId]
  if (!attacker || !target) {
    state.log.push('Attaquant ou cible introuvable')
    return false
  }
  const cost = 4
  if (attacker.mp < cost) {
    state.log.push('MP insuffisant pour lancer ce sort')
    return false
  }
  if (attackerId === targetId) {
    state.log.push('Vous ne pouvez pas vous attaquer vous même')
    return false
  }
  if (distance8(attacker, target) > 2) {
    state.log.push('Cible hors de portée')
    return false
  }
  return true
}

export function applyFireball(state, attackerId, targetId) {
  const next = structuredClone(state)
  const attacker = next.entities[attackerId]
  const cost = 4
  const dmg = 8 + (attacker.magicBonus ?? 0)
  delete attacker.magicBonus
  attacker.mp -= cost
  next.entities[targetId].hp -= dmg
  next.log.push(`${attackerId} lance un sort sur ${targetId} pour ${dmg} dégâts (-${cost} MP)`)
  return next
}

export function canThunder(state, attackerId, targetId) {
  const attacker = state.entities[attackerId]
  const target = state.entities[targetId]
  if (!attacker || !target) {
    state.log.push('Attaquant ou cible introuvable')
    return false
  }
  const cost = 10
  if (attacker.mp < cost) {
    state.log.push('MP insuffisant pour lancer ce sort')
    return false
  }
  if (attackerId === targetId) {
    state.log.push('Vous ne pouvez pas vous attaquer vous même')
    return false
  }
  return true
}

export function applyThunder(state, attackerId, targetId) {
  const next = structuredClone(state)
  const attacker = next.entities[attackerId]
  const cost = 10
  const dmg = 14 + (attacker.magicBonus ?? 0)
  delete attacker.magicBonus
  attacker.mp -= cost
  next.entities[targetId].hp -= dmg
  next.log.push(`${attackerId} lance un sort sur ${targetId} pour ${dmg} dégâts (-${cost} MP)`)
  return next
}

export function canTeleport(state, id, to) {
  const actor = state.entities[id]
  if (!actor) {
    state.log.push('Entité introuvable')
    return false
  }
  if (to.x < 0 || to.y < 0 || to.x >= state.width || to.y >= state.height) {
    state.log.push('Position hors de la carte')
    return false
  }
  for (const k in state.entities) {
    if (state.entities[k].x === to.x && state.entities[k].y === to.y) {
      state.log.push('Position occupée')
      return false
    }
  }
  const cost = 5
  if (actor.mp < cost) {
    state.log.push('MP insuffisant pour lancer ce sort')
    return false
  }
  return true
}

export function applyTeleport(state, id, to) {
  const next = structuredClone(state)
  const actor = next.entities[id]
  actor.x = to.x
  actor.y = to.y
  const cost = 5
  actor.mp -= cost
  next.log.push(`${id} se téléporte en (${to.x},${to.y})`)
  return next
}