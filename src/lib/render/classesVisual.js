export const CLASSES_VISUAL = {
    mage: {
        draw(context, px, py, tileSize) {
            const r = tileSize * 0.35

            context.save()

            // Chapeau principal
            context.fillStyle = '#7c3aed'
            context.strokeStyle = '#a78bfa'
            context.lineWidth = 1.5

            context.beginPath()
            context.moveTo(px, py - r - tileSize * 0.4)
            context.quadraticCurveTo(
                px - r * 0.2,
                py - r * 1.2,
                px - r * 0.8,
                py - r * 0.55,
            )
            context.lineTo(px + r * 0.8, py - r * 0.55)
            context.quadraticCurveTo(
                px + r * 0.2,
                py - r * 1.2,
                px,
                py - r - tileSize * 0.4,
            )
            context.closePath()
            context.fill()
            context.stroke()

            // Bord du chapeau
            context.fillStyle = '#5b21b6'
            context.beginPath()
            context.ellipse(
                px,
                py - r * 0.55,
                r * 0.95,
                r * 0.22,
                0,
                0,
                Math.PI * 2,
            )
            context.fill()

            // Gemme magique
            context.fillStyle = '#ede9fe'
            context.beginPath()
            context.moveTo(px, py - r * 1.05)
            context.lineTo(px + r * 0.12, py - r * 0.85)
            context.lineTo(px, py - r * 0.65)
            context.lineTo(px - r * 0.12, py - r * 0.85)
            context.closePath()
            context.fill()

            context.restore()
        },
    },
    tank: {
        draw(context, px, py, tileSize) {
            const r = tileSize * 0.35

            context.save()

            const sx = px + r * 0.8
            const sy = py

            context.fillStyle = '#475569'
            context.strokeStyle = '#cbd5e1'
            context.lineWidth = 1.5

            // Bouclier plus compact
            context.beginPath()
            context.moveTo(sx, sy - r * 0.75)
            context.quadraticCurveTo(
                sx + r * 0.55,
                sy - r * 0.55,
                sx + r * 0.45,
                sy,
            )
            context.quadraticCurveTo(
                sx + r * 0.4,
                sy + r * 0.6,
                sx,
                sy + r * 0.9,
            )
            context.quadraticCurveTo(
                sx - r * 0.4,
                sy + r * 0.6,
                sx - r * 0.45,
                sy,
            )
            context.quadraticCurveTo(
                sx - r * 0.55,
                sy - r * 0.55,
                sx,
                sy - r * 0.75,
            )
            context.closePath()
            context.fill()
            context.stroke()

            // Bord intérieur
            context.strokeStyle = '#94a3b8'
            context.lineWidth = 1

            context.beginPath()
            context.moveTo(sx, sy - r * 0.55)
            context.quadraticCurveTo(
                sx + r * 0.35,
                sy - r * 0.35,
                sx + r * 0.28,
                sy,
            )
            context.quadraticCurveTo(
                sx + r * 0.25,
                sy + r * 0.35,
                sx,
                sy + r * 0.6,
            )
            context.quadraticCurveTo(
                sx - r * 0.25,
                sy + r * 0.35,
                sx - r * 0.28,
                sy,
            )
            context.quadraticCurveTo(
                sx - r * 0.35,
                sy - r * 0.35,
                sx,
                sy - r * 0.55,
            )
            context.stroke()

            // Emblème
            context.strokeStyle = '#e2e8f0'
            context.lineWidth = 2

            context.beginPath()
            context.moveTo(sx, sy - r * 0.4)
            context.lineTo(sx, sy + r * 0.4)
            context.moveTo(sx - r * 0.25, sy)
            context.lineTo(sx + r * 0.25, sy)
            context.stroke()

            context.restore()
        },
    },
    warrior: {
        draw(context, px, py, tileSize) {
            const r = tileSize * 0.35

            context.save()

            // Casque principal
            context.fillStyle = '#64748b'
            context.strokeStyle = '#cbd5e1'
            context.lineWidth = 1.5

            context.beginPath()
            context.arc(px, py - r * 0.45, r * 0.9, Math.PI, 0)
            context.closePath()
            context.fill()
            context.stroke()

            // Bord inférieur du casque
            context.fillStyle = '#475569'
            context.beginPath()
            context.ellipse(
                px,
                py - r * 0.45,
                r * 0.9,
                r * 0.18,
                0,
                0,
                Math.PI * 2,
            )
            context.fill()

            // Renfort central
            context.fillStyle = '#94a3b8'
            context.beginPath()
            context.moveTo(px - r * 0.08, py - r * 1.3)
            context.lineTo(px + r * 0.08, py - r * 1.3)
            context.lineTo(px + r * 0.08, py - r * 0.15)
            context.lineTo(px - r * 0.08, py - r * 0.15)
            context.closePath()
            context.fill()

            // Pointe du casque
            context.fillStyle = '#cbd5e1'
            context.beginPath()
            context.moveTo(px, py - r * 1.55)
            context.lineTo(px + r * 0.15, py - r * 1.2)
            context.lineTo(px - r * 0.15, py - r * 1.2)
            context.closePath()
            context.fill()

            // Aile gauche
            context.fillStyle = '#fef3c7'
            context.strokeStyle = '#dddd90'

            context.beginPath()
            context.moveTo(px - r * 0.7, py - r * 0.75)
            context.quadraticCurveTo(
                px - r * 1.7,
                py - r * 1.8,
                px - r * 1.15,
                py - r * 1.15,
            )
            context.quadraticCurveTo(
                px - r * 1.45,
                py - r * 0.95,
                px - r * 0.7,
                py - r * 0.75,
            )
            context.closePath()
            context.fill()
            context.stroke()

            // Aile droite
            context.beginPath()
            context.moveTo(px + r * 0.7, py - r * 0.75)
            context.quadraticCurveTo(
                px + r * 1.7,
                py - r * 1.8,
                px + r * 1.15,
                py - r * 1.15,
            )
            context.quadraticCurveTo(
                px + r * 1.45,
                py - r * 0.95,
                px + r * 0.7,
                py - r * 0.75,
            )
            context.closePath()
            context.fill()
            context.stroke()

            context.restore()
        },
    },
    priest: {
        draw(context, px, py, tileSize) {
            const r = tileSize * 0.35
            context.save()

            // 1. HALO DIVIN (Arrière-plan lumineux)
            // On utilise l'effet d'ombrage natif du canvas pour créer une vraie lueur divine
            context.shadowColor = '#fbbf24' // Jaune ambré lumineux
            context.shadowBlur = 12
            context.strokeStyle = '#fef08a'
            context.lineWidth = 2.5

            context.beginPath()
            // Un arc de cercle majestueux qui entoure le haut de la tête
            context.arc(px, py - r * 0.2, r * 0.95, Math.PI * 0.8, Math.PI * 2.2)
            context.stroke()

            // /!\ TRÈS IMPORTANT : On reset la shadow pour ne pas lisser le reste du dessin
            context.shadowBlur = 0

            // 2. CAPUCHE CÉRÉMONIELLE (Tissu blanc extérieur)
            context.fillStyle = '#f8fafc' // Blanc pur / Église
            context.strokeStyle = '#cbd5e1'
            context.lineWidth = 1.5

            context.beginPath()
            context.moveTo(px, py - r * 1.4) // Pointe supérieure souple
            context.quadraticCurveTo(
                px - r * 0.95,
                py - r * 1.1,
                px - r * 0.85,
                py - r * 0.2,
            ) // Flanc gauche
            context.quadraticCurveTo(
                px,
                py - r * 0.4,
                px + r * 0.85,
                py - r * 0.2,
            ) // Bas de la capuche (cou)
            context.quadraticCurveTo(
                px + r * 0.95,
                py - r * 1.1,
                px,
                py - r * 1.4,
            ) // Flanc droit
            context.closePath()
            context.fill()
            context.stroke()

            // 3. DOUBLURE ET OMBRE INTERNE (Donne l'effet "creux" de la capuche)
            context.fillStyle = '#e2e8f0' // Ombre grise douce
            context.beginPath()
            context.moveTo(px, py - r * 1.15)
            context.quadraticCurveTo(
                px - r * 0.65,
                py - r * 0.9,
                px - r * 0.55,
                py - r * 0.25,
            )
            context.quadraticCurveTo(
                px,
                py - r * 0.4,
                px + r * 0.55,
                py - r * 0.25,
            )
            context.quadraticCurveTo(
                px + r * 0.65,
                py - r * 0.9,
                px,
                py - r * 1.15,
            )
            context.closePath()
            context.fill()

            // 4. BORDURE DORÉE (Le petit détail premium style "Guerrier/Mage")
            context.strokeStyle = '#f59e0b' // Or
            context.lineWidth = 1.5
            context.beginPath()

// Bordure gauche
            context.moveTo(px, py - r * 1.4)
            context.quadraticCurveTo(
                px - r * 0.95,
                py - r * 1.1,
                px - r * 0.85,
                py - r * 0.2
            )

            // Bordure droite
            context.moveTo(px, py - r * 1.4)
            context.quadraticCurveTo(
                px + r * 0.95,
                py - r * 1.1,
                px + r * 0.85,
                py - r * 0.2
            )
            context.stroke()

            // 5. CROIX SACRÉE (Version réduite et plus fine)
            const cx = px
            const cy = py - r * 0.85 // Légèrement remontée

            // Effet de lueur douce
            context.shadowColor = '#fbbf24'
            context.shadowBlur = 4

            context.fillStyle = '#f59e0b'
            context.strokeStyle = '#fde047'
            context.lineWidth = 0.5

            // On divise les proportions par 1.5 pour une croix plus petite
            const w = r * 0.05
            const hTop = r * 0.15
            const hBot = r * 0.25
            const arm = r * 0.15

            context.beginPath()
            context.moveTo(cx - w, cy - hTop)
            context.lineTo(cx, cy - hTop - w * 2)
            context.lineTo(cx + w, cy - hTop)
            context.lineTo(cx + w, cy - w)
            context.lineTo(cx + arm, cy - w)
            context.lineTo(cx + arm + w * 2, cy)
            context.lineTo(cx + arm, cy + w)
            context.lineTo(cx + w, cy + w)
            context.lineTo(cx + w, cy + hBot)
            context.lineTo(cx, cy + hBot + w * 2)
            context.lineTo(cx - w, cy + hBot)
            context.lineTo(cx - w, cy + w)
            context.lineTo(cx - arm, cy + w)
            context.lineTo(cx - arm - w * 2, cy)
            context.lineTo(cx - arm, cy - w)
            context.lineTo(cx - w, cy - w)
            context.closePath()
            context.fill()
            context.stroke()

            context.shadowBlur = 0

            // Petit cristal central
            context.fillStyle = '#ffffff'
            context.beginPath()
            context.arc(cx, cy, w * 1.2, 0, Math.PI * 2)
            context.fill()

            context.restore()
        },
    },
}