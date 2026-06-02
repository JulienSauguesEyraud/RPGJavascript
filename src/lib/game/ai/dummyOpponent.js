import { applyMelee } from '../actions/applyMeleeAttack.js'
import { applyMove, canMove } from '../actions/applyMove.js'
import { endTurn } from '../actions/endTurn.js'
import { distance8 } from '../resolution/distance.js'

export function dummyAct(state) {
  const player = state.entities.player
  const dummy = state.entities.dummy
  const dist = distance8(player, dummy)
  let next = structuredClone(state)
  if (dist === 1) {
    next = applyMelee(next, 'dummy', 'player')
  } else {
    const dx = Math.sign(player.x - dummy.x)
    const dy = Math.sign(player.y - dummy.y)
    const candidate = { x: dummy.x + dx, y: dummy.y + (dx === 0 ? dy : 0) }
    if (canMove(next, 'dummy', candidate)) {
      next = applyMove(next, 'dummy', candidate)
    }
  }
  next = endTurn(next)
  return next
}
