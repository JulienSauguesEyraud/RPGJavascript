import {MONSTER_TYPES} from "./index.js";

export function createMonsters({ width, height, blockedPositions = [] }) {
    const used = new Set(blockedPositions.map(p => `${p.x},${p.y}`))
    const types = Object.keys(MONSTER_TYPES)
    const monsters = []

    for (const type of types) {
        let x, y
        let tries = 0
        do {
            x = Math.floor(Math.random() * width)
            y = Math.floor(Math.random() * height)
            tries++
        } while (used.has(`${x},${y}`) && tries < 100)

        used.add(`${x},${y}`)
        monsters.push({
            id: `monster_${type}`,
            type,
            x,
            y,
            hp: MONSTER_TYPES[type].hp,
            maxHp: MONSTER_TYPES[type].maxHp,
            adjacentSince: {},
        })
    }

    return monsters
}