import { createMonsters, createTileEffects } from '../index.js'
import { CLASSES } from '../classes/classes.js'

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
      hpRegen: cls.hpRegen ?? 0,
      hpRegenInterval: cls.hpRegenInterval ?? 0,
      lastHpRegen: 0,
      gambler: cls.gambler ?? false,
      gamblerInterval: cls.gamblerInterval ?? 0,
      lastGambler: 0,
      cooldownMove: cls.cooldownMove,
      cooldownAttack: cls.cooldownAttack,
      lastMoved: 0,
      lastAttacked: 0,
      lastAction: null,
      className,
    }
  }

  const startPositions = {
    player1: { x: 1, y: 1 },
    player2: { x: 6, y: 1 },
    player3: { x: 1, y: 4 },
    player4: { x: 6, y: 4 },
  }

  const entities = {}
  for (const id in classChoices) {
    const className = classChoices[id]
    if (className !== null) {
      const pos = startPositions[id]
      entities[id] = makeEntity(id, pos.x, pos.y, className)
    }
  }

  const playerList = []
  for (const id in entities) {
    playerList.push(entities[id])
  }

  const monsters = createMonsters({ width, height, blockedPositions: playerList })

  return {
    width, height, entities, monsters,
    tileEffects: createTileEffects({
      width, height,
      blockedPositions: [...monsters]
    }),
    activeEvent: null, lastEventAt: 0, log: ['Début du combat']
  }
}