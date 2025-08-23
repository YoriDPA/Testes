class Food {
  constructor(ctx, x, y) {
    this.ctx = ctx;
    this.pos = new Point(x, y);
    this.size = 4;
    this.color = ut.randomColor();
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.fillStyle = this.color;
    this.ctx.arc(this.pos.x + game.world.x, this.pos.y + game.world.y, this.size, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  die() {
    const index = game.foods.indexOf(this);
    if (index > -1) game.foods.splice(index, 1);
  }
}