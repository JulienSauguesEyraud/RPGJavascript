import { TILE_EFFECT_TYPES } from './tileEffectTypes.js'

export function applyTileEffect(state, entityId, effect) {
  const next = structuredClone(state)
  const entity = next.entities[entityId]

  if (!entity || !effect) {
    return next
  }

  if (effect.type === TILE_EFFECT_TYPES.HEAL) {
    entity.hp = Math.min(entity.maxHp, entity.hp + effect.amount)
    next.log.push(`${entityId} récupère ${effect.amount} PV`)
  } 
  else if (effect.type === TILE_EFFECT_TYPES.MANA) {
    entity.mp = Math.min(entity.maxMp, entity.mp + effect.amount)
    next.log.push(`${entityId} récupère ${effect.amount} MP`)
  } 
  else if (effect.type === TILE_EFFECT_TYPES.DAMAGE) {
    entity.hp -= effect.amount
    next.log.push(`${entityId} subit ${effect.amount} dégâts de case`)
  }
  else if (effect.type === TILE_EFFECT_TYPES.BOOST_MELEE) {
    entity.meleeBonus = (entity.meleeBonus ?? 0) + effect.amount
    next.log.push(`${entityId} gagne +${effect.amount} dégâts au corps a corps`)
  }

  return next
}
