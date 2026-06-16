import { distanceFromTile } from '../index.js'
import { ACTIONS_CONFIG } from '../constants.js'

export function canFireball(state, attackerId, targetId) {
  const attacker = state.entities[attackerId]
  if (!attacker) {
    state.log.push('Attaquant introuvable');
    return false
  }
  const config = ACTIONS_CONFIG.fireball;

  if (attacker.mp < config.mp) {
    state.log.push('MP insuffisant');
    return false
  }
  if (attackerId === targetId) {
    state.log.push('Vous ne pouvez pas vous attaquer vous même');
    return false
  }

  const target = state.entities[targetId] || state.monsters?.find(m => m.id === targetId)
  if (target) {
    if (distanceFromTile(attacker, target) > config.range) {
      state.log.push('Cible hors de portée');
      return false
    }
    return true
  }

  state.log.push('Cible introuvable')
  return false
}

export function applyFireball(state, attackerId, targetId) {
  const next = structuredClone(state)
  const attacker = next.entities[attackerId]
  const dmg = ACTIONS_CONFIG.fireball.damage + (attacker.magicBonus ?? 0)
  delete attacker.magicBonus

  attacker.mp -= ACTIONS_CONFIG.fireball.mp
  const target = next.entities[targetId] || next.monsters?.find(m => m.id === targetId)
  if (target) {
    target.hp -= dmg
    next.log.push(`${attackerId} lance un sort sur ${targetId} pour ${dmg} dégâts`)
  }
  return next
}

export function canThunder(state, attackerId, targetId) {
  const attacker = state.entities[attackerId]
  if (!attacker) {
    state.log.push('Attaquant introuvable');
    return false
  }

  if (attacker.mp < ACTIONS_CONFIG.thunder.mp) {
    state.log.push('MP insuffisant');
    return false
  }
  if (attackerId === targetId) {
    state.log.push('Vous ne pouvez pas vous attaquer vous même');
    return false
  }

  const target = state.entities[targetId] || state.monsters?.find(m => m.id === targetId)
  if (target) return true

  state.log.push('Cible introuvable')
  return false
}

export function applyThunder(state, attackerId, targetId) {
  const next = structuredClone(state)
  const attacker = next.entities[attackerId]
  const dmg = ACTIONS_CONFIG.thunder.damage + (attacker.magicBonus ?? 0)
  delete attacker.magicBonus

  attacker.mp -= ACTIONS_CONFIG.thunder.mp
  const target = next.entities[targetId] || next.monsters?.find(m => m.id === targetId)
  if (target) {
    target.hp -= dmg
    next.log.push(`${attackerId} lance un sort sur ${targetId} pour ${dmg} dégâts`)
  }
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
  for (const m of state.monsters ?? []) {
    if (m.x === to.x && m.y === to.y) {
      state.log.push('Position occupée');
      return false
    }
  }
  if (actor.mp < ACTIONS_CONFIG.teleport.mp) {
    state.log.push('MP insuffisant');
    return false
  }
  return true
}

export function applyTeleport(state, id, to) {
  const next = structuredClone(state)
  const actor = next.entities[id]
  actor.x = to.x
  actor.y = to.y
  actor.mp -= ACTIONS_CONFIG.teleport.mp
  next.log.push(`${id} se téléporte en (${to.x},${to.y})`)
  return next
}