export const ATTACKS_VISUAL = {
    melee: {
        duration: 250, // Légèrement allongé pour apprécier l'effet
        draw(context, fx, t, tileSize) {
            // Position actuelle interpolée
            const x = fx.from.x + (fx.to.x - fx.from.x) * t
            const y = fx.from.y + (fx.to.y - fx.from.y) * t

            // Calcul de l'angle pour orienter le coupure vers la cible
            const angle = Math.atan2(fx.to.y - fx.from.y, fx.to.x - fx.from.x)

            context.save()
            context.translate(x, y)
            context.rotate(angle)
            context.globalAlpha = 1 - t // S'efface progressivement

            // 1. Traînée rouge sang (arrière-plan)
            context.fillStyle = '#dc2626'
            context.beginPath()
            context.moveTo(-tileSize * 0.2, -tileSize * 0.25)
            context.quadraticCurveTo(tileSize * 0.4, 0, -tileSize * 0.2, tileSize * 0.25)
            context.quadraticCurveTo(tileSize * 0.1, 0, -tileSize * 0.2, -tileSize * 0.25)
            context.fill()

            // 2. Lame tranchante (croissant blanc/gris)
            context.fillStyle = '#f3f4f6'
            context.beginPath()
            context.moveTo(0, -tileSize * 0.3)
            context.quadraticCurveTo(tileSize * 0.5, 0, 0, tileSize * 0.3)
            context.quadraticCurveTo(tileSize * 0.2, 0, 0, -tileSize * 0.3)
            context.fill()

            context.restore()
        },
    },

    fireball: {
        duration: 400,
        draw(context, fx, t, tileSize) {
            const x = fx.from.x + (fx.to.x - fx.from.x) * t
            const y = fx.from.y + (fx.to.y - fx.from.y) * t
            const angle = Math.atan2(fx.to.y - fx.from.y, fx.to.x - fx.from.x)

            context.save()
            context.translate(x, y)
            context.rotate(angle)

            // Lueur globale
            context.shadowColor = '#ea580c'
            context.shadowBlur = 15

            // 1. Traînée de flammes (vers l'arrière)
            context.fillStyle = '#ef4444' // Rouge
            context.beginPath()
            context.moveTo(tileSize * 0.1, 0) // Pointe avant
            context.lineTo(-tileSize * 0.5, -tileSize * 0.2)
            context.quadraticCurveTo(-tileSize * 0.2, 0, -tileSize * 0.5, tileSize * 0.2)
            context.closePath()
            context.fill()

            // 2. Corps de la boule de feu
            context.fillStyle = '#f97316' // Orange
            context.beginPath()
            context.arc(0, 0, tileSize * 0.18, 0, Math.PI * 2)
            context.fill()

            // 3. Cœur brûlant
            context.shadowBlur = 0 // On coupe la lueur pour le centre
            context.fillStyle = '#fef08a' // Jaune clair
            context.beginPath()
            context.arc(tileSize * 0.06, 0, tileSize * 0.1, 0, Math.PI * 2) // Décalé vers l'avant
            context.fill()

            context.restore()
        },
    },

    thunder: {
        duration: 400, // Un peu plus long pour voir l'impact
        draw(context, fx, t, tileSize) {
            const startX = fx.to.x
            const startY = fx.to.y - tileSize * 2.5 // Tombe de très haut

            // L'éclair descend rapidement (à t=0.5, il a touché le sol)
            const endY = startY + (fx.to.y - startY) * Math.min(t * 2, 1)
            const alpha = 1 - (t * t) // Disparaît plus lentement à la fin

            context.save()
            context.globalAlpha = alpha

            // Lueur électrique
            context.shadowColor = '#3b82f6'
            context.shadowBlur = 20

            // 1. Forme brisée de l'éclair
            context.fillStyle = '#bfdbfe' // Bleu très clair
            context.beginPath()
            context.moveTo(startX - tileSize * 0.15, startY)
            context.lineTo(startX + tileSize * 0.2, startY + tileSize * 1.2)
            context.lineTo(startX - tileSize * 0.1, startY + tileSize * 1.4)
            context.lineTo(startX + tileSize * 0.1, endY) // Pointe
            context.lineTo(startX - tileSize * 0.2, startY + tileSize * 1.5)
            context.lineTo(startX + tileSize * 0.05, startY + tileSize * 1.1)
            context.closePath()
            context.fill()

            // 2. Flash d'impact au sol (quand l'éclair touche)
            if (t > 0.3) {
                context.fillStyle = '#ffffff'
                context.beginPath()
                // Une ellipse aplatie au sol
                context.ellipse(fx.to.x, fx.to.y, tileSize * 0.4 * alpha, tileSize * 0.15 * alpha, 0, 0, Math.PI * 2)
                context.fill()
            }

            context.restore()
        },
    },

    teleport: {
        duration: 600,
        draw(context, fx, t, tileSize) {
            const fadeOut = Math.max(0, 1 - t * 2)
            const fadeIn  = Math.max(0, t * 2 - 1)

            // Rotation continue pendant l'animation
            const rotation = t * Math.PI * 4

            function drawPortal(x, y, alpha) {
                if (alpha <= 0) return

                context.save()
                context.translate(x, y)
                context.rotate(rotation)
                context.globalAlpha = alpha

                // 1. Halo extérieur ténébreux
                context.fillStyle = '#4c1d95' // Violet sombre
                context.beginPath()
                context.arc(0, 0, tileSize * 0.45, 0, Math.PI * 2)
                context.fill()

                // 2. Spirales magiques
                context.fillStyle = '#a855f7' // Violet vif
                context.beginPath()
                for(let i = 0; i < 4; i++) {
                    context.moveTo(0, 0)
                    context.quadraticCurveTo(tileSize * 0.4, -tileSize * 0.2, tileSize * 0.35, tileSize * 0.35)
                    context.rotate(Math.PI / 2) // Tourne de 90° à chaque pétale
                }
                context.fill()

                // 3. Cœur d'énergie pure
                context.fillStyle = '#f3e8ff'
                context.beginPath()
                context.arc(0, 0, tileSize * 0.15, 0, Math.PI * 2)
                context.fill()

                context.restore()
            }

            drawPortal(fx.from.x, fx.from.y, fadeOut) // Portail de départ disparaît
            drawPortal(fx.to.x,   fx.to.y,   fadeIn)  // Portail d'arrivée apparaît
        },
    },
}