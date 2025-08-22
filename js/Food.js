class Food {
    constructor(ctx, x, y) {
        this.ctx = ctx;
        this.pos = new Point(x, y);
        this.sizeMin = 3;
        this.sizeMax = 7;
        this.mainColor = ut.randomColor();
        this.supportColor = ut.color(this.mainColor, 0.5);
        this.size = ut.random(this.sizeMin, this.sizeMax);
        this.state = 0; // 0 = ativa, 1 = morrendo
    }

    draw() {
        // A posição da comida se move em relação ao jogador para criar a ilusão de câmera
        const drawX = this.pos.x + game.world.x;
        const drawY = this.pos.y + game.world.y;

        this.ctx.globalAlpha = 0.8;
        this.ctx.fillStyle = this.mainColor;
        this.ctx.beginPath();
        this.ctx.arc(drawX, drawY, this.size, 0, 2 * Math.PI);
        this.ctx.fill();
        
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = this.supportColor;
        this.ctx.beginPath();
        this.ctx.arc(drawX, drawY, this.size / 2.5, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    die() {
        this.state = 1;
        const index = game.foods.indexOf(this);
        if (index > -1) {
            game.foods.splice(index, 1);
        }
    }
}