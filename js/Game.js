class Game {
    constructor(ctxSnake, ctxFood, ctxHex, width, height) {
        this.ctxSnake = ctxSnake;
        this.ctxFood = ctxFood;
        this.ctxHex = ctxHex;

        this.WORLD_SIZE = new Point(4000, 2000);
        this.SCREEN_SIZE = new Point(width, height);
        this.world = new Point(0, 0);

        this.snakes = {};
        this.foods = [];
        this.isGameOver = false;

        this.playerId = null;
        this.playerSnake = null;

        this.lastFrameTime = performance.now();
        this.fps = 0;

        this.backgroundColor = '#222222';
        this.gridSize = 40;
        this.gridColor = '#333333';
    }

    init(playerId, playerName) {
        this.isGameOver = false;
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('finalScore').innerText = "Score: 0";

        this.playerId = playerId;
        this.snakes = {};

        this.generateFoods(300);
    }

    updateAllSnakes(playersData) {
        for (const id in playersData) {
            const data = playersData[id];
            if (!this.snakes[id]) {
                this.snakes[id] = new SnakePlayer(this.ctxSnake, data.name, id);
            }
            const snake = this.snakes[id];
            snake.parts = data.parts.map(p => new Point(p.x, p.y));
            snake.pos = new Point(snake.parts[0].x, snake.parts[0].y);
            snake.score = data.score;
            snake.color = data.color;
            snake.isBoosting = data.isBoosting;
        }
        for (const id in this.snakes) {
            if (!playersData[id]) {
                delete this.snakes[id];
            }
        }
        this.playerSnake = this.snakes[this.playerId];
    }

    resize(width, height) {
        this.SCREEN_SIZE.x = width;
        this.SCREEN_SIZE.y = height;
    }

    draw(mouse) {
        if (!this.playerSnake) return;

        const now = performance.now();
        const delta = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;
        this.fps = Math.round(1 / delta);

        this.ctxSnake.clearRect(0, 0, this.SCREEN_SIZE.x, this.SCREEN_SIZE.y);
        this.ctxFood.clearRect(0, 0, this.SCREEN_SIZE.x, this.SCREEN_SIZE.y);

        this.playerSnake.move(mouse);

        // --- CORREÇÃO DA COLISÃO ---
        // Verifica as colisões do nosso jogador
        this.checkPlayerCollisions();

        if (this.playerSnake.state === 1) {
            this.gameOver();
        }

        this.world.x = -this.playerSnake.pos.x + this.SCREEN_SIZE.x / 2;
        this.world.y = -this.playerSnake.pos.y + this.SCREEN_SIZE.y / 2;

        this.drawBackgroundAndGrid();
        this.drawWorldBorder();

        for (const id in this.snakes) {
            this.snakes[id].draw(this.world);
        }
        for (let food of this.foods) {
            food.draw(this.world);
        }
        this.drawScore();
    }

    // --- NOVA FUNÇÃO DE COLISÃO ---
    checkPlayerCollisions() {
        if (!this.playerSnake || this.playerSnake.state === 1) return;

        // Percorre todas as cobras no jogo
        for (const id in this.snakes) {
            const otherSnake = this.snakes[id];

            // Ignora a verificação contra si mesmo
            if (id === this.playerId) continue;

            // Verifica se a cabeça do nosso jogador colide com o corpo de outra cobra
            for (let i = 0; i < otherSnake.parts.length; i++) {
                const part = otherSnake.parts[i];
                if (ut.cirCollision(
                    this.playerSnake.pos.x, this.playerSnake.pos.y, this.playerSnake.size / 2,
                    part.x, part.y, otherSnake.size / 2
                )) {
                    this.playerSnake.die();
                    return; // Sai da função assim que uma colisão é detetada
                }
            }
        }
    }

    drawBackgroundAndGrid() {
        const worldOffset = this.world;
        const startX = worldOffset.x % this.gridSize;
        const startY = worldOffset.y % this.gridSize;

        this.ctxHex.fillStyle = this.backgroundColor;
        this.ctxHex.fillRect(0, 0, this.SCREEN_SIZE.x, this.SCREEN_SIZE.y);

        this.ctxHex.strokeStyle = this.gridColor;
        this.ctxHex.lineWidth = 1;
        this.ctxHex.beginPath();

        for (let x = startX; x <= this.SCREEN_SIZE.x; x += this.gridSize) {
            this.ctxHex.moveTo(x, 0);
            this.ctxHex.lineTo(x, this.SCREEN_SIZE.y);
        }
        for (let y = startY; y <= this.SCREEN_SIZE.y; y += this.gridSize) {
            this.ctxHex.moveTo(0, y);
            this.ctxHex.lineTo(this.SCREEN_SIZE.x, y);
        }
        this.ctxHex.stroke();
    }

    drawWorldBorder() {
        this.ctxHex.save();
        this.ctxHex.strokeStyle = "#E74C3C";
        this.ctxHex.lineWidth = 10;
        this.ctxHex.strokeRect(this.world.x, this.world.y, this.WORLD_SIZE.x, this.WORLD_SIZE.y);
        this.ctxHex.restore();
    }

    gameOver() {
        if (!this.isGameOver) {
            this.isGameOver = true;
            const playerScore = this.playerSnake.score;
            const screen = document.getElementById('gameOverScreen');
            screen.classList.remove('hidden');
            document.getElementById('finalScore').innerText = `Score: ${playerScore}`;
            if (playerRef) {
                playerRef.delete();
            }
        }
    }

    drawScore() {
        if (!this.playerSnake) return;
        this.ctxSnake.fillStyle = "white";
        this.ctxSnake.font = "14px Arial";
        this.ctxSnake.fillText(`Score: ${this.playerSnake.score}`, 20, 20);
        this.ctxSnake.fillText(`FPS: ${this.fps}`, 20, 40);
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