import { applyEventEffect, removeEventEffect } from '../events/applyEventEffect.js'
import { createEventEffect } from '../events/createEventEffects.js'

export function endTurn(state) {
  let next = structuredClone(state)

  next.turn = state.turn === 'player' ? 'dummy' : 'player'

  next.entities[next.turn].hasMoved = false
  next.entities[next.turn].hasAttacked = false

  if (next.turn === 'player') {
    next.log.push(`Fin du tour ${next.turnNumber}`)

    if (next.activeEvent) {
      next = removeEventEffect(next, 'player', next.activeEvent)
      next = removeEventEffect(next, 'dummy', next.activeEvent)
      next.log.push(`L'événement ${next.activeEvent.type} prend fin`)
      next.activeEvent = null
    }
    next.turnNumber++
  }

  if (next.turnNumber % 3 === 0 && !next.activeEvent) {
    next.activeEvent = createEventEffect()
    next = applyEventEffect(next, 'player', next.activeEvent)
    next = applyEventEffect(next, 'dummy', next.activeEvent)
    next.log.push(`Nouvel événement : ${next.activeEvent.type}`)
  }
  next.log.push(`Tour de ${next.turn}`)
  return next
}