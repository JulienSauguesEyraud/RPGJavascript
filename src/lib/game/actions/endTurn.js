import { applyEventEffect, removeEventEffect } from '../index.js'
import { createEventEffect } from '../index.js'

export function endTurn(state) {
  let next = structuredClone(state)

  next.turn = state.turn === 'player1' ? 'player2' : 'player1'

  next.entities[next.turn].hasMoved = false
  next.entities[next.turn].hasAttacked = false

  if (next.turn === 'player1') {
    next.log.push(`Fin du tour ${next.turnNumber}`)

    if (next.activeEvent) {
      next = removeEventEffect(next, 'player1', next.activeEvent)
      next = removeEventEffect(next, 'player2', next.activeEvent)
      next.log.push(`L'événement ${next.activeEvent.type} prend fin`)
      next.activeEvent = null
    }
    next.turnNumber++
  }

  if (next.turnNumber % 3 === 0 && !next.activeEvent) {
    next.activeEvent = createEventEffect()
    next = applyEventEffect(next, 'player1', next.activeEvent)
    next = applyEventEffect(next, 'player2', next.activeEvent)
    next.log.push(`Nouvel événement : ${next.activeEvent.type}`)
  }
  next.log.push(`Tour de ${next.turn}`)
  return next
}