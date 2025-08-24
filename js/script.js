// --- Variáveis Globais ---
let mouse = new Point(window.innerWidth / 2, window.innerHeight / 2);
let game;

// --- Variáveis do Firebase ---
let playerId = null; // ID único do nosso jogador no banco de dados
let playerRef = null; // A referência direta para o documento do nosso jogador
const playersRef = db.collection('players'); // A "pasta" onde todos os jogadores estão guardados
let unsubscribe; // Função para parar de ouvir as atualizações do banco de dados

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

    // Função para ajustar o tamanho do canvas
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

    // --- Função Principal para Iniciar o Jogo (Modificada para Multiplayer) ---
    async function startGame() {
        const playerName = nameInput.value.trim() || "Anônimo";
        startScreen.style.display = "none";

        handleResize();

        try {
            // 1. Cria um novo jogador no banco de dados do Firebase
            const newPlayerRef = await playersRef.add({
                name: playerName,
                color: getRandomColor(),
                score: 0,
                // Posição inicial da cobra (cabeça e corpo)
                parts: [{ x: Math.random() * 1000, y: Math.random() * 1000 }],
                isBoosting: false,
                // Guarda a data que o jogador foi criado
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // 2. Guarda o ID e a referência do nosso jogador
            playerId = newPlayerRef.id;
            playerRef = playersRef.doc(playerId);

            // 3. Inicializa o motor do jogo localmente
            game = new Game(ctxSnake, ctxFood, ctxHex, window.innerWidth, window.innerHeight);
            // Passamos o ID do nosso jogador para o jogo saber quem somos nós
            game.init(playerId, playerName);

            // 4. Começa a ouvir por atualizações de todos os jogadores
            listenForPlayers();

            // 5. Inicia o loop de animação
            animate();

        } catch (error) {
            console.error("Erro ao iniciar o jogo:", error);
            // Caso dê erro, mostra a tela inicial novamente
            startScreen.style.display = "block";
            alert("Não foi possível conectar ao servidor. Tente novamente.");
        }
    }

    // --- Ouvintes de Eventos (Listeners) ---
    startButton.addEventListener("click", startGame);
    nameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") startGame();
    });

    restartButton.addEventListener("click", () => {
        // A lógica de restart precisará ser repensada para o multiplayer
        window.location.reload();
    });

    // Ao clicar o mouse, ativa o boost e avisa o Firebase
    window.addEventListener("mousedown", () => {
        if (game && game.playerSnake) {
            game.playerSnake.isBoosting = true;
            playerRef.update({ isBoosting: true });
        }
    });

    // Ao soltar o mouse, desativa o boost e avisa o Firebase
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

    // --- Funções do Firebase ---

    // Ouve em tempo real todas as mudanças na coleção de jogadores
    function listenForPlayers() {
        unsubscribe = playersRef.onSnapshot(snapshot => {
            const allPlayersData = {};
            snapshot.forEach(doc => {
                // Guarda os dados de cada jogador usando o ID como chave
                allPlayersData[doc.id] = doc.data();
            });

            // Envia os dados de todos os jogadores para o nosso motor de jogo atualizar a tela
            if (game) {
                game.updateAllSnakes(allPlayersData);
            }
        });
    }

    // Função para enviar nossas atualizações para o Firebase
    // Usamos um "throttle" para não sobrecarregar o banco de dados,
    // enviando atualizações no máximo a cada 50ms (20x por segundo)
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
            game.draw(mouse); // Atualiza e desenha o jogo
            updateFirebase(); // Envia nossa posição para o Firebase
        }
        requestAnimationFrame(animate);
    }

    // --- Lógica de Desconexão ---
    // Quando o jogador fecha a aba, removemos ele do banco de dados
    window.addEventListener('beforeunload', () => {
        if (unsubscribe) unsubscribe(); // Para de ouvir
        if (playerId) {
            // Isso nem sempre funciona, mas é uma boa prática tentar
            playerRef.delete();
        }
    });

    window.addEventListener("resize", handleResize);
    handleResize();
};


// --- Funções Utilitárias ---
// (Idealmente, estas funções deveriam ir para o arquivo util.js)

// Limita a frequência que uma função pode ser chamada
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

// Gera uma cor aleatória em formato hexadecimal
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}