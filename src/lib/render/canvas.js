import { gameState } from '../stores/gameState.js'
import { ATTACKS_VISUAL, MONSTERS_VISUAL, CLASSES_VISUAL } from './index.js'
import {distanceFromTile} from "../game/index.js";

export function initGameCanvas(canvas, getState, dispatch, uiStores) {
  const context = canvas.getContext('2d')
  let tileSize = 64
  let canvasWidth = 0
  let canvasHeight = 0
  let frameId = null

  const effects = []
  let prevState = null

  const observer = new ResizeObserver(() => resize())
  observer.observe(canvas.parentElement)

  function tileCenter(x, y) {
    return {
      x: x * tileSize + tileSize / 2,
      y: y * tileSize + tileSize / 2,
    }
  }

  function pushAttackEffect(kind, from, to) {
    const visual = ATTACKS_VISUAL[kind]
    if (!visual) return

    let startTime = performance.now()

    const activeEffects = effects.filter(e => e.kind === kind)
    if (activeEffects.length > 0) {
      const latest = activeEffects[activeEffects.length - 1]
      startTime = Math.max(startTime, latest.start + visual.duration * 0.4)
    }

    effects.push({
      kind,
      from,
      to,
      start: startTime,
      duration: visual.duration,
    })
  }

  const unsub = gameState.subscribe(state => {
    if (!state) return

    if (prevState) {
      for (const id in state.entities) {
        const curr = state.entities[id]
        const prev = prevState.entities[id]
        if (!curr || !prev) continue

        if (curr.x !== prev.x || curr.y !== prev.y) {
          let startTime = performance.now()

          const isTeleport = curr.lastAction === 'teleport'
          if (isTeleport) {
            effects.push({
              kind: 'teleport',
              entityId: id,
              from: tileCenter(prev.x, prev.y),
              to: tileCenter(curr.x, curr.y),
              start: performance.now(),
              duration: 600,
            })
          } else {
            const entityMoves = effects.filter(e => e.kind === 'move' && e.entityId === id)
            if (entityMoves.length > 0) {
              const latest = entityMoves[entityMoves.length - 1]
              startTime = Math.max(startTime, latest.start + latest.duration)
            }
            effects.push({
              kind: 'move',
              entityId: id,
              from: tileCenter(prev.x, prev.y),
              to: tileCenter(curr.x, curr.y),
              start: startTime,
              duration: 200,
            })
          }

          const tileEffect = state.tileEffects?.find(e =>
              e.x === curr.x &&
              e.y === curr.y &&
              e.activatedAt && Date.now() - e.activatedAt < 1000
          )
          if (tileEffect) {
            effects.push({
              kind: 'tile',
              type: tileEffect.type,
              x: tileEffect.x,
              y: tileEffect.y,
              start: performance.now(),
              duration: 1000,
            })
          }
        }

        if (curr.hp < prev.hp) {
          const playerAttacker = Object.values(prevState.entities).find(e =>
              state.entities[e.id] && state.entities[e.id].lastAttacked > e.lastAttacked
          )

          if (playerAttacker && playerAttacker.id !== id) {
            const kind = state.entities[playerAttacker.id]?.lastAction ?? 'melee'
            pushAttackEffect(
                kind,
                tileCenter(playerAttacker.x, playerAttacker.y),
                tileCenter(prev.x, prev.y),
            )
          } else if (!playerAttacker) {
            const MONSTER_ATTACK_KIND = {
              goblin: 'melee',
              slime:  'melee',
              demon:  'fireball',
              dragon: 'thunder',
            }
            const attackingMonsters = state.monsters?.filter(m => {
              const prevMonster = prevState.monsters?.find(pm => pm.id === m.id)
              if (!prevMonster) return false
              return m.lastAttack && m.lastAttack !== prevMonster.lastAttack
            }) ?? []

            for (const attackingMonster of attackingMonsters) {
              if (distanceFromTile(attackingMonster, curr) === 1) {
                const kind = MONSTER_ATTACK_KIND[attackingMonster.type] ?? 'melee'
                pushAttackEffect(
                    kind,
                    tileCenter(attackingMonster.x, attackingMonster.y),
                    tileCenter(curr.x, curr.y),
                )
              }
            }
          }
        }
      }

      for (const prevMonster of prevState.monsters ?? []) {
        const currentMonster = state.monsters?.find(m => m.id === prevMonster.id)

        if (currentMonster) {
          if (currentMonster.hp < prevMonster.hp) {
            const attacker = Object.values(state.entities).find(p => {
              const prevPlayer = prevState.entities[p.id]
              return prevPlayer && p.lastAttacked > prevPlayer.lastAttacked
            })
            if (attacker) {
              pushAttackEffect(
                  attacker.lastAction ?? 'melee',
                  tileCenter(attacker.x, attacker.y),
                  tileCenter(currentMonster.x, currentMonster.y),
              )
            }
          }
        } else {
          const attacker = Object.values(state.entities).find(p => {
            const prevPlayer = prevState.entities[p.id]
            return prevPlayer && p.lastAttacked > prevPlayer.lastAttacked
          })
          if (attacker) {
            pushAttackEffect(
                attacker.lastAction ?? 'melee',
                tileCenter(attacker.x, attacker.y),
                tileCenter(prevMonster.x, prevMonster.y),
            )
          }
        }
      }
    }

    prevState = state
  })
  function getDisplayPos(id, entity, now) {
    const teleportEffect = effects.find(e => e.kind === 'teleport' && e.entityId === id);
    if (teleportEffect) {
      const elapsed = now - teleportEffect.start;
      if (elapsed >= 0 && elapsed <= teleportEffect.duration) {
        return null;
      }
    }

    const moves = effects.filter(e => e.kind === 'move' && e.entityId === id);
    if (moves.length > 0) {
      const activeMove = moves.find(e => now >= e.start && now <= e.start + e.duration)
      if (activeMove) {
        const t = (now - activeMove.start) / activeMove.duration
        return {
          x: activeMove.from.x + (activeMove.to.x - activeMove.from.x) * t,
          y: activeMove.from.y + (activeMove.to.y - activeMove.from.y) * t,
        }
      }

      const futureMoves = moves.filter(e => now < e.start)
      if (futureMoves.length > 0) {
        futureMoves.sort((a, b) => a.start - b.start)
        return futureMoves[0].from
      }
    }

    return tileCenter(entity.x, entity.y)
  }

  function draw(now = performance.now()) {
    const state = getState()
    if (!state) return

    for (let i = effects.length - 1; i >= 0; i--) {
      if (now >= effects[i].start + effects[i].duration) effects.splice(i, 1)
    }

    context.clearRect(0, 0, canvasWidth, canvasHeight)

    for (let y = 0; y < state.height; y++) {
      for (let x = 0; x < state.width; x++) {
        context.fillStyle = '#223'
        context.fillRect(x * tileSize, y * tileSize, tileSize - 1, tileSize - 1)
      }
    }

    for (const effect of effects) {
      if (effect.kind !== 'tile' || now < effect.start) continue
      const t = (now - effect.start) / effect.duration
      if (t > 1) continue
      const alpha = (1 - t) * 0.6
      context.fillStyle =
          effect.type === 'heal'
              ? `rgba(80,220,130,${alpha})`
              : effect.type === 'mana'
                  ? `rgba(90,150,255,${alpha})`
                  : effect.type === 'boost_melee'
                      ? `rgba(245,210,80,${alpha})`
                      : `rgba(255,110,90,${alpha})`

      context.fillRect(
          effect.x * tileSize,
          effect.y * tileSize,
          tileSize,
          tileSize,
      )
    }

    if (uiStores.hover) {
      const { x, y } = uiStores.hover
      context.fillStyle = 'rgba(255,255,255,0.12)'
      context.fillRect(x * tileSize, y * tileSize, tileSize - 1, tileSize - 1)
    }

    for (const monster of state.monsters ?? []) {
      const visual = MONSTERS_VISUAL[monster.type]
      if (!visual) continue
      const px = monster.x * tileSize + tileSize / 2
      const py = monster.y * tileSize + tileSize / 2
      const size = tileSize * visual.scale;

      if (visual.image) {
        context.drawImage(
            visual.image,
            px - size / 2,
            py - size / 2,
            size,
            size
        );
      }

      const r = tileSize * 0.3;
      context.fillStyle = '#fff'
      context.textAlign = 'center'
      context.font = `${Math.floor(tileSize * 0.14)}px sans-serif`
      context.fillText(
          `${monster.hp}/${monster.maxHp}`,
          px,
          py + r + 14
      )
    }

    for (const id in state.entities) {
      const entity = state.entities[id]
      if (!entity) continue
      const pos = getDisplayPos(id, entity, now)
      if (!pos) continue
      const { x: px, y: py } = pos

      const PLAYER_COLORS = {
        player1: '#4cf',
        player2: '#f66',
        player3: '#fb2',
        player4: '#8f8'
      };

      context.beginPath();
      context.fillStyle = PLAYER_COLORS[id];
      context.arc(px, py, tileSize * 0.35, 0, Math.PI * 2);
      context.fill();

      const accessory = CLASSES_VISUAL[entity.className]
      if (accessory?.image) {
        const offX = accessory.offsetX ?? 0;
        const offY = accessory.offsetY ?? 0;

        context.drawImage(
            accessory.image,
            px - tileSize / 2 + offX,
            py - tileSize / 2 + offY,
            tileSize,
            tileSize
        );
      }
      context.fillStyle = '#fff'
      context.textAlign = 'center'
      context.font = `${Math.floor(tileSize * 0.18)}px sans-serif`
      context.fillText(`${entity.hp}/${entity.maxHp}`, px, py - 4)
      context.fillText(`MP:${entity.mp}`, px, py + tileSize * 0.22)
    }

    for (const effect of effects) {
      if (effect.kind === 'move' || effect.kind === 'tile' || now < effect.start) continue

      const visual = ATTACKS_VISUAL[effect.kind]
      if (!visual?.image) continue

      const t = Math.min((now - effect.start) / effect.duration, 1)

      if (effect.kind === 'melee' || effect.kind === 'fireball') {
        const x = effect.from.x + (effect.to.x - effect.from.x) * t
        const y = effect.from.y + (effect.to.y - effect.from.y) * t
        const angle = Math.atan2(effect.to.y - effect.from.y, effect.to.x - effect.from.x)

        context.save()
        context.translate(x, y)
        context.rotate(angle)

        if (effect.kind === 'melee') {
          context.globalAlpha = 1 - t
        }

        context.drawImage(visual.image, -tileSize / 2, -tileSize / 2, tileSize, tileSize)
        context.restore()
      }

      else if (effect.kind === 'thunder') {
        const startX = effect.to.x
        const startY = effect.to.y - tileSize * 1.5
        const endY = effect.to.y

        const totalHeight = endY - startY

        const currentHeight = totalHeight * Math.min(t * 2, 1)
        const alpha = 1 - (t * t)

        context.save()
        context.globalAlpha = alpha

        if (currentHeight > 0) {
          context.drawImage(
              visual.image,
              startX - tileSize / 2,
              startY,
              tileSize,
              currentHeight
          )
        }

        if (t > 0.3) {
          context.fillStyle = '#ffffff'
          context.beginPath()
          context.ellipse(effect.to.x, effect.to.y, tileSize * 0.4 * alpha, tileSize * 0.15 * alpha, 0, 0, Math.PI * 2)
          context.fill()
        }
        context.restore()
      }
      else if (effect.kind === 'teleport') {
        const fadeOut = Math.max(0, 1 - t * 2)
        const fadeIn  = Math.max(0, t * 2 - 1)
        const rotation = t * Math.PI * 4

        if (fadeOut > 0) {
          context.save()
          context.translate(effect.from.x, effect.from.y)
          context.rotate(rotation)
          context.globalAlpha = fadeOut
          context.drawImage(visual.image, -tileSize / 2, -tileSize / 2, tileSize, tileSize)
          context.restore()
        }

        if (fadeIn > 0) {
          context.save()
          context.translate(effect.to.x, effect.to.y)
          context.rotate(rotation)
          context.globalAlpha = fadeIn
          context.drawImage(visual.image, -tileSize / 2, -tileSize / 2, tileSize, tileSize)
          context.restore()
        }
      }
    }
  }

  function resize() {
    const state = getState()
    if (!state) return
    const rect = canvas.parentElement.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    tileSize = Math.max(32, Math.floor(Math.min(
        rect.width / state.width,
        rect.height / state.height,
    )))

    canvasWidth = state.width * tileSize
    canvasHeight = state.height * tileSize

    canvas.style.width = `${canvasWidth}px`
    canvas.style.height = `${canvasHeight}px`
    canvas.width = Math.round(canvasWidth * dpr)
    canvas.height = Math.round(canvasHeight * dpr)
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function getTile(evt) {
    const rect = canvas.getBoundingClientRect()
    const state = getState()
    return {
      x: Math.floor((evt.clientX - rect.left) / (rect.width / state.width)),
      y: Math.floor((evt.clientY - rect.top) / (rect.height / state.height)),
    }
  }

  canvas.addEventListener('mousemove', e => { uiStores.hover = getTile(e) })
  canvas.addEventListener('mouseleave', () => { uiStores.hover = null })

  canvas.addEventListener('click', e => {
    const tile = getTile(e)
    const selected = uiStores.selected
    const state = getState()

    if (selected === 'move' || selected === 'teleport') {
      dispatch({
        type: selected === 'move' ? 'MOVE' : 'TELEPORT',
        payload: { id: uiStores.playerId, to: tile },
      })
    }
    else if (selected === 'melee' || selected === 'fireball' || selected === 'thunder') {
      const monster = state.monsters?.find(m => m.x === tile.x && m.y === tile.y)
      if (monster) {
        dispatch({
          type: selected === 'melee' ? 'MELEE' : selected === 'fireball' ? 'FIREBALL' : 'THUNDER',
          payload: { attackerId: uiStores.playerId, targetId: monster.id },
        })
        return
      }
      for (const id in state.entities) {
        const entity = state.entities[id]
        if (entity.x === tile.x && entity.y === tile.y && id !== uiStores.playerId) {
          dispatch({
            type: selected === 'melee' ? 'MELEE'
                : selected === 'fireball' ? 'FIREBALL'
                    : 'THUNDER',
            payload: { attackerId: uiStores.playerId, targetId: id },
          })
          break
        }
      }
    }
  })

  function loop(now) {
    draw(now)
    frameId = requestAnimationFrame(loop)
  }

  window.addEventListener('resize', resize)
  resize()
  frameId = requestAnimationFrame(loop)

  return {
    resize,
    destroy() {
      unsub()
      observer.disconnect()
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(frameId)
    },
  }
}