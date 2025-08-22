class Snake {
    constructor(ctx, name, id) {
        this.ctx = ctx;
        this.name = name;
        this.id = id;
        this.pos = new Point(0, 0);
        this.parts = [];
        this.mainColor = ut.randomColor();
        this.supportColor = ut.color(this.mainColor, -0.3);
        this.velocity = new Point(0, 0);
        this.angle = 0;
        this.normalSpeed = 1.5; // Velocidade padrão
        this.boostSpeed = 3;    // Velocidade com boost
        this.speed = this.normalSpeed;
        this.score = 0;
        this.state = 0; // 0 = vivo, 1 = morto
        this.size = 10;
        this.maxParts = 10;
        this.isBoosting = false; // Controla o estado de boost
        this.boostCooldown = 0;  // Temporizador para o custo do boost
    }

    move() {
        if (this.state === 1) return;

        // Lógica de boost: aumenta a velocidade e consome o corpo
        this.speed = this.isBoosting ? this.boostSpeed : this.normalSpeed;

        if (this.isBoosting && this.parts.length > 10) {
            this.boostCooldown++;
            if (this.boostCooldown >= 5) { // A cada 5 frames de boost...
                const tail = this.parts.pop(); // ...remove uma parte da cauda...
                game.foods.push(new Food(game.ctxFood, tail.x, tail.y)); // ...e deixa comida no lugar.
                this.score = Math.max(0, this.score - 1); // Perde 1 ponto de score
                this.boostCooldown = 0;
            }
        }

        if (this.id === 0) {
            this.angle = ut.getAngle(new Point(game.SCREEN_SIZE.x / 2, game.SCREEN_SIZE.y / 2), mouse);
        }

        this.velocity.x = this.speed * Math.cos(this.angle);
        this.velocity.y = this.speed * Math.sin(this.angle);

        this.pos.x += this.velocity.x;
        this.pos.y += this.velocity.y;
        
        const worldSize = game.WORLD_SIZE;
        const halfSize = this.size / 2;
        if (this.pos.x <= halfSize || this.pos.x >= worldSize.x - halfSize ||
            this.pos.y <= halfSize || this.pos.y >= worldSize.y - halfSize) {
            this.die();
        }

        this.parts.unshift(new Point(this.pos.x, this.pos.y));

        if (this.parts.length > this.maxParts) {
            this.parts.pop();
        }

        this.checkFoodCollision();
    }

    checkSnakeCollision(otherSnake) {
        if (this.state === 1 || otherSnake.state === 1 || this.id === otherSnake.id) {
            return;
        }
        for (let i = 0; i < otherSnake.parts.length; i++) {
            const part = otherSnake.parts[i];
            if (ut.cirCollision(this.pos.x, this.pos.y, this.size / 2, part.x, part.y, otherSnake.size / 2)) {
                this.die();
                break;
            }
        }
    }

    die() {
        if (this.state === 1) return;

        this.state = 1;
        for (let i = 0; i < this.parts.length; i += 3) {
            const part = this.parts[i];
            game.foods.push(new Food(game.ctxFood, part.x, part.y));
        }
    }

    checkFoodCollision() {
        for (let i = game.foods.length - 1; i >= 0; i--) {
            const food = game.foods[i];
            if (ut.cirCollision(this.pos.x, this.pos.y, this.size, food.pos.x, food.pos.y, food.size)) {
                food.die();
                this.score++;
                this.maxParts += 1;
            }
        }
    }

    draw() {
        if (this.parts.length < 1) return;

        this.ctx.beginPath();
        this.ctx.moveTo(this.parts[this.parts.length - 1].x + game.world.x, this.parts[this.parts.length - 1].y + game.world.y);
        
        for (let i = this.parts.length - 2; i >= 0; i--) {
            const part = this.parts[i];
            const drawX = part.x + game.world.x;
            const drawY = part.y + game.world.y;
            this.ctx.lineTo(drawX, drawY);
        }
        
        this.ctx.strokeStyle = this.mainColor;
        this.ctx.lineWidth = this.size * 1.8;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();

        const head = this.parts[0];
        const headDrawX = head.x + game.world.x;
        const headDrawY = head.y + game.world.y;
        this.ctx.beginPath();
        this.ctx.fillStyle = this.supportColor;
        this.ctx.arc(headDrawX, headDrawY, this.size / 1.5, 0, 2 * Math.PI);
        this.ctx.fill();
    }
}