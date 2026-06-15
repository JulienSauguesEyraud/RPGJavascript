import { distanceFromTile } from '../index.js'

export function canFireball(state, attackerId, targetId) {
  const attacker = state.entities[attackerId]
  if (!attacker) {
    state.log.push('Attaquant introuvable');
    return false
  }
  const cost = 4
  if (attacker.mp < cost) {
    state.log.push('MP insuffisant');
    return false
  }
  if (attackerId === targetId) {
    state.log.push('Vous ne pouvez pas vous attaquer vous même');
    return false
  }

  const target = state.entities[targetId]
  if (target) {
    if (distanceFromTile(attacker, target) > 2) {
      state.log.push('Cible hors de portée');
      return false
    }
    return true
  }

  const monster = state.monsters?.find(m => m.id === targetId)
  if (monster) {
    if (distanceFromTile(attacker, monster) > 2) {
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
  const cost = 4
  const dmg = 8 + (attacker.magicBonus ?? 0)
  delete attacker.magicBonus
  attacker.mp -= cost
  const target = next.entities[targetId]
  if (target) {
    target.hp -= dmg
    next.log.push(`${attackerId} frappe ${targetId} pour ${dmg} dégâts`)
    return next
  }

  const monster = next.monsters?.find(m => m.id === targetId)
  if (monster) {
    monster.hp -= dmg
  }
  next.log.push(`${attackerId} lance un sort sur ${targetId} pour ${dmg} dégâts (-${cost} MP)`)
  return next
}

export function canThunder(state, attackerId, targetId) {
  const attacker = state.entities[attackerId]
  if (!attacker) {
    state.log.push('Attaquant introuvable');
    return false
  }
  const cost = 10
  if (attacker.mp < cost) {
    state.log.push('MP insuffisant');
    return false
  }
  if (attackerId === targetId) {
    state.log.push('Vous ne pouvez pas vous attaquer vous même');
    return false
  }

  const target = state.entities[targetId]
  if (target) return true

  const monster = state.monsters?.find(m => m.id === targetId)
  if (monster) return true

  state.log.push('Cible introuvable')
  return false
}

export function applyThunder(state, attackerId, targetId) {
  const next = structuredClone(state)
  const attacker = next.entities[attackerId]
  const cost = 10
  const dmg = 14 + (attacker.magicBonus ?? 0)
  delete attacker.magicBonus
  attacker.mp -= cost
  const target = next.entities[targetId]
  if (target) {
    target.hp -= dmg
    next.log.push(`${attackerId} frappe ${targetId} pour ${dmg} dégâts`)
    return next
  }

  const monster = next.monsters?.find(m => m.id === targetId)
  if (monster) {
    monster.hp -= dmg
  }
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
  for (const m of state.monsters ?? []) {
    if (m.x === to.x && m.y === to.y) {
      state.log.push('Position occupée');
      return false
    }
  }
  const cost = 5
  if (actor.mp < cost) {
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
  const cost = 5
  actor.mp -= cost
  next.log.push(`${id} se téléporte en (${to.x},${to.y})`)
  return next
}