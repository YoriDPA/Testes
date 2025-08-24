// --- Variáveis Globais ---
let mouse = new Point(window.innerWidth / 2, window.innerHeight / 2);
let game;

// --- Variáveis do Firebase ---
let playerId = null;
let playerRef = null;
const playersRef = db.collection('players');
let unsubscribe;

// --- Início do Jogo ---
window.onload = function () {
    // Referências aos elementos da página
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

    async function startGame() {
        const playerName = nameInput.value.trim();
        if (!playerName) {
            alert("Por favor, introduza um nome.");
            return;
        }

        // Desativa o botão para evitar cliques duplos e dar feedback ao utilizador
        startButton.disabled = true;
        startButton.textContent = "A verificar...";

        try {
            // 1. Verifica se o nome já está em uso no Firebase
            const querySnapshot = await playersRef.where("name", "==", playerName).get();

            if (!querySnapshot.empty) {
                // Se a query não for vazia, o nome já existe
                alert("Este nome já está em uso. Por favor, escolha outro.");
                startScreen.style.display = "block"; // Mostra a tela inicial novamente
                return; // Para a execução da função
            }

            // 2. Se o nome estiver livre, continua o processo normal
            startScreen.style.display = "none";
            handleResize();

            const newPlayerRef = await playersRef.add({
                name: playerName,
                color: ut.randomColor(),
                score: 0,
                parts: [{ x: Math.random() * 1000, y: Math.random() * 1000 }],
                isBoosting: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            playerId = newPlayerRef.id;
            playerRef = playersRef.doc(playerId);

            game = new Game(ctxSnake, ctxFood, ctxHex, window.innerWidth, window.innerHeight);
            game.init(playerId, playerName);

            listenForPlayers();
            animate();

        } catch (error) {
            console.error("Erro ao iniciar o jogo:", error);
            startScreen.style.display = "block";
            alert("Não foi possível conectar ao servidor. Tente novamente.");
        } finally {
            // Garante que o botão é reativado mesmo que ocorra um erro
            startButton.disabled = false;
            startButton.textContent = "Iniciar Jogo";
        }
    }

    // --- OUVINTES DE EVENTOS (COM SUPORTE MÓVEL) ---
    startButton.addEventListener("click", startGame);
    nameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") startGame();
    });

    restartButton.addEventListener("click", () => {
        window.location.reload();
    });

    // --- Eventos do Rato (Desktop) ---
    window.addEventListener("mousedown", () => {
        if (game && game.playerSnake) {
            game.playerSnake.isBoosting = true;
            playerRef.update({ isBoosting: true });
        }
    });
    window.addEventListener("mouseup", () => {
        if (game && game.playerSnake) {
            game.playerSnake.isBoosting = false;
            playerRef.update({ isBoosting: false });
        }
    });
    window.addEventListener("mousemove", (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });

    // --- Eventos de Toque (Móvel) ---
    window.addEventListener("touchstart", (event) => {
        event.preventDefault();
        if (game && game.playerSnake) {
            game.playerSnake.isBoosting = true;
            playerRef.update({ isBoosting: true });
        }
        if (event.touches.length > 0) {
            mouse.x = event.touches[0].clientX;
            mouse.y = event.touches[0].clientY;
        }
    }, { passive: false });

    window.addEventListener("touchend", () => {
        if (game && game.playerSnake) {
            game.playerSnake.isBoosting = false;
            playerRef.update({ isBoosting: false });
        }
    });

    window.addEventListener("touchmove", (event) => {
        event.preventDefault();
        if (event.touches.length > 0) {
            mouse.x = event.touches[0].clientX;
            mouse.y = event.touches[0].clientY;
        }
    }, { passive: false });


    // --- Funções do Firebase ---
    function listenForPlayers() {
        unsubscribe = playersRef.onSnapshot(snapshot => {
            const allPlayersData = {};
            snapshot.forEach(doc => {
                allPlayersData[doc.id] = doc.data();
            });
            if (game) {
                game.updateAllSnakes(allPlayersData);
            }
        });
    }

    const updateFirebase = throttle(() => {
        if (game && playerRef && game.playerSnake) {
            playerRef.update({
                parts: game.playerSnake.parts.map(p => ({ x: p.x, y: p.y })),
                score: game.playerSnake.score
            });
        }
    }, 50);

    // --- Loop de Animação ---
    function animate() {
        if (game) {
            game.draw(mouse);
            updateFirebase();
        }
        requestAnimationFrame(animate);
    }

    // --- Lógica de Desconexão ---
    window.addEventListener('beforeunload', () => {
        if (unsubscribe) unsubscribe();
        if (playerId) {
            playerRef.delete();
        }
    });

    window.addEventListener("resize", handleResize);
    handleResize();
};

// --- Funções Utilitárias ---
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}