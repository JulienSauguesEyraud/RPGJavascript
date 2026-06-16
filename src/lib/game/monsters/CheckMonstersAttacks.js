import { distanceFromTile, MONSTER_TYPES } from "../index.js";
import { checkVictory } from "../globalUtils.js";

export function checkMonstersAttacks(room, io, now, code) {
    let changed = false
    for (const monster of room.state.monsters ?? []) {
        const def = MONSTER_TYPES[monster.type]
        if (!def) continue;

        for (const id in room.state.entities) {
            if (!id.startsWith('player')) continue;

            const player = room.state.entities[id]
            if (!player) continue

            if (distanceFromTile(player, monster) === 1) {
                if (!monster.adjacentSince[id]) {
                    monster.adjacentSince[id] = now
                }

                if (now - monster.adjacentSince[id] >= def.attackDelay) {
                    player.hp -= def.damage
                    monster.adjacentSince[id] = now
                    monster.lastAttack = now
                    room.state.log.push(`${monster.type} attaque ${id} pour ${def.damage} dégâts`)
                    changed = true

                    if (player.hp <= 0) {
                        room.state.log.push(`${id} est mort !`)
                        delete room.state.entities[id]
                        changed = true

                        if (checkVictory(io, room, code)) {
                            return true
                        }
                    }
                }
            } else {
                monster.adjacentSince[id] = 0
            }
        }
    }
    return changed
}