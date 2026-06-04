import { TILE_EFFECT_TRIGGERS, TILE_EFFECT_TYPES } from './index.js'

const TILE_EFFECT_AMOUNTS = {
  [TILE_EFFECT_TYPES.HEAL]: 3,
  [TILE_EFFECT_TYPES.MANA]: 2,
  [TILE_EFFECT_TYPES.DAMAGE]: 3,
  [TILE_EFFECT_TYPES.BOOST_MELEE]: 2,
}

function positionKey(position) {
  return `${position.x},${position.y}`
}

function pickRandomFreePosition(width, height, usedPositions) {
  const freePositions = []

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const position = { x, y }
      if (!usedPositions.has(positionKey(position))) {
        freePositions.push(position)
      }
    }
  }

  const index = Math.floor(Math.random() * freePositions.length)
  const position = freePositions[index]
  usedPositions.add(positionKey(position))
  return position
}

export function createTileEffects({ width, height, blockedPositions = [] }) {
  const usedPositions = new Set(blockedPositions.map(positionKey))
  const types = Object.values(TILE_EFFECT_TYPES)

  return types.map(type => {
    const position = pickRandomFreePosition(width, height, usedPositions)

    return {
      id: `${type}-1`,
      type,
      trigger: TILE_EFFECT_TRIGGERS.ON_ENTER,
      x: position.x,
      y: position.y,
      amount: TILE_EFFECT_AMOUNTS[type],
      consumed: false,
    }
  })
}
