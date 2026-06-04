import { createTileEffects } from '../index.js'

export function createInitialState() {
  const width = 8
  const height = 6
  const player1 = {
    id: 'player1',
    x: 1,
    y: 1,
    hp: 20,
    maxHp: 20,
    mp: 5,
    maxMp: 5,
    lastMoved: 0,
    lastAttacked: 0,
  }
  const player2 = {
    id: 'player2',
    x: 4,
    y: 1,
    hp: 20,
    maxHp: 20,
    mp: 5,
    maxMp: 5,
    lastMoved: 0,
    lastAttacked: 0,
  }
  return {
    width,
    height,
    entities: { player1, player2 },
    tileEffects: createTileEffects({
      width,
      height,
      blockedPositions: [player1, player2],
    }),
    activeEvent: null,
    lastEventAt: 0,
    log: ['Début du combat'],
    seed: Date.now(),
  }
}