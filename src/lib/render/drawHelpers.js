import { ACTIONS_CONFIG, PLAYER_COLORS } from '../game/constants.js'
import { distanceFromTile } from "../game/index.js"

export function drawSpinner(ctx, x, y, radius, pct, color) {
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
    ctx.fill()

    if (pct > 0) {
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.arc(x, y, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * pct))
        ctx.closePath()
        ctx.fillStyle = color
        ctx.fill()
    }
}

export function drawGrid(ctx, state, me, currentSelectedAction, tileSize) {
    const maxRange = ACTIONS_CONFIG[currentSelectedAction]?.range ?? 0

    for (let y = 0; y < state.height; y++) {
        for (let x = 0; x < state.width; x++) {
            ctx.fillStyle = '#223'
            ctx.fillRect(x * tileSize, y * tileSize, tileSize - 1, tileSize - 1)

            if (me && currentSelectedAction && maxRange > 0 && maxRange !== Infinity) {
                if ((me.x !== x || me.y !== y) && distanceFromTile(me, { x, y }) <= maxRange) {
                    ctx.fillStyle = 'rgba(0,162,255,0.05)'
                    ctx.fillRect(x * tileSize, y * tileSize, tileSize - 1, tileSize - 1)
                }
            }
        }
    }
}

export function drawTileEffects(ctx, effects, now, tileSize) {
    for (const effect of effects) {
        if (effect.kind !== 'tile' || now < effect.start) continue
        const t = (now - effect.start) / effect.duration
        if (t > 1) continue
        const alpha = (1 - t) * 0.6

        ctx.fillStyle =
            effect.type === 'heal' ? `rgba(80,220,130,${alpha})` :
                effect.type === 'mana' ? `rgba(90,150,255,${alpha})` :
                    effect.type === 'boost_melee' ? `rgba(245,210,80,${alpha})` :
                        `rgba(255,110,90,${alpha})`

        ctx.fillRect(effect.x * tileSize, effect.y * tileSize, tileSize, tileSize)
    }
}

export function drawMonsters(ctx, monsters, tileSize, MONSTERS_VISUAL) {
    for (const monster of monsters) {
        const visual = MONSTERS_VISUAL[monster.type]
        if (!visual) continue

        const px = monster.x * tileSize + tileSize / 2
        const py = monster.y * tileSize + tileSize / 2
        const size = tileSize * visual.scale

        if (visual.image) {
            ctx.drawImage(visual.image, px - size / 2, py - size / 2, size, size)
        }

        ctx.fillStyle = '#fff'
        ctx.textAlign = 'center'
        ctx.font = `${Math.floor(tileSize * 0.14)}px sans-serif`
        ctx.fillText(`${monster.hp}/${monster.maxHp}`, px, py + (tileSize * 0.3) + 14)
    }
}

export function drawEntities(ctx, entities, currentPlayerId, getDisplayPos, now, tileSize, CLASSES_VISUAL) {
    const nowForCooldown = Date.now()

    for (const id in entities) {
        const entity = entities[id]
        if (!entity) continue
        const pos = getDisplayPos(id, entity, now)
        if (!pos) continue
        const { x: px, y: py } = pos

        ctx.beginPath()
        ctx.fillStyle = PLAYER_COLORS[id] || '#fff'
        ctx.arc(px, py, tileSize * 0.35, 0, Math.PI * 2)
        ctx.fill()

        const accessory = CLASSES_VISUAL[entity.className]
        if (accessory?.image) {
            ctx.drawImage(
                accessory.image,
                px - tileSize / 2 + (accessory.offsetX ?? 0),
                py - tileSize / 2 + (accessory.offsetY ?? 0),
                tileSize,
                tileSize
            )
        }

        ctx.fillStyle = '#fff'
        ctx.textAlign = 'center'
        ctx.font = `${Math.floor(tileSize * 0.18)}px sans-serif`
        ctx.fillText(`${entity.hp}/${entity.maxHp}`, px, py - 4)
        ctx.fillText(`MP:${entity.mp}`, px, py + tileSize * 0.22)

        const movePct = Math.min(1, (nowForCooldown - (entity.lastMoved ?? 0)) / (entity.cooldownMove ?? 3000))
        const attackPct = Math.min(1, (nowForCooldown - (entity.lastAttacked ?? 0)) / (entity.cooldownAttack ?? 5000))
        const spinnerRadius = tileSize * 0.12
        const offX = tileSize * 0.37
        const offY = tileSize * 0.35

        drawSpinner(ctx, px - offX, py + offY, spinnerRadius, movePct, '#296f21')
        drawSpinner(ctx, px + offX, py + offY, spinnerRadius, attackPct, '#8c20cc')
    }
}

export function drawProjectiles(ctx, effects, now, tileSize, ATTACKS_VISUAL) {
    for (const effect of effects) {
        if (effect.kind === 'move' || effect.kind === 'tile' || now < effect.start) continue

        const visual = ATTACKS_VISUAL[effect.kind]
        if (!visual?.image) continue

        const t = Math.min((now - effect.start) / effect.duration, 1)

        if (effect.kind === 'melee' || effect.kind === 'fireball') {
            const x = effect.from.x + (effect.to.x - effect.from.x) * t
            const y = effect.from.y + (effect.to.y - effect.from.y) * t
            const angle = Math.atan2(effect.to.y - effect.from.y, effect.to.x - effect.from.x)

            ctx.save()
            ctx.translate(x, y)
            ctx.rotate(angle)
            if (effect.kind === 'melee') ctx.globalAlpha = 1 - t
            ctx.drawImage(visual.image, -tileSize / 2, -tileSize / 2, tileSize, tileSize)
            ctx.restore()
        }
        else if (effect.kind === 'thunder') {
            const startX = effect.to.x
            const startY = effect.to.y - tileSize * 1.5
            const currentHeight = (effect.to.y - startY) * Math.min(t * 2, 1)
            const alpha = 1 - (t * t)

            ctx.save()
            ctx.globalAlpha = alpha
            if (currentHeight > 0) {
                ctx.drawImage(visual.image, startX - tileSize / 2, startY, tileSize, currentHeight)
            }
            if (t > 0.3) {
                ctx.fillStyle = '#ffffff'
                ctx.beginPath()
                ctx.ellipse(effect.to.x, effect.to.y, tileSize * 0.4 * alpha, tileSize * 0.15 * alpha, 0, 0, Math.PI * 2)
                ctx.fill()
            }
            ctx.restore()
        }
        else if (effect.kind === 'teleport') {
            const fadeOut = Math.max(0, 1 - t * 2)
            const fadeIn  = Math.max(0, t * 2 - 1)
            const rotation = t * Math.PI * 4

            if (fadeOut > 0) {
                ctx.save()
                ctx.translate(effect.from.x, effect.from.y)
                ctx.rotate(rotation)
                ctx.globalAlpha = fadeOut
                ctx.drawImage(visual.image, -tileSize / 2, -tileSize / 2, tileSize, tileSize)
                ctx.restore()
            }
            if (fadeIn > 0) {
                ctx.save()
                ctx.translate(effect.to.x, effect.to.y)
                ctx.rotate(rotation)
                ctx.globalAlpha = fadeIn
                ctx.drawImage(visual.image, -tileSize / 2, -tileSize / 2, tileSize, tileSize)
                ctx.restore()
            }
        }
    }
}