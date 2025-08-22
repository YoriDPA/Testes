class SnakeAi extends Snake {
     constructor(ctx, name, id) {
        super(ctx, name, id);
        this.pos = new Point(ut.random(50, game.WORLD_SIZE.x - 50), ut.random(50, game.WORLD_SIZE.y - 50));
        this.speed = ut.random(1, 2); // << VELOCIDADE DA IA REDUZIDA NOVAMENTE
        this.target = null;
     }

     findClosestFood() {
        let closestFood = null;
        let minDistance = Infinity;

        for(const food of game.foods) {
            const distance = ut.getDistance(this.pos, food.pos);
            if (distance < minDistance) {
                minDistance = distance;
                closestFood = food;
            }
        }
        return closestFood;
     }

     move() {
        const worldSize = game.WORLD_SIZE;
        const margin = 50; // Margem para a IA virar antes de bater na parede

        // << NOVO: LÓGICA PARA A IA MUDAR DE DIREÇÃO PERTO DA BORDA
        if (this.pos.x < margin || this.pos.x > worldSize.x - margin || 
            this.pos.y < margin || this.pos.y > worldSize.y - margin) {
            // Se a IA está perto da borda, faz ela mirar no centro do mapa
            this.angle = ut.getAngle(this.pos, new Point(worldSize.x / 2, worldSize.y / 2));
        } else {
            // Comportamento normal de procurar comida
            if (!this.target || this.target.state === 1) {
                this.target = this.findClosestFood();
            }
            
            if (this.target) {
                this.angle = ut.getAngle(this.pos, this.target.pos);
            } else {
                this.angle += ut.random(-1, 1) * 0.1;
            }
        }
        
        super.move();
     }
}