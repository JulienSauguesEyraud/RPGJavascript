export function endTurn(state) {
  const next = structuredClone(state)
  next.turn = state.turn === 'player' ? 'dummy' : 'player'
  next.entities[next.turn].move = false
  next.entities[next.turn].attack = false
  next.log.push(`Fin du tour, tour de ${next.turn}`)
  return next
}
