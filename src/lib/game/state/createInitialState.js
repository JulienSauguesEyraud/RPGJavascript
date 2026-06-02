import { createTileEffects } from '../events/createTileEffects.js'

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
    move: false,
    attack: false
  }
  const dummy = {
    id: 'dummy',
    x: 4,
    y: 1,
    hp: 15,
    maxHp: 15,
    mp: 0,
    maxMp: 0,
    move: false,
    attack: false
  }
  return {
    width,
    height,
    turn: 'player',
    entities: {
      player,
      dummy,
    },
    tileEffects: createTileEffects({
      width,
      height,
      blockedPositions: [player, dummy],
    }),
    log: ['Début du combat'],
    seed: Date.now(),
  }
}
