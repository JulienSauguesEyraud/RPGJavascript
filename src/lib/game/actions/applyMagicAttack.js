import { distance8 } from '../index.js'

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
  const attacker = next.entities[attackerId]
  const cost = 2
  const dmg = 5 + (attacker.magicBonus ?? 0)
  delete attacker.magicBonus
  attacker.mp -= cost
  if (attacker.doubleAttack) {
    attacker.doubleAttack = false
  }
  else {
    attacker.hasAttacked = true
  }
  next.entities[targetId].hp -= dmg
  next.log.push(`${attackerId} lance un sort sur ${targetId} pour ${dmg} dégâts (-${cost} MP)`)
  return next
}
