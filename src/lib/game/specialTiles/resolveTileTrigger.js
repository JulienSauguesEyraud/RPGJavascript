import { applyTileEffect } from './index.js'

export function resolveTileTrigger(state, entityId, trigger) {
  const entity = state.entities[entityId]

  if (!entity) {
    return state
  }

  const effect = state.tileEffects?.find(tileEffect =>
    tileEffect.x === entity.x &&
    tileEffect.y === entity.y &&
    tileEffect.trigger === trigger &&
    !tileEffect.consumed
  )

  if (!effect) {
    return state
  }

  const next = applyTileEffect(state, entityId, effect)
  next.tileEffects = next.tileEffects.map(tileEffect =>
    tileEffect.id === effect.id
      ? { ...tileEffect, consumed: true }
      : tileEffect
  )

  return next
}
