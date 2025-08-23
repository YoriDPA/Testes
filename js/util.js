const ut = {
  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  randomColor() {
    const colors = ["#FF5733", "#33FF57", "#3357FF", "#F3FF33", "#FF33F6"];
    return colors[Math.floor(Math.random() * colors.length)];
  },
  color(hex, lum) {
    hex = String(hex).replace(/[^0-9a-f]/gi, "");
    if (hex.length < 6) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    lum = lum || 0;
    let rgb = "#", c, i;
    for (i = 0; i < 3; i++) {
      c = parseInt(hex.substr(i*2,2), 16);
      c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
      rgb += ("00"+c).substr(c.length);
    }
    return rgb;
  },
  getAngle(p1, p2) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  },
  cirCollision(x1,y1,r1,x2,y2,r2) {
    const dx = x1 - x2, dy = y1 - y2;
    const distance = Math.sqrt(dx*dx + dy*dy);
    return distance < r1 + r2;
  },
  randomName() {
    const names = ["john","david","geeta","ram","hari","peter","abc-123","shyam"];
    return names[Math.floor(Math.random() * names.length)];
  }
};