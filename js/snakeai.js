class SnakeAi extends SnakePlayer {
    constructor(ctx, name, id) {
        super(ctx, name, id);

        // spawn aleatório, longe da borda
        const margin = 60;
        const rx = ut.random(margin, game.WORLD_SIZE.x - margin);
        const ry = ut.random(margin, game.WORLD_SIZE.y - margin);

        this.pos = new Point(rx, ry);
        this.parts = [new Point(this.pos.x, this.pos.y)];
        this.state = 0;

        this.speed = this.normalSpeed;
        this.angle = Math.random() * Math.PI * 2;
        this.target = null;
    }

    move() {
        if (this.state === 1) return;

        // leve aleatoriedade na direção
        if (Math.random() < 0.03) {
            this.angle += (Math.random() - 0.5) * 0.6;
        }

        this.velocity.x = this.speed * Math.cos(this.angle);
        this.velocity.y = this.speed * Math.sin(this.angle);

        this.pos.x += this.velocity.x;
        this.pos.y += this.velocity.y;

        // ✅ colisão com parede = morte
        const half = this.size / 2;
        if (
            this.pos.x < half ||
            this.pos.x > game.WORLD_SIZE.x - half ||
            this.pos.y < half ||
            this.pos.y > game.WORLD_SIZE.y - half
        ) {
            this.die();
            return;
        }

        this.parts.unshift(new Point(this.pos.x, this.pos.y));
        if (this.parts.length > this.maxParts) this.parts.pop();

        this.checkFoodCollision();
    }
}