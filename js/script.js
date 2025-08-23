let mouse = new Point(window.innerWidth / 2, window.innerHeight / 2);
let game;

window.onload = function () {
    const canvasSnake = document.getElementById("canvasSnake");
    const canvasFood = document.getElementById("canvasFood");
    const canvasHex = document.getElementById("canvasHex");

    const ctxSnake = canvasSnake.getContext("2d");
    const ctxFood = canvasFood.getContext("2d");
    const ctxHex = canvasHex.getContext("2d");

    const startScreen = document.getElementById("startScreen");
    const startButton = document.getElementById("startButton");
    const nameInput = document.getElementById("playerNameInput");
    const restartButton = document.getElementById("restartButton");

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

    function startGame() {
        const playerName = nameInput.value || "Player";
        startScreen.style.display = "none";

        handleResize();

        game = new Game(ctxSnake, ctxFood, ctxHex, window.innerWidth, window.innerHeight);
        game.init();
        game.snakes[0].name = playerName;

        animate();
    }

    startButton.addEventListener("click", startGame);
    nameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") startGame();
    });

    restartButton.addEventListener("click", () => {
        if (game) game.init();
    });

    window.addEventListener("mousedown", () => {
        if (game && game.snakes[0]) game.snakes[0].isBoosting = true;
    });

    window.addEventListener("mouseup", () => {
        if (game && game.snakes[0]) game.snakes[0].isBoosting = false;
    });

    window.addEventListener("mousemove", (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });

    function animate() {
        if (game) game.draw();
        requestAnimationFrame(animate);
    }

    window.addEventListener("resize", handleResize);
    handleResize();
};