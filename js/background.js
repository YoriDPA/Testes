// Obtém o canvas e o contexto para o fundo
const canvasHex = document.getElementById('canvasHex');
const ctxHex = canvasHex.getContext('2d');

// Define as dimensões do canvas para preencher a janela
canvasHex.width = window.innerWidth;
canvasHex.height = window.innerHeight;

// Configurações da grade e do fundo
const backgroundColor = '#222222'; // Um cinza bem escuro para o fundo
const gridSize = 40; // Espaçamento entre as linhas da grade
const gridColor = '#333333'; // Cor das linhas da grade (um pouco mais clara que o fundo)
const lineWidth = 1; // Largura das linhas

/**
 * Desenha o fundo e a grade no canvas.
 */
function drawBackground() {
  // Define a cor de fundo e preenche o canvas inteiro
  ctxHex.fillStyle = backgroundColor;
  ctxHex.fillRect(0, 0, canvasHex.width, canvasHex.height);

  // Define a cor e a largura da linha para a grade
  ctxHex.strokeStyle = gridColor;
  ctxHex.lineWidth = lineWidth;

  // Começa a desenhar as linhas da grade
  ctxHex.beginPath();

  // Desenha as linhas verticais
  for (let x = 0; x <= canvasHex.width; x += gridSize) {
    ctxHex.moveTo(x, 0);
    ctxHex.lineTo(x, canvasHex.height);
  }

  // Desenha as linhas horizontais
  for (let y = 0; y <= canvasHex.height; y += gridSize) {
    ctxHex.moveTo(0, y);
    ctxHex.lineTo(canvasHex.width, y);
  }

  // Finaliza o desenho das linhas
  ctxHex.stroke();
}

// Redesenha o fundo quando a janela é redimensionada
window.addEventListener('resize', () => {
  canvasHex.width = window.innerWidth;
  canvasHex.height = window.innerHeight;
  drawBackground();
});

// Desenha o fundo inicial
drawBackground();