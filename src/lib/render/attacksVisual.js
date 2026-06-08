export const ATTACKS_VISUAL = {
    melee: {
        duration: 200,
        draw(context, fx, t) {
            const x = fx.from.x + (fx.to.x - fx.from.x) * t
            const y = fx.from.y + (fx.to.y - fx.from.y) * t
            context.save()
            context.globalAlpha = 1 - t
            context.strokeStyle = '#fff'
            context.lineWidth = 4
            context.lineCap = 'round'
            context.beginPath()
            context.moveTo(fx.from.x, fx.from.y)
            context.lineTo(x, y)
            context.stroke()
            context.restore()
        },
    },
    fireball: {
        duration: 400,
        draw(context, fx, t, tileSize) {
            const x = fx.from.x + (fx.to.x - fx.from.x) * t
            const y = fx.from.y + (fx.to.y - fx.from.y) * t
            context.save()
            context.fillStyle = '#f90'
            context.shadowColor = '#f90'
            context.shadowBlur = 12
            context.beginPath()
            context.arc(x, y, tileSize * 0.12, 0, Math.PI * 2)
            context.fill()
            context.restore()
        },
    },
    thunder: {
        duration: 350,
        draw(context, fx, t, tileSize) {
            const startX = fx.to.x
            const startY = fx.to.y - tileSize * 1.5
            const midY1 = startY + tileSize * 0.5
            const midY2 = startY + tileSize
            const offset = tileSize * 0.15
            context.save()
            context.globalAlpha = 1 - t
            context.strokeStyle = '#7af'
            context.lineWidth = 3
            context.beginPath()
            context.moveTo(startX, startY)
            context.lineTo(startX + offset, midY1)
            context.lineTo(startX - offset, midY2)
            context.lineTo(fx.to.x, fx.to.y)
            context.stroke()
            context.restore()
        },
    },
    teleport: {
        duration: 600,
        draw(context, fx, t, tileSize) {
            const fadeOut = Math.max(0, 1 - t * 2)
            const fadeIn  = Math.max(0, t * 2 - 1)
            function drawPortal(x, y, alpha) {
                if (alpha <= 0) return
                context.save()
                context.globalAlpha = alpha
                context.strokeStyle = '#8ffa8b'
                context.lineWidth = 2
                context.beginPath()
                context.ellipse(x, y, tileSize * 0.28, tileSize * 0.38, 0, 0, Math.PI * 2)
                context.stroke()
                context.fillStyle = 'rgba(98,255,0,0.49)'
                context.fill()
                context.restore()
            }
            drawPortal(fx.from.x, fx.from.y, fadeOut)
            drawPortal(fx.to.x,   fx.to.y,   fadeIn)
        },
    },
}
