import { writable } from 'svelte/store'

export const selectedAction = writable('move') // 'move' | 'melee' | 'magic' | 'pass'