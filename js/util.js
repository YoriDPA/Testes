class Util {
    constructor() {}

    getMousePos(canvas, evt) {
        const rect = canvas.getBoundingClientRect();
        return new Point(evt.clientX - rect.left, evt.clientY - rect.top);
    }

    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    randomColor() {
        const colors = ["#C0392B", "#E74C3C", "#9B59B6", "#8E44AD", "#2980B9",
            "#3498DB", "#17A589", "#138D75", "#229954", "#28B463", "#D4AC0D",
            "#D68910", "#CA6F1E", "#BA4A00"
        ];
        return colors[this.random(0, colors.length - 1)];
    }

    randomName() {
        const names = ['ram', 'shyam', 'hari', 'geeta', 'joe', 'john', 'harry', 'peter',
            'david', 'abc-123', 'dsf-'
        ];
        return names[this.random(0, names.length - 1)];
    }

    getDistance(p1, p2) {
        return Math.sqrt(Math.pow((p2.x - p1.x), 2) + Math.pow((p2.y - p1.y), 2));
    }

    getAngle(p1, p2) {
        return Math.atan2(p2.y - p1.y, p2.x - p1.x);
    }

    cirCollision(x1, y1, r1, x2, y2, r2) {
        return (this.getDistance(new Point(x1, y1), new Point(x2, y2)) < (r1 + r2));
    }
    
    color(hex, lum) {
        hex = String(hex).replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        lum = lum || 0;
        let rgb = "#", c, i;
        for (i = 0; i < 3; i++) {
            c = parseInt(hex.substr(i * 2, 2), 16);
            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            rgb += ("00" + c).substr(c.length);
        }
        return rgb;
    }
}
const ut = new Util();