// Objeto para agrupar funções utilitárias
const ut = {
    // Gera um número aleatório num intervalo
    random: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Gera uma cor hexadecimal aleatória
    randomColor: function() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    },

    // Escurece ou clareia uma cor hexadecimal
    color: function(color, percent) {
        let f = parseInt(color.slice(1), 16),
            t = percent < 0 ? 0 : 255,
            p = percent < 0 ? percent * -1 : percent,
            R = f >> 16,
            G = (f >> 8) & 0x00ff,
            B = f & 0x0000ff;
        return (
            "#" +
            (
                0x1000000 +
                (Math.round((t - R) * p) + R) * 0x10000 +
                (Math.round((t - G) * p) + G) * 0x100 +
                (Math.round((t - B) * p) + B)
            )
            .toString(16)
            .slice(1)
        );
    },

    // Calcula o ângulo entre dois pontos
    getAngle: function(p1, p2) {
        return Math.atan2(p2.y - p1.y, p2.x - p1.x);
    },

    // Verifica a colisão entre dois círculos
    cirCollision: function(x1, y1, r1, x2, y2, r2) {
        const dx = x1 - x2;
        const dy = y1 - y2;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < r1 + r2;
    }
};