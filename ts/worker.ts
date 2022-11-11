onmessage = (e: MessageEvent) => {
    let func = [rgb0, rgb1, rgb2, hsv0, hsv1, hsv2, hsl0, hsl1, hsl2].find(v => v.name == e.data.color);
    if (func == undefined) return;

    let colorUnit = 0xFFFFFF / e.data.iter;
    let row = new Uint8Array(4 * e.data.width);
    let u: number[] = Array<number>(e.data.width);
    for (let i = 0; i < e.data.width; i++)
        u[i] = e.data.minX + i / e.data.unit;
    for (let j = 0; j < e.data.height; j++) {
        let v = e.data.maxY - j / e.data.unit;
        let pos = 0;
        for (let i = 0; i < e.data.width; i++) {
            let depth = Math.round(mandelbrot(u[i], v, e.data.iter) * colorUnit);
            func(depth, row, pos);
            pos += 4;
        }
        postMessage(row)
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

const rgb0 = (depth: number, row: Uint8Array, pos: number): void => {
    row[pos++] = depth & 0xFF;
    row[pos++] = (depth >> 8) & 0xFF;
    row[pos++] = (depth >> 16) & 0xFF;
    row[pos] = 255;
}

const rgb1 = (depth: number, row: Uint8Array, pos: number): void => {
    row[pos++] = ((depth >> 4) & 0xF) | ((depth << 4) & 0xF0);
    row[pos++] = ((depth >> 12) & 0xF) | ((depth >> 4) & 0xF0);
    row[pos++] = ((depth >> 20) & 0xF) | ((depth >> 12) & 0xF0);
    row[pos] = 255;
}

const rgb2 = (depth: number, row: Uint8Array, pos: number): void => {
    row[pos++] = rev8bit(depth & 0xFF);
    row[pos++] = rev8bit((depth >> 8) & 0xFF);
    row[pos++] = rev8bit((depth >> 16) & 0xFF);
    row[pos] = 255;
}

const rev8bit = (x: number): number => {           // 0123 4567
    x = ((x >> 4) & 0xF) | ((x & 0xF) << 4);       // 4567 0123
    x = ((x >> 2) & 0x33) | ((x & 0x33) << 2);     // 6745 2301
    return ((x >> 1) & 0x55) | ((x & 0x55) << 1);  // 7654 3210
}

const hsv0 = (depth: number, row: Uint8Array, pos: number): void => {
    let s = depth & 0xFF;
    let h = (depth >> 8) & 0xFF;
    let v = (depth >> 16) & 0xFF;
    [row[pos++], row[pos++], row[pos++]] = hsv2Rgb((1 - h / 255) ** 2, 1 - (s / 255) ** 2, (1 - v / 255) ** 2);
    row[pos] = 255;
}

const hsv1 = (depth: number, row: Uint8Array, pos: number): void => {
    let s = ((depth >> 4) & 0xF) | ((depth << 4) & 0xF0);
    let h = ((depth >> 12) & 0xF) | ((depth >> 4) & 0xF0);
    let v = ((depth >> 20) & 0xF) | ((depth >> 12) & 0xF0);
    [row[pos++], row[pos++], row[pos++]] = hsv2Rgb((1 - h / 255) ** 2, 1 - (s / 255) ** 2, (1 - v / 255) ** 2);
    row[pos] = 255;
}

const hsv2 = (depth: number, row: Uint8Array, pos: number): void => {
    let s = rev8bit(depth & 0xFF);
    let h = rev8bit((depth >> 8) & 0xFF);
    let v = rev8bit((depth >> 16) & 0xFF);
    [row[pos++], row[pos++], row[pos++]] = hsv2Rgb((1 - h / 255) ** 2, 1 - (s / 255) ** 2, (1 - v / 255) ** 2);
    row[pos] = 255;
}

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

const hsl0 = (depth: number, row: Uint8Array, pos: number): void => {
    let l = depth & 0xFF;
    let h = (depth >> 8) & 0xFF;
    let s = (depth >> 16) & 0xFF;
    [row[pos++], row[pos++], row[pos++]] = hsl2Rgb(1 - h / 255, 1 - s / 255, 1 - l / 255);
    row[pos] = 255;
}

const hsl1 = (depth: number, row: Uint8Array, pos: number): void => {
    let l = ((depth >> 4) & 0xF) | ((depth << 4) & 0xF0);
    let h = ((depth >> 12) & 0xF) | ((depth >> 4) & 0xF0);
    let s = ((depth >> 20) & 0xF) | ((depth >> 12) & 0xF0);
    [row[pos++], row[pos++], row[pos++]] = hsl2Rgb(1 - h / 255, 1 - s / 255, 1 - l / 255);
    row[pos] = 255;
}

const hsl2 = (depth: number, row: Uint8Array, pos: number): void => {
    let l = rev8bit(depth & 0xFF);
    let h = rev8bit((depth >> 8) & 0xFF);
    let s = rev8bit((depth >> 16) & 0xFF);
    [row[pos++], row[pos++], row[pos++]] = hsl2Rgb(1 - h / 255, 1 - s / 255, 1 - l / 255);
    row[pos] = 255;
}

const hsl2Rgb = (h: number, s: number, l: number): number[] => {
    let r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2Rgb(p, q, h + 1 / 3);
        g = hue2Rgb(p, q, h);
        b = hue2Rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}


const hue2Rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    else if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
}
