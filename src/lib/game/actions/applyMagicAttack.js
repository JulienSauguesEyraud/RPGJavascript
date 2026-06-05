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
  if(attackerId === targetId) {
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
  if(attackerId === targetId) {
    state.log.push('Vous ne pouvez pas vous attaquer vous même')
    return false
  }
  return true
}

export function applyThunder(state, attackerId, targetId) {
  const next = structuredClone(state)
  const attacker = next.entities[attackerId]
  const cost = 10
  const dmg = 18 + (attacker.magicBonus ?? 0)
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