import {ACTIONS_CONFIG} from './constants.js'
export function distanceFromTile(a, b) {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y))
}

export function checkVictory(io, room, code) {
  const players = Object.keys(room.state.entities).filter(k => k.startsWith('player'));

  if (players.length <= 1) {
    const winner = players[0] || "Personne";
    room.status = 'waiting';
    io.to(code).emit('game_over', { winner });
    return true;
  }
  return false;
}

export function hasEntityInRange(action, me, gameState, myPlayerId) {
  if (!me) return false

  const maxRange = ACTIONS_CONFIG[action]?.range
  if (maxRange === 100) return true

  const players = Object.values(gameState?.entities ?? {}).filter(
      (entity) => entity.id !== myPlayerId
  )

  const monsters = Object.values(gameState?.monsters ?? {})

  const targets = [...players, ...monsters].filter(target => (target.hp ?? 0) > 0)

  return targets.some((target) => {
    return distanceFromTile(me, target) <= maxRange
  })
}