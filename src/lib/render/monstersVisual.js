export const MONSTERS_VISUAL = {
    goblin: {
        draw(context, px, py, r) {
            // 1. Oreilles pointues et tombantes (arrière-plan)
            context.fillStyle = '#3f6212'; // Vert foncé pour l'arrière/ombre

            // Oreille gauche
            context.beginPath();
            context.moveTo(px - r * 0.5, py - r * 0.2);
            context.quadraticCurveTo(px - r * 1.5, py - r * 0.8, px - r * 1.8, py);
            context.quadraticCurveTo(px - r * 1.2, py + r * 0.4, px - r * 0.5, py + r * 0.3);
            context.fill();

            // Oreille droite
            context.beginPath();
            context.moveTo(px + r * 0.5, py - r * 0.2);
            context.quadraticCurveTo(px + r * 1.5, py - r * 0.8, px + r * 1.8, py);
            context.quadraticCurveTo(px + r * 1.2, py + r * 0.4, px + r * 0.5, py + r * 0.3);
            context.fill();

            // 2. Corps principal
            context.fillStyle = '#65a30d'; // Vert olive
            context.beginPath();
            context.arc(px, py, r, 0, Math.PI * 2);
            context.fill();

            // 3. Gros nez proéminent
            context.fillStyle = '#4d7c0f'; // Vert plus sombre
            context.beginPath();
            context.ellipse(px, py + r * 0.1, r * 0.4, r * 0.3, 0, 0, Math.PI * 2);
            context.fill();

            // 4. Yeux sournois (inclinés)
            context.fillStyle = '#fef08a'; // Jaune pâle

            context.beginPath();
            context.ellipse(px - r * 0.35, py - r * 0.3, r * 0.2, r * 0.1, Math.PI / 8, 0, Math.PI * 2);
            context.fill();

            context.beginPath();
            context.ellipse(px + r * 0.35, py - r * 0.3, r * 0.2, r * 0.1, -Math.PI / 8, 0, Math.PI * 2);
            context.fill();

            // Pupilles
            context.fillStyle = '#000';
            context.beginPath();
            context.arc(px - r * 0.35, py - r * 0.3, r * 0.06, 0, Math.PI * 2);
            context.fill();
            context.beginPath();
            context.arc(px + r * 0.35, py - r * 0.3, r * 0.06, 0, Math.PI * 2);
            context.fill();

            // 5. Petite dent qui dépasse (croc inférieur)
            context.fillStyle = '#fff';
            context.beginPath();
            context.moveTo(px - r * 0.1, py + r * 0.5);
            context.lineTo(px + r * 0.1, py + r * 0.5);
            context.lineTo(px, py + r * 0.8);
            context.closePath();
            context.fill();
        },
    },

    slime: {
        draw(context, px, py, r) {
            // 1. Corps gélatineux aplati
            context.fillStyle = '#06b6d4'; // Cyan vibrant
            context.beginPath();
            context.ellipse(px, py + r * 0.2, r * 1.15, r * 0.85, 0, 0, Math.PI * 2);
            context.fill();

            // 2. Reflet de lumière (Donne le côté brillant/3D)
            context.fillStyle = 'rgba(255, 255, 255, 0.3)';
            context.beginPath();
            context.ellipse(px - r * 0.4, py - r * 0.2, r * 0.4, r * 0.15, -Math.PI / 6, 0, Math.PI * 2);
            context.fill();

            // 3. Yeux écarquillés (taille légèrement différente pour un côté "derpy")
            context.fillStyle = '#fff';
            context.beginPath();
            context.arc(px - r * 0.3, py + r * 0.1, r * 0.25, 0, Math.PI * 2); // Oeil gauche plus gros
            context.fill();

            context.beginPath();
            context.arc(px + r * 0.35, py + r * 0.05, r * 0.2, 0, Math.PI * 2); // Oeil droit
            context.fill();

            // Pupilles
            context.fillStyle = '#0f172a'; // Bleu très foncé
            context.beginPath();
            context.arc(px - r * 0.25, py + r * 0.1, r * 0.1, 0, Math.PI * 2);
            context.fill();

            context.beginPath();
            context.arc(px + r * 0.35, py + r * 0.05, r * 0.08, 0, Math.PI * 2);
            context.fill();

            // 4. Bouche (petite courbe mignonne)
            context.strokeStyle = '#0891b2'; // Cyan foncé
            context.lineWidth = 2;
            context.beginPath();
            context.arc(px + r * 0.05, py + r * 0.3, r * 0.15, 0, Math.PI, false);
            context.stroke();
        },
    },

    demon: {
        draw(context, px, py, r) {
            // 1. Petites ailes de démon (arrière-plan)
            context.fillStyle = '#9a0d0d'; // Violet très sombre

            // Aile gauche
            context.beginPath();
            context.moveTo(px - r * 0.8, py);
            context.quadraticCurveTo(px - r * 1.8, py - r * 1.0, px - r * 2.0, py - r * 0.5);
            context.quadraticCurveTo(px - r * 1.5, py - r * 0.2, px - r * 1.8, py + r * 0.2);
            context.quadraticCurveTo(px - r * 1.2, py + r * 0.1, px - r * 0.6, py + r * 0.4);
            context.fill();

            // Aile droite
            context.beginPath();
            context.moveTo(px + r * 0.8, py);
            context.quadraticCurveTo(px + r * 1.8, py - r * 1.0, px + r * 2.0, py - r * 0.5);
            context.quadraticCurveTo(px + r * 1.5, py - r * 0.2, px + r * 1.8, py + r * 0.2);
            context.quadraticCurveTo(px + r * 1.2, py + r * 0.1, px + r * 0.6, py + r * 0.4);
            context.fill();

            // 2. Cornes épaisses et tordues (arrière-plan)
            context.fillStyle = '#171717'; // Presque noir

            context.beginPath();
            context.moveTo(px - r * 0.3, py - r * 0.5);
            context.quadraticCurveTo(px - r * 0.8, py - r * 1.5, px - r * 0.2, py - r * 2.0);
            context.quadraticCurveTo(px - r * 0.1, py - r * 1.2, px + r * 0.1, py - r * 0.8);
            context.fill();

            context.beginPath();
            context.moveTo(px + r * 0.3, py - r * 0.5);
            context.quadraticCurveTo(px + r * 0.8, py - r * 1.5, px + r * 0.2, py - r * 2.0);
            context.quadraticCurveTo(px + r * 0.1, py - r * 1.2, px - r * 0.1, py - r * 0.8);
            context.fill();

            // 3. Corps principal
            context.fillStyle = '#dc2626'; // Rouge sang
            context.beginPath();
            context.arc(px, py, r, 0, Math.PI * 2);
            context.fill();

            // 4. Yeux enflammés / fâchés
            context.fillStyle = '#fef08a'; // Jaune agressif
            context.shadowColor = '#facc15';
            context.shadowBlur = 8; // Petit effet de lueur

            context.beginPath();
            context.moveTo(px - r * 0.6, py - r * 0.3);
            context.lineTo(px - r * 0.1, py - r * 0.1);
            context.lineTo(px - r * 0.4, py);
            context.closePath();
            context.fill();

            context.beginPath();
            context.moveTo(px + r * 0.6, py - r * 0.3);
            context.lineTo(px + r * 0.1, py - r * 0.1);
            context.lineTo(px + r * 0.4, py);
            context.closePath();
            context.fill();

            context.shadowBlur = 0; // On reset le flou pour ne pas affecter le reste

            // 5. Bouche en zigzag (dents aiguisées)
            context.fillStyle = '#000';
            context.beginPath();
            context.moveTo(px - r * 0.4, py + r * 0.4);
            context.lineTo(px - r * 0.2, py + r * 0.6);
            context.lineTo(px, py + r * 0.4);
            context.lineTo(px + r * 0.2, py + r * 0.6);
            context.lineTo(px + r * 0.4, py + r * 0.4);
            context.lineTo(px + r * 0.3, py + r * 0.7);
            context.lineTo(px - r * 0.3, py + r * 0.7);
            context.closePath();
            context.fill();
        },
    },

    dragon: {
        draw(context, px, py, r) {
            // 1. Ailes courbées
            context.fillStyle = '#0f4d22';
            context.strokeStyle = '#052e11';
            context.lineWidth = 2;

            // Aile gauche
            context.beginPath();
            context.moveTo(px - r * 0.7, py);
            context.quadraticCurveTo(px - r * 2.2, py - r * 1.5, px - r * 2.5, py - r * 0.2);
            context.quadraticCurveTo(px - r * 1.5, py + r * 1.0, px - r * 0.7, py + r * 0.5);
            context.fill();
            context.stroke();

            // Aile droite
            context.beginPath();
            context.moveTo(px + r * 0.7, py);
            context.quadraticCurveTo(px + r * 2.2, py - r * 1.5, px + r * 2.5, py - r * 0.2);
            context.quadraticCurveTo(px + r * 1.5, py + r * 1.0, px + r * 0.7, py + r * 0.5);
            context.fill();
            context.stroke();

            //Cornes
            context.fillStyle = '#f59e0b';
            context.beginPath();
            context.moveTo(px - r * 0.2, py - r * 0.6);
            context.lineTo(px - r * 0.7, py - r * 1.5);
            context.lineTo(px - r * 0.8, py - r * 0.5);
            context.closePath();
            context.fill();

            context.beginPath();
            context.moveTo(px + r * 0.2, py - r * 0.6);
            context.lineTo(px + r * 0.7, py - r * 1.5);
            context.lineTo(px + r * 0.8, py - r * 0.5);
            context.closePath();
            context.fill();

            // 3. Corps principal
            context.fillStyle = '#16a34a';
            context.beginPath();
            context.arc(px, py, r, 0, Math.PI * 2);
            context.fill();

            // 4. Museau proéminent
            context.fillStyle = '#15803d';
            context.beginPath();
            context.ellipse(px, py + r * 0.3, r * 0.65, r * 0.45, 0, 0, Math.PI * 2);
            context.fill();

            // Narines
            context.fillStyle = '#052e11';
            context.beginPath();
            context.arc(px - r * 0.25, py + r * 0.45, r * 0.08, 0, Math.PI * 2);
            context.fill();
            context.beginPath();
            context.arc(px + r * 0.25, py + r * 0.45, r * 0.08, 0, Math.PI * 2);
            context.fill();

            // 5. Yeux
            context.fillStyle = '#fef08a';

            // Fond de l'oeil gauche
            context.beginPath();
            context.ellipse(px - r * 0.35, py - r * 0.15, r * 0.2, r * 0.12, Math.PI / 5, 0, Math.PI * 2);
            context.fill();

            // Fond de l'oeil droit
            context.beginPath();
            context.ellipse(px + r * 0.35, py - r * 0.15, r * 0.2, r * 0.12, -Math.PI / 5, 0, Math.PI * 2);
            context.fill();

            // Pupilles fendues
            context.fillStyle = '#000';
            context.beginPath();
            context.ellipse(px - r * 0.35, py - r * 0.15, r * 0.04, r * 0.1, 0, 0, Math.PI * 2);
            context.fill();
            context.beginPath();
            context.ellipse(px + r * 0.35, py - r * 0.15, r * 0.04, r * 0.1, 0, 0, Math.PI * 2);
            context.fill();

            // 6. Crocs qui dépassent du museau
            context.fillStyle = '#f8fafc'; // Blanc cassé

            // Croc gauche
            context.beginPath();
            context.moveTo(px - r * 0.4, py + r * 0.6);
            context.lineTo(px - r * 0.3, py + r * 0.95);
            context.lineTo(px - r * 0.15, py + r * 0.65);
            context.closePath();
            context.fill();

            // Croc droit
            context.beginPath();
            context.moveTo(px + r * 0.4, py + r * 0.6);
            context.lineTo(px + r * 0.3, py + r * 0.95);
            context.lineTo(px + r * 0.15, py + r * 0.65);
            context.closePath();
            context.fill();
        },
    },
}
