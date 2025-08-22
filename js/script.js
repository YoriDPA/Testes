let mouse = new Point(window.innerWidth / 2, window.innerHeight / 2);
let game;

window.onload = function() {
    const canvasSnake = document.getElementById('canvasSnake');
    const canvasFood = document.getElementById('canvasFood');
    const canvasHex = document.getElementById('canvasHex');
    if (!canvasSnake || !canvasFood || !canvasHex) {
        console.error("Canvas elements not found");
        return;
    }
    const ctxSnake = canvasSnake.getContext('2d');
    const ctxFood = canvasFood.getContext('2d');
    const ctxHex = canvasHex.getContext('2d');

    const restartButton = document.getElementById('restartButton');
    restartButton.addEventListener('click', function() {
        if (game) {
            game.init();
        }
    });

    window.addEventListener('mousedown', function() {
        if (game && game.snakes[0]) {
            game.snakes[0].isBoosting = true;
        }
    });

    window.addEventListener('mouseup', function() {
        if (game && game.snakes[0]) {
            game.snakes[0].isBoosting = false;
        }
    });

    window.addEventListener('mousemove', function(event) {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });

    function handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        canvasSnake.width = width;
        canvasSnake.height = height;
        canvasFood.width = width;
        canvasFood.height = height;
        canvasHex.width = width;
        canvasHex.height = height;
        if (game) game.resize(width, height);
    }

    function init() {
        handleResize();
        game = new Game(ctxSnake, ctxFood, ctxHex, window.innerWidth, window.innerHeight);
        game.init();
        animate();
    }

    function animate() {
        ctxSnake.clearRect(0, 0, canvasSnake.width, canvasSnake.height);
        ctxFood.clearRect(0, 0, canvasFood.width, canvasFood.height);
        
        if (game) {
            game.draw();
        }
        
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', handleResize);
    init();
}