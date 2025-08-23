class Game {
    constructor(ctxSnake, ctxFood, ctxHex, width, height) {
        this.ctxSnake = ctxSnake;
        this.ctxFood = ctxFood;
        this.ctxHex = ctxHex;

        this.WORLD_SIZE = new Point(4000, 2000);   // tamanho do mundo
        this.SCREEN_SIZE = new Point(width, height);
        this.world = new Point(0, 0); 

        this.snakes = [];
        this.foods = [];
        this.isGameOver = false;

        this.lastFrameTime = performance.now();
        this.fps = 0;
    }

    init() {
        this.isGameOver = false;
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('finalScore').innerText = "Score: 0";

        this.snakes = [];
        this.foods = [];

        // cria o jogador
        this.snakes[0] = new SnakePlayer(this.ctxSnake, "Player 1", 0);
        this.snakes[0].pos = new Point(this.WORLD_SIZE.x / 2, this.WORLD_SIZE.y / 2);
        this.snakes[0].parts = [new Point(this.snakes[0].pos.x, this.snakes[0].pos.y)];
        this.snakes[0].state = 0;   // ✅ jogador começa vivo

        // adiciona IAs
        for (let i = 0; i < 10; i++) {
            this.addSnake(ut.randomName(), i + 1);
        }

        // adiciona comidas
        this.generateFoods(300);
    }

    resize(width, height) {
        this.SCREEN_SIZE.x = width;
        this.SCREEN_SIZE.y = height;
    }

    draw() {
        const player = this.snakes[0];

        // FPS
        const now = performance.now();
        const delta = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;
        this.fps = Math.round(1 / delta);

        // limpa canvases
        this.ctxSnake.clearRect(0, 0, this.SCREEN_SIZE.x, this.SCREEN_SIZE.y);
        this.ctxFood.clearRect(0, 0, this.SCREEN_SIZE.x, this.SCREEN_SIZE.y);
        this.ctxHex.clearRect(0, 0, this.SCREEN_SIZE.x, this.SCREEN_SIZE.y);

        if (this.isGameOver) {
            this.drawWorld();
            for (let snake of this.snakes) if (snake.state === 0) snake.draw();
            for (let food of this.foods) food.draw();
            this.drawScore();
            return;
        }

        // movimento de todas as cobras
        for (let snake of this.snakes) {
            if (snake.state === 0) snake.move();
        }

        // checagem de colisões entre cobras
        for (let i = 0; i < this.snakes.length; i++) {
            if (this.snakes[i].state === 0) {
                for (let j = 0; j < this.snakes.length; j++) {
                    this.snakes[i].checkSnakeCollision(this.snakes[j]);
                }
            }
        }

        // se o player morreu → game over
        if (player.state === 1) {
            this.gameOver();
        }

        // movimenta o mundo em relação ao jogador
        this.world.x = -player.pos.x + this.SCREEN_SIZE.x / 2;
        this.world.y = -player.pos.y + this.SCREEN_SIZE.y / 2;

        // desenha tudo
        this.drawWorld();
        for (let snake of this.snakes) if (snake.state === 0) snake.draw();
        for (let food of this.foods) food.draw();
        this.drawScore();
    }

    gameOver() {
        if (!this.isGameOver) {
            this.isGameOver = true;
            const playerScore = this.snakes[0].score;
            const screen = document.getElementById('gameOverScreen');
            screen.classList.remove('hidden');
            document.getElementById('finalScore').innerText = `Score: ${playerScore}`;
        }
    }

    drawWorld() {
        this.ctxHex.save();
        this.ctxHex.fillStyle = "#0D1117";
        this.ctxHex.fillRect(0, 0, this.SCREEN_SIZE.x, this.SCREEN_SIZE.y);

        // borda do mundo
        this.ctxHex.strokeStyle = "#E74C3C";
        this.ctxHex.lineWidth = 10;
        this.ctxHex.strokeRect(this.world.x, this.world.y, this.WORLD_SIZE.x, this.WORLD_SIZE.y);

        this.ctxHex.restore();
    }

    drawScore() {
        const player = this.snakes[0];
        this.ctxSnake.fillStyle = "white";
        this.ctxSnake.font = "14px Arial";
        this.ctxSnake.fillText(`Score: ${player.score}`, 20, 20);
        this.ctxSnake.fillText(`FPS: ${this.fps}`, 20, 40);
    }

    addSnake(name, id) {
        this.snakes.push(new SnakeAi(this.ctxSnake, name, id));
    }

    generateFoods(n) {
        for (let i = 0; i < n; i++) {
            this.foods.push(new Food(
                this.ctxFood,
                ut.random(0, this.WORLD_SIZE.x),
                ut.random(0, this.WORLD_SIZE.y)
            ));
        }
    }
}