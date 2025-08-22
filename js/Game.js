class Game {
    constructor(ctxSnake, ctxFood, ctxHex, width, height) {
        this.ctxSnake = ctxSnake;
        this.ctxFood = ctxFood;
        this.ctxHex = ctxHex;
        this.WORLD_SIZE = new Point(4000, 2000);
        this.SCREEN_SIZE = new Point(width, height);
        this.world = new Point(0, 0); 
        this.snakes = [];
        this.foods = [];
        this.stars = []; 
        this.isGameOver = false;
    }

    init() {
        this.isGameOver = false;
        document.getElementById('gameOverScreen').classList.add('hidden');
        this.snakes = [];
        this.foods = [];
        
        if (this.stars.length === 0) {
            this.generateStars(500); 
        }

        this.snakes[0] = new Snake(this.ctxSnake, "Player 1", 0);
        this.snakes[0].pos = new Point(this.WORLD_SIZE.x / 2, this.WORLD_SIZE.y / 2);

        for (var i = 0; i < 15; i++) this.addSnake(ut.randomName(), i + 1);
        this.generateFoods(1000);
    }

    generateStars(count) {
        for (let i = 0; i < count; i++) {
            this.stars.push({
                pos: new Point(ut.random(0, this.WORLD_SIZE.x), ut.random(0, this.WORLD_SIZE.y)),
                size: ut.random(1, 3)
            });
        }
    }

    resize(width, height) {
        this.SCREEN_SIZE.x = width;
        this.SCREEN_SIZE.y = height;
    }

    draw() {
        if (this.isGameOver) {
            return;
        }

        const player = this.snakes[0];
        
        for (let i = 0; i < this.snakes.length; i++) {
            if (this.snakes[i].state === 0) {
                this.snakes[i].move();
            }
        }

        for (let i = 0; i < this.snakes.length; i++) {
            if (this.snakes[i].state === 0) {
                for (let j = 0; j < this.snakes.length; j++) {
                    this.snakes[i].checkSnakeCollision(this.snakes[j]);
                }
            }
        }

        if (player.state === 1) {
            this.gameOver();
            return;
        }

        for (let i = this.snakes.length - 1; i >= 1; i--) {
            if (this.snakes[i].state === 1) {
                this.snakes.splice(i, 1);
            }
        }
        
        this.world.x = -player.pos.x + this.SCREEN_SIZE.x / 2;
        this.world.y = -player.pos.y + this.SCREEN_SIZE.y / 2;

        this.drawWorld();

        for (let i = 0; i < this.snakes.length; i++) {
            if (this.snakes[i].state === 0) {
                this.snakes[i].draw();
            }
        }
        for (let i = 0; i < this.foods.length; i++) {
            this.foods[i].draw();
        }

        this.drawScore();
        this.drawMap();
    }

    gameOver() {
        this.isGameOver = true;
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }

    drawWorld() {
        this.ctxHex.save();
        this.ctxHex.fillStyle = "#0D1117"; 
        this.ctxHex.fillRect(0, 0, this.SCREEN_SIZE.x, this.SCREEN_SIZE.y);
        
        this.ctxHex.fillStyle = "white";
        for (const star of this.stars) {
            const drawX = star.pos.x + this.world.x;
            const drawY = star.pos.y + this.world.y;
            if (drawX > 0 && drawX < this.SCREEN_SIZE.x && drawY > 0 && drawY < this.SCREEN_SIZE.y) {
                 this.ctxHex.beginPath();
                 this.ctxHex.arc(drawX, drawY, star.size / 2, 0, 2 * Math.PI);
                 this.ctxHex.fill();
            }
        }

        this.ctxHex.strokeStyle = "#21262D"; 
        this.ctxHex.lineWidth = 1;
        const gridSize = 50;
        
        const startX = this.world.x % gridSize;
        const startY = this.world.y % gridSize;

        for(let x = startX; x < this.SCREEN_SIZE.x; x += gridSize) {
            this.ctxHex.beginPath();
            this.ctxHex.moveTo(x, 0);
            this.ctxHex.lineTo(x, this.SCREEN_SIZE.y);
            this.ctxHex.stroke();
        }

        for(let y = startY; y < this.SCREEN_SIZE.y; y += gridSize) {
            this.ctxHex.beginPath();
            this.ctxHex.moveTo(0, y);
            this.ctxHex.lineTo(this.SCREEN_SIZE.x, y);
            this.ctxHex.stroke();
        }

        this.ctxHex.strokeStyle = "#E74C3C";
        this.ctxHex.lineWidth = 10;
        this.ctxHex.strokeRect(this.world.x, this.world.y, this.WORLD_SIZE.x, this.WORLD_SIZE.y);

        this.ctxHex.restore();
    }

    drawScore() {
        const start = new Point(20, 30);
        const sortedSnakes = [...this.snakes].sort((a, b) => b.score - a.score).slice(0, 10);

        this.ctxSnake.fillStyle = "white";
        this.ctxSnake.font = "bold 16px Arial";
        this.ctxSnake.fillText("Leaderboard", start.x, start.y - 10);

        for (let i = 0; i < sortedSnakes.length; i++) {
            const snake = sortedSnakes[i];
            this.ctxSnake.fillStyle = snake.mainColor;
            this.ctxSnake.font = "bold 14px Arial";
            this.ctxSnake.fillText(`${i+1}. ${snake.name}: ${snake.score}`, start.x, start.y + i * 20);
        }
    }

    drawMap() {
        this.ctxSnake.globalAlpha = 0.7;
        const mapSize = new Point(150, 75);
        const start = new Point(this.SCREEN_SIZE.x - mapSize.x - 20, this.SCREEN_SIZE.y - mapSize.y - 20);
        
        this.ctxSnake.fillStyle = "rgba(255, 255, 255, 0.2)";
        this.ctxSnake.strokeStyle = "white";
        this.ctxSnake.lineWidth = 2;
        this.ctxSnake.fillRect(start.x, start.y, mapSize.x, mapSize.y);
        this.ctxSnake.strokeRect(start.x, start.y, mapSize.x, mapSize.y);
        
        this.ctxSnake.globalAlpha = 1;
        for (let i = 0; i < this.snakes.length; i++) {
            const snake = this.snakes[i];
            const playerInMap = new Point(
                start.x + (mapSize.x / this.WORLD_SIZE.x) * snake.pos.x,
                start.y + (mapSize.y / this.WORLD_SIZE.y) * snake.pos.y
            );
            this.ctxSnake.fillStyle = snake.id === 0 ? "white" : snake.mainColor;
            this.ctxSnake.beginPath();
            this.ctxSnake.arc(playerInMap.x, playerInMap.y, 3, 0, 2 * Math.PI);
            this.ctxSnake.fill();
        }
    }

    addSnake(name, id) {
        this.snakes.push(new SnakeAi(this.ctxSnake, name, id));
    }

    generateFoods(n) {
        for (var i = 0; i < n; i++) {
            this.foods.push(new Food(this.ctxFood, 
                ut.random(0, this.WORLD_SIZE.x),
                ut.random(0, this.WORLD_SIZE.y)
            ));
        }
    }
}