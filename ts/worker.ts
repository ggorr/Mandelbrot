onmessage = (e: MessageEvent) => {
    if (e.data.color == 'rgb') {
        let colorUnit = 0xFFFFFF / e.data.iter;
        let row = new Uint8ClampedArray(4 * e.data.width);
        let u: number[] = Array<number>(e.data.width);
        for (let i = 0; i < e.data.width; i++)
            u[i] = e.data.minX + i / e.data.unit;
        for (let j = 0; j < e.data.height; j++) {
            let v = e.data.maxY - j / e.data.unit;
            let pos = 0;
            for (let i = 0; i < e.data.width; i++) {
                let color = Math.round(mandelbrot(u[i], v, e.data.iter) * colorUnit);
                row[pos++] = color & 0xFF;
                row[pos++] = (color >> 8) & 0xFF;
                row[pos++] = (color >> 16) & 0xFF;
                row[pos++] = 255;
            }
            postMessage(row)
        }
    } else if (e.data.color == 'hsv') {
        let colorUnit = 0xFFFFFF / e.data.iter;
        let row = new Uint8ClampedArray(4 * e.data.width);
        let x: number[] = Array<number>(e.data.width);
        for (let i = 0; i < e.data.width; i++)
            x[i] = e.data.minX + i / e.data.unit;
        for (let j = 0; j < e.data.height; j++) {
            let y = e.data.maxY - j / e.data.unit;
            let pos = 0;
            let h, s, v;
            for (let i = 0; i < e.data.width; i++) {
                let color = Math.round(mandelbrot(x[i], y, e.data.iter) * colorUnit);
                s = color & 0xFF;
                h = (color >> 8) & 0xFF;
                v = (color >> 16) & 0xFF;
                let [r, g, b] = hsv2Rgb((1 - h / 255) ** 2, 1 - (s / 255) ** 2, (1 - v / 255) ** 2);
                row[pos++] = r;
                row[pos++] = g;
                row[pos++] = b;
                row[pos++] = 255;
            }
            postMessage(row)
        }
    } else if (e.data.color == 'hsl') {
        let colorUnit = 0xFFFFFF / e.data.iter;
        let row = new Uint8ClampedArray(4 * e.data.width);
        let x: number[] = Array<number>(e.data.width);
        for (let i = 0; i < e.data.width; i++)
            x[i] = e.data.minX + i / e.data.unit;
        for (let j = 0; j < e.data.height; j++) {
            let y = e.data.maxY - j / e.data.unit;
            let pos = 0;
            let h, s, l;
            for (let i = 0; i < e.data.width; i++) {
                let color = Math.round(mandelbrot(x[i], y, e.data.iter) * colorUnit);
                l = color & 0xFF;
                h = (color >> 8) & 0xFF;
                s = (color >> 16) & 0xFF;
                // let [r, g, b] = hsl2Rgb((1 - h / 255) ** 2, 1 - (s / 255) ** 2, (1 - v / 255) ** 2);
                let [r, g, b] = hsl2Rgb(1-h/255, 1-s/255, 1-l/255);
                row[pos++] = r;
                row[pos++] = g;
                row[pos++] = b;
                row[pos++] = 255;
            }
            postMessage(row)
        }
    }
}

const mandelbrot = (u: number, v: number, iter: number): number => {
    let x = 0;
    let y = 0;
    let x2 = 0;
    let y2 = 0;
    let n = 0;
    while (x2 + y2 <= 4 && n++ < iter) {
        y = 2 * x * y + v;
        x = x2 - y2 + u;
        x2 = x * x;
        y2 = y * y;
    }
    return n;
};

const hsv2Rgb = (h: number, s: number, v: number): number[] => {
    let i = Math.floor(h * 6);
    let f = h * 6 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);
    let r, g, b;
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        // case 5
        default: r = v, g = p, b = q; break;
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};


function hsl2Rgb(h: number, s: number, l: number) {
    let r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        let hue2Rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            else if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2Rgb(p, q, h + 1 / 3);
        g = hue2Rgb(p, q, h);
        b = hue2Rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}