class SnakePlayer {
    constructor(ctx, name, id) {
        this.ctx = ctx;
        this.name = name;
        this.id = id;

        this.pos = new Point(0, 0);
        this.parts = [new Point(0, 0)];

        // A cor será definida pelo Game.js com base nos dados do Firebase
        this.color = '#FFFFFF'; // Cor padrão

        // Movimento
        this.velocity = new Point(0, 0);
        this.angle = 0;
        this.normalSpeed = 1.5;
        this.boostSpeed = 3;
        this.speed = this.normalSpeed;

        // Atributos de jogo
        this.score = 0;
        this.size = 15;
        this.maxParts = 10;
        this.isBoosting = false;
        this.boostCooldown = 0;

        // Estado
        this.state = 0; // 0=vivo, 1=morto
    }

    move(mouse) {
        if (this.state === 1) return;

        this.speed = this.isBoosting ? this.boostSpeed : this.normalSpeed;

        this.angle = ut.getAngle(
            new Point(game.SCREEN_SIZE.x / 2, game.SCREEN_SIZE.y / 2),
            mouse
        );

        this.velocity.x = this.speed * Math.cos(this.angle);
        this.velocity.y = this.speed * Math.sin(this.angle);
        this.pos.x += this.velocity.x;
        this.pos.y += this.velocity.y;

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

    draw(world) {
        if (this.parts.length < 1) return;

        // --- CORREÇÃO DA COR ---
        // Corpo desenhado como uma linha contínua
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.color; // Usa a cor recebida do Firebase
        this.ctx.lineWidth = this.size;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.moveTo(this.parts[0].x + world.x, this.parts[0].y + world.y);
        for (let i = 1; i < this.parts.length; i++) {
            const part = this.parts[i];
            this.ctx.lineTo(part.x + world.x, part.y + world.y);
        }
        this.ctx.stroke();

        // Cabeça (com uma cor ligeiramente mais escura)
        const head = this.parts[0];
        this.ctx.beginPath();
        this.ctx.fillStyle = ut.color(this.color, -0.3); // Calcula a cor da cabeça a partir da cor principal
        this.ctx.arc(head.x + world.x, head.y + world.y, this.size / 2, 0, 2 * Math.PI);
        this.ctx.fill();
        // --- FIM DA CORREÇÃO ---

        // Nome
        if (this.name) {
            this.ctx.fillStyle = "white";
            this.ctx.font = "12px Arial";
            this.ctx.textAlign = "center";
            this.ctx.fillText(this.name, head.x + world.x, head.y + world.y - this.size);
        }

        // Olhos (apenas na nossa cobra)
        if (this.id === game.playerId) {
            const eyeOffset = this.size / 2.5;
            const eyeRadius = this.size / 6;
            const eye1X = head.x + world.x + Math.cos(this.angle - 0.5) * eyeOffset;
            const eye1Y = head.y + world.y + Math.sin(this.angle - 0.5) * eyeOffset;
            const eye2X = head.x + world.x + Math.cos(this.angle + 0.5) * eyeOffset;
            const eye2Y = head.y + world.y + Math.sin(this.angle + 0.5) * eyeOffset;

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