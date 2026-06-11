import {createInitialState, distance8, MONSTER_TYPES} from "../index.js";

export function checkMonstersAttacks(room, now) {
    let changed = false
    for (const monster of room.state.monsters ?? []) {
        const def = MONSTER_TYPES[monster.type]
        if (!def) return false;
        for (const playerId of ['player1', 'player2']) {
            const player = room.state.entities[playerId]
            if (!player) return false

            if (distance8(player, monster) === 1) {
                if (!monster.adjacentSince[playerId]) {
                    monster.adjacentSince[playerId] = now
                }
                if (now - monster.adjacentSince[playerId] >= def.attackDelay) {
                    room.state.entities[playerId].hp -= def.damage
                    monster.adjacentSince[playerId] = now
                    monster.lastAttack = now
                    room.state.log.push(`${monster.type} attaque ${playerId} pour ${def.damage} dégâts`)
                    changed = true

                    if (room.state.entities[playerId].hp <= 0) {
                        const fresh = createInitialState(room.classes)
                        fresh.lastEventAt = now
                        room.state = fresh
                        changed = true
                        break
                    }
                }
            } else {
                monster.adjacentSince[playerId] = 0
            }
        }
    }
    return changed
}