import { distanceFromTile } from '../index.js'
import {ACTIONS_CONFIG} from "../constants.js";

export function canMelee(state, attackerId, targetId) {
  const attacker = state.entities[attackerId]
  if (!attacker) {
    state.log.push('Attaquant introuvable');
    return false
  }

  if (attackerId === targetId) {
    state.log.push('Vous ne pouvez pas vous attaquer vous même');
    return false
  }

  const target = state.entities[targetId] || state.monsters?.find(m => m.id === targetId)
  if (target) {
    const dist = distanceFromTile(attacker, target);
    if (dist > ACTIONS_CONFIG.melee.range || dist === 0) {
      state.log.push('Cible hors de portée');
      return false
    }
    return true
  }

  state.log.push('Cible introuvable')
  return false
}

export function applyMelee(state, attackerId, targetId) {
  const next = structuredClone(state)
  const attacker = next.entities[attackerId]
  const dmg = 5 + (attacker.meleeClassBonus ?? 0) + (attacker.meleeBonus ?? 0)
  delete attacker.meleeBonus

  const target = next.entities[targetId] || next.monsters?.find(m => m.id === targetId)
  if (target) {
    target.hp -= dmg
  }
  next.log.push(`${attackerId} frappe ${targetId} pour ${dmg} dégâts`)
  return next
}