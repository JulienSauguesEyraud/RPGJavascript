import {distanceFromTile} from "../index.js";
import {ACTIONS_CONFIG} from "../constants.js";

export function canMove(state, id, to) {
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
      state.log.push('Position occupée')
      return false
    }
  }

  const dist = distanceFromTile(actor, to);
  if (dist > ACTIONS_CONFIG.move.range || dist === 0) {
    state.log.push('Case hors de portée')
    return false
  }
  return true
}

export function applyMove(state, id, to) {
  const next = structuredClone(state)
  next.entities[id].x = to.x
  next.entities[id].y = to.y
  next.entities[id].hasMoved = true
  next.log.push(`${id} se déplace en (${to.x},${to.y})`)
  return next
}