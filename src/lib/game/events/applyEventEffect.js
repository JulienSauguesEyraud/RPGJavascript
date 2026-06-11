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
    next.log.push(`${entityId} peut attaquer deux fois d'affilée`)
  }
  else if (effect.type === EVENT_EFFECT_TYPES.INFINITE_MOVE) {
    entity.infiniteMove = effect.amount
    next.log.push(`${entityId} peut se déplacer autant qu'il le souhaite`)
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
  else if (effect.type === EVENT_EFFECT_TYPES.INFINITE_MOVE) {
    entity.infiniteMove = false
  }

  return next
}