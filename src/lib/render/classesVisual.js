export const CLASSES_VISUAL = {
    mage: {
        draw(context, px, py, tileSize) {
            const r = tileSize * 0.35
            context.save()
            context.fillStyle = '#7c3aed'
            context.strokeStyle = '#a78bfa'
            context.lineWidth = 1.5
            context.beginPath()
            context.moveTo(px, py - r - tileSize * 0.35)
            context.lineTo(px - r * 0.7, py - r * 0.6)
            context.lineTo(px + r * 0.7, py - r * 0.6)
            context.closePath()
            context.fill()
            context.stroke()
            context.fillStyle = '#5b21b6'
            context.beginPath()
            context.ellipse(px, py - r * 0.6, r * 0.85, r * 0.2, 0, 0, Math.PI * 2)
            context.fill()
            context.restore()
        },
    },
    tank: {
        draw(context, px, py, tileSize) {
            const r = tileSize * 0.35
            const sx = px + r * 0.85
            const sy = py
            const w = tileSize * 0.18
            const h = tileSize * 0.32
            context.save()
            context.fillStyle = '#3a2308'
            context.strokeStyle = '#7c7b76'
            context.lineWidth = 1.5
            context.beginPath()
            context.moveTo(sx - w, sy - h * 0.8)
            context.lineTo(sx + w, sy - h * 0.8)
            context.lineTo(sx + w, sy + h * 0.2)
            context.quadraticCurveTo(sx + w, sy + h * 0.8, sx, sy + h * 0.8)
            context.quadraticCurveTo(sx - w, sy + h * 0.8, sx - w, sy + h * 0.2)
            context.closePath()
            context.fill()
            context.stroke()
            context.strokeStyle = '#7c7b76'
            context.lineWidth = 1.5
            context.beginPath()
            context.moveTo(sx, sy - h * 0.6)
            context.lineTo(sx, sy + h * 0.6)
            context.moveTo(sx - w * 0.8, sy)
            context.lineTo(sx + w * 0.8, sy)
            context.stroke()
            context.restore()
        },
    },
    warrior: {
        draw(context, px, py, tileSize) {
            const r = tileSize * 0.35
            context.save()
            context.fillStyle = '#64748b'
            context.strokeStyle = '#94a3b8'
            context.lineWidth = 1.5
            context.beginPath()
            context.arc(px, py - r * 0.6, r * 0.75, Math.PI, 0)
            context.closePath()
            context.fill()
            context.stroke()
            context.fillStyle = '#e2e8f0'
            context.strokeStyle = '#94a3b8'
            context.beginPath()
            context.moveTo(px - r * 0.75, py - r * 0.8)
            context.lineTo(px - r * 1.25, py - r * 1.5)
            context.lineTo(px - r * 0.55, py - r * 1.1)
            context.closePath()
            context.fill()
            context.stroke()
            context.beginPath()
            context.moveTo(px + r * 0.75, py - r * 0.8)
            context.lineTo(px + r * 1.25, py - r * 1.5)
            context.lineTo(px + r * 0.55, py - r * 1.1)
            context.closePath()
            context.fill()
            context.stroke()
            context.restore()
        },
    },
}
