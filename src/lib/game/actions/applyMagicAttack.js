import { distance8 } from '../resolution/distance.js'

export function canMagic(state, attackerId, targetId) {
  const attacker = state.entities[attackerId]
  const target = state.entities[targetId]
  if (!attacker || !target) {
    state.log.push('Attaquant ou cible introuvable')
    return false
  }
  const cost = 2
  if (attacker.mp < cost) {
    state.log.push('MP insuffisant pour lancer un sort')
    return false
  }
  if (distance8(attacker, target) > 2) {
    state.log.push('Cible hors de portée')
    return false
  }
  return true
}

export function applyMagic(state, attackerId, targetId) {
  const next = structuredClone(state)
  const cost = 2
  const dmg = 5
  next.entities[attackerId].mp -= cost
  next.entities[attackerId].attack = true
  next.entities[targetId].hp -= dmg
  next.log.push(`${attackerId} lance un sort sur ${targetId} pour ${dmg} dégâts (-${cost} MP)`)
  return next
}
