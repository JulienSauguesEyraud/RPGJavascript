import { createTileEffects } from '../index.js'
import { CLASSES } from '../classes.js'

export function createInitialState(classChoices = {}) {
  const width = 8
  const height = 6

  function makeEntity(id, x, y, className) {
    const cls = CLASSES[className] ?? CLASSES.warrior
    return {
      id,
      x,
      y,
      hp: cls.hp,
      maxHp: cls.maxHp,
      mp: cls.mp,
      maxMp: cls.maxMp,
      meleeClassBonus: cls.meleeClassBonus,
      mpRegen: cls.mpRegen ?? 0,
      mpRegenInterval: cls.mpRegenInterval ?? 0,
      lastMpRegen: 0,
      cooldownMove: cls.cooldownMove,
      cooldownAttack: cls.cooldownAttack,
      lastMoved: 0,
      lastAttacked: 0,
      lastAction: null,
      className,
    }
  }

  const player1 = makeEntity('player1', 1, 1, classChoices.player1 ?? 'warrior')
  const player2 = makeEntity('player2', 6, 4, classChoices.player2 ?? 'warrior')

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