import { EVENT_EFFECT_TYPES } from './index.js'

const EVENT_EFFECT_AMOUNTS = {
  [EVENT_EFFECT_TYPES.BOOST_MELEE]: 5,
  [EVENT_EFFECT_TYPES.BOOST_MAGIC]: 7,
  [EVENT_EFFECT_TYPES.DOUBLE_ATTACK]: true,
}

export function createEventEffect() {
  const types = Object.values(EVENT_EFFECT_TYPES)

  const type = types[Math.floor(Math.random() * types.length)]

  return {
    type,
    amount: EVENT_EFFECT_AMOUNTS[type],
  }
}
