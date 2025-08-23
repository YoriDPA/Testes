class SnakePlayer {
    constructor(ctx, name, id) {
        this.ctx = ctx;
        this.name = name;
        this.id = id;

        // posição inicial (centro do mundo, se disponível)
        const startX = typeof game !== "undefined" && game?.WORLD_SIZE ? game.WORLD_SIZE.x / 2 : window.innerWidth / 2;
        const startY = typeof game !== "undefined" && game?.WORLD_SIZE ? game.WORLD_SIZE.y / 2 : window.innerHeight / 2;

        this.pos = new Point(startX, startY);
        this.parts = [new Point(this.pos.x, this.pos.y)]; // começa com a cabeça

        // aparência
        this.mainColor = ut.randomColor();
        this.supportColor = ut.color(this.mainColor, -0.3);

        // movimento
        this.velocity = new Point(0, 0);
        this.angle = 0;
        this.normalSpeed = 1.5;
        this.boostSpeed = 3;
        this.speed = this.normalSpeed;

        // atributos de jogo
        this.score = 0;
        this.size = 15;
        this.maxParts = 10;
        this.isBoosting = false;
        this.boostCooldown = 0;

        // estado
        this.state = 0; // 0=vivo, 1=morto
    }

    move() {
        if (this.state === 1) return;

        this.speed = this.isBoosting ? this.boostSpeed : this.normalSpeed;

        // boost: solta pedaços como comida
        if (this.isBoosting && this.parts.length > 10) {
            this.boostCooldown++;
            if (this.boostCooldown >= 10) {
                const tail = this.parts.pop();
                game.foods.push(new Food(game.ctxFood, tail.x, tail.y));
                this.score = Math.max(0, this.score - 1);
                this.boostCooldown = 0;
            }
        }

        // player segue o mouse
        if (this.id === 0) {
            this.angle = ut.getAngle(
                new Point(game.SCREEN_SIZE.x / 2, game.SCREEN_SIZE.y / 2),
                mouse
            );
        }

        // integra movimento
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

        // atualiza corpo
        this.parts.unshift(new Point(this.pos.x, this.pos.y));
        if (this.parts.length > this.maxParts) this.parts.pop();

        // comer comida
        this.checkFoodCollision();
    }

    checkSnakeCollision(otherSnake) {
        if (this.state === 1 || otherSnake.state === 1) return;
        if (this.id === otherSnake.id) return; // ignora o próprio corpo

        for (let i = 0; i < otherSnake.parts.length; i++) {
            const part = otherSnake.parts[i];
            if (ut.cirCollision(
                this.pos.x, this.pos.y, this.size / 2,
                part.x, part.y, otherSnake.size / 2
            )) {
                this.die();
                break;
            }
        }
    }

    die() {
        if (this.state === 1) return;
        this.state = 1;

        // transforma parte do corpo em comida
        for (let i = 0; i < this.parts.length; i += 3) {
            const part = this.parts[i];
            game.foods.push(new Food(game.ctxFood, part.x, part.y));
        }
    }

    checkFoodCollision() {
        for (let i = game.foods.length - 1; i >= 0; i--) {
            const food = game.foods[i];
            if (ut.cirCollision(
                this.pos.x, this.pos.y, this.size,
                food.pos.x, food.pos.y, food.size
            )) {
                food.die();
                this.score++;
                this.maxParts += 1;
            }
        }
    }

    draw() {
        if (this.parts.length < 1) return;

        // corpo (bolinhas)
        for (let i = this.parts.length - 1; i >= 0; i--) {
            const part = this.parts[i];
            this.ctx.beginPath();
            this.ctx.fillStyle = this.mainColor;
            this.ctx.arc(part.x + game.world.x, part.y + game.world.y, this.size / 2, 0, 2 * Math.PI);
            this.ctx.fill();
        }

        // cabeça
        const head = this.parts[0];
        this.ctx.beginPath();
        this.ctx.fillStyle = this.supportColor;
        this.ctx.arc(head.x + game.world.x, head.y + game.world.y, this.size / 2, 0, 2 * Math.PI);
        this.ctx.fill();

        // nome
        if (this.name) {
            this.ctx.fillStyle = "white";
            this.ctx.font = "12px Arial";
            this.ctx.textAlign = "center";
            this.ctx.fillText(this.name, head.x + game.world.x, head.y + game.world.y - this.size);
        }

        // olhos (apenas player)
        if (this.id === 0) {
            const eyeOffset = this.size / 2.5;
            const eyeRadius = this.size / 6;
            const eye1X = head.x + game.world.x + Math.cos(this.angle - 0.5) * eyeOffset;
            const eye1Y = head.y + game.world.y + Math.sin(this.angle - 0.5) * eyeOffset;
            const eye2X = head.x + game.world.x + Math.cos(this.angle + 0.5) * eyeOffset;
            const eye2Y = head.y + game.world.y + Math.sin(this.angle + 0.5) * eyeOffset;

            this.ctx.fillStyle = "white";
            this.ctx.beginPath();
            this.ctx.arc(eye1X, eye1Y, eyeRadius, 0, 2 * Math.PI);
            this.ctx.arc(eye2X, eye2Y, eyeRadius, 0, 2 * Math.PI);
            this.ctx.fill();

            this.ctx.fillStyle = "black";
            this.ctx.beginPath();
            this.ctx.arc(eye1X, eye1Y, eyeRadius / 2, 0, 2 * Math.PI);
            this.ctx.arc(eye2X, eye2Y, eyeRadius / 2, 0, 2 * Math.PI);
            this.ctx.fill();
        }
    }
}