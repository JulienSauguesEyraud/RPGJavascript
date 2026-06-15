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