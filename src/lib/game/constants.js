export const ACTIONS_CONFIG = {
    move: { label: 'Déplacer [D]', damage: 0, mp: 0, range: 1, barColor: '#296f21' },
    melee: { label: 'Corps à corps [C]', damage: 5, mp: 0, range: 1, barColor: '#8c20cc' },
    fireball: { label: 'Boule de feu [F]', damage: 8, mp: 4, range: 2, barColor: '#8c20cc' },
    thunder: { label: 'Tonnerre [T]', damage: 14, mp: 10, range: Infinity, barColor: '#8c20cc' },
    teleport: { label: 'Téléportation [E]', damage: 0, mp: 5, range: Infinity, barColor: '#8c20cc' },
}

// Le reste (CLASSES, EVENT_CONFIG, etc.) reste inchangé...

export const EVENT_CONFIG = {
    INTERVAL: 20000,
    DURATION: 5000
}

export const MONSTER_ATTACK_KIND = {
    goblin: 'melee',
    slime:  'melee',
    demon:  'fireball',
    dragon: 'thunder',
}

export const PLAYER_COLORS = {
    player1: '#4cf',
    player2: '#f66',
    player3: '#fb2',
    player4: '#8f8'
}