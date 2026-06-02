import { createTileEffects } from '../specialTiles/createTileEffects.js'

export function createInitialState() {
  const width = 8
  const height = 6
  const player = {
    id: 'player',
    x: 1,
    y: 1,
    hp: 20,
    maxHp: 20,
    mp: 5,
    maxMp: 5,
    hasMoved: false,
    hasAttacked: false
  }
  const dummy = {
    id: 'dummy',
    x: 4,
    y: 1,
    hp: 15,
    maxHp: 15,
    mp: 0,
    maxMp: 0,
    hasMoved: false,
    hasAttacked: false
  }
  return {
    width,
    height,
    turn: 'player',
    turnNumber: 1,
    entities: {
      player,
      dummy,
    },
    tileEffects: createTileEffects({
      width,
      height,
      blockedPositions: [player, dummy],
    }),
    eventEffect: null,
    log: ['Début du combat'],
    seed: Date.now(),
  }
}
