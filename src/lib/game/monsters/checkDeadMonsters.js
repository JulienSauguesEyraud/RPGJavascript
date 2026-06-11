import {MONSTER_TYPES} from "./index.js";


export function checkDeadMonsters(next, playerId) {
    next.monsters = (next.monsters ?? []).filter(m => {
        if (m.hp <= 0) {
            applyMonsterReward(next, playerId, m.type)
            next.log.push(`${playerId} a tué le ${m.type} !`)
            return false
        }
        return true
    })
}

function applyMonsterReward(state, playerId, monsterType) {
    const def = MONSTER_TYPES[monsterType]
    if (!def) return
    const entity = state.entities[playerId]
    if (!entity) return
    if (def.reward.maxHp > 0) {
        entity.maxHp += def.reward.maxHp
        entity.hp = Math.min(entity.hp + def.reward.maxHp, entity.maxHp)
        state.log.push(`${playerId} gagne +${def.reward.maxHp} HP max`)
    }
    if (def.reward.maxMp > 0) {
        entity.maxMp += def.reward.maxMp
        entity.mp = Math.min(entity.mp + def.reward.maxMp, entity.maxMp)
        state.log.push(`${playerId} gagne +${def.reward.maxMp} MP max`)
    }
}

