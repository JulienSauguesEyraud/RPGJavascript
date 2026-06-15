export const ATTACKS_VISUAL = {
    melee: { path: 'svg/attacks/melee.svg', image: null, duration: 250 },
    fireball: { path: 'svg/attacks/fireball.svg', image: null, duration: 400 },
    thunder: { path: 'svg/attacks/thunder.svg', image: null, duration: 400 },
    teleport: { path: 'svg/attacks/teleport.svg', image: null, duration: 600 },
}
export const CLASSES_VISUAL = {
    warrior: { path: 'svg/classes/warrior.svg', image: null, offsetX: 0, offsetY: -20 },
    tank: { path: 'svg/classes/tank.svg', image: null, offsetX: 15, offsetY: 0 },
    mage: { path: 'svg/classes/mage.svg', image: null, offsetX: 0, offsetY: -40 },
    priest: { path: 'svg/classes/priest.svg', image: null, offsetX: 0, offsetY: -20 },
    gambler: { path: 'svg/classes/gambler.svg', image: null, offsetX: 0, offsetY: -20 },
}
export const MONSTERS_VISUAL = {
    goblin: { path: 'svg/monsters/goblin.svg', image: null, scale: 1 },
    slime:  { path: 'svg/monsters/slime.svg', image: null, scale: 1 },
    demon:  { path: 'svg/monsters/demon.svg', image: null, scale: 1.2 },
    dragon: { path: 'svg/monsters/dragon.svg', image: null, scale: 1.6 },
}

export { loadImages } from './loadImages'
export { initGameCanvas } from './canvas.js'