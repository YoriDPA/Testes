class Food {
  constructor(ctx, x, y) {
    this.ctx = ctx;
    this.pos = new Point(x, y);
    this.size = 4;
    this.color = ut.randomColor();
  }

  // O método draw agora recebe a posição do mundo como um parâmetro
  draw(world) {
    this.ctx.beginPath();
    this.ctx.fillStyle = this.color;
    // Usa o 'world' recebido para calcular a posição correta no ecrã
    this.ctx.arc(this.pos.x + world.x, this.pos.y + world.y, this.size, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  die() {
    // A variável global 'game' ainda é usada aqui, o que é aceitável por agora.
    const index = game.foods.indexOf(this);
    if (index > -1) game.foods.splice(index, 1);
  }
}