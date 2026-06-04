import { EVENT_EFFECT_TYPES } from './index.js'

export function applyEventEffect(state, entityId, effect) {
  const next = structuredClone(state)
  const entity = next.entities[entityId]

  if (!entity || !effect) {
    return next
  }

  if (effect.type === EVENT_EFFECT_TYPES.BOOST_MELEE) {
    entity.meleeBonus = (entity.meleeBonus ?? 0) + effect.amount
    next.log.push(`${entityId} gagne +${effect.amount} dégâts au corps a corps`)
  }
  else if (effect.type === EVENT_EFFECT_TYPES.BOOST_MAGIC) {
    entity.magicBonus = (entity.magicBonus ?? 0) + effect.amount
    next.log.push(`${entityId} gagne +${effect.amount} dégâts magiques`)
  }
  else if (effect.type === EVENT_EFFECT_TYPES.DOUBLE_ATTACK) {
    entity.doubleAttack = effect.amount
    next.log.push(`${entityId} peut attaquer une fois de plus ce tour`)
  }

  return next
}

export function removeEventEffect(state, entityId, effect) {
  const next = structuredClone(state)
  const entity = next.entities[entityId]

  if (!entity || !effect) {
    return next
  }

  if (effect.type === EVENT_EFFECT_TYPES.BOOST_MELEE) {
    entity.meleeBonus = 0
  }
  else if (effect.type === EVENT_EFFECT_TYPES.BOOST_MAGIC) {
    entity.magicBonus = 0
  }
  else if (effect.type === EVENT_EFFECT_TYPES.DOUBLE_ATTACK) {
    entity.doubleAttack = false
  }

  return next
}