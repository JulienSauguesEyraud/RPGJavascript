import { distance8 } from '../index.js'

export function canMelee(state, attackerId, targetId) {
  const attacker = state.entities[attackerId]
  const target = state.entities[targetId]
  if (!attacker || !target) {
    state.log.push('Attaquant ou cible introuvable')
    return false
  }
  if(attackerId === targetId) {
    state.log.push('Vous ne pouvez pas vous attaquer vous même')
    return false
  }
  if (distance8(attacker, target) !== 1) {
    state.log.push('Cible hors de portée')
    return false
  }
  return true
}

export function applyMelee(state, attackerId, targetId) {
  const next = structuredClone(state)
  const attacker = next.entities[attackerId]
  const dmg = 5 + (attacker.meleeBonus ?? 0)
  delete attacker.meleeBonus
  if (attacker.doubleAttack) {
    attacker.doubleAttack = false
  }
  else {
    attacker.hasAttacked = true
  }
  next.entities[targetId].hp -= dmg
  next.log.push(`${attackerId} frappe ${targetId} pour ${dmg} dégâts`)
  return next
}
