"use strict";
onmessage = (e) => {
    let func = [rgb0, rgb1, rgb2, hsv0, hsv1, hsv2, hsl0, hsl1, hsl2, rgb3, hsv3, hsl3].find(v => v.name == e.data.coloring);
    if (func == undefined)
        return;
    let colorUnit = 0xFFFFFF / e.data.iter;
    let row = new Uint8Array(4 * e.data.width);
    let u = Array(e.data.width);
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
        postMessage(row);
    }
};
const mandelbrot = (u, v, iter) => {
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
const rgb0 = (depth, row, pos) => {
    [row[pos++], row[pos++], row[pos++]] = split(depth);
    row[pos] = 255;
};
const rgb1 = (depth, row, pos) => {
    [row[pos++], row[pos++], row[pos++]] = shuffle(depth);
    row[pos] = 255;
};
const rgb2 = (depth, row, pos) => {
    [row[pos++], row[pos++], row[pos++]] = revSplit(depth);
    row[pos] = 255;
};
const rgb3 = (depth, row, pos) => {
    [row[pos++], row[pos++], row[pos++]] = revShuffle(depth).map(v => 255 - Math.sqrt(v / 255) * 255);
    row[pos] = 255;
};
const hsv0 = (depth, row, pos) => {
    let [s, h, v] = split(depth);
    [row[pos++], row[pos++], row[pos++]] = hsv2Rgb(pol2(h), pol2(s), pol2(v));
    row[pos] = 255;
};
const hsv1 = (depth, row, pos) => {
    let [s, h, v] = shuffle(depth);
    [row[pos++], row[pos++], row[pos++]] = hsv2Rgb(pol2(h), pol2(s), pol2(v));
    row[pos] = 255;
};
const hsv2 = (depth, row, pos) => {
    let [s, h, v] = revSplit(depth);
    [row[pos++], row[pos++], row[pos++]] = hsv2Rgb(pol2(h), pol2(s), pol2(v));
    row[pos] = 255;
};
const hsv3 = (depth, row, pos) => {
    let [s, h, v] = revShuffle(depth);
    [row[pos++], row[pos++], row[pos++]] = hsv2Rgb(pol2(h), pol2(s), pol2(v));
    row[pos] = 255;
};
const hsl0 = (depth, row, pos) => {
    let [l, h, s] = split(depth);
    [row[pos++], row[pos++], row[pos++]] = hsl2Rgb(pol1(h), pol1(s), pol1(l));
    row[pos] = 255;
};
const hsl1 = (depth, row, pos) => {
    let [l, h, s] = shuffle(depth);
    [row[pos++], row[pos++], row[pos++]] = hsl2Rgb(pol1(h), pol1(s), pol1(l));
    row[pos] = 255;
};
const hsl2 = (depth, row, pos) => {
    let [l, h, s] = revSplit(depth);
    [row[pos++], row[pos++], row[pos++]] = hsl2Rgb(pol1(h), pol1(s), pol1(l));
    row[pos] = 255;
};
const hsl3 = (depth, row, pos) => {
    let [s, h, l] = revShuffle(depth);
    [row[pos++], row[pos++], row[pos++]] = hsl2Rgb(pol2(h), pol2(s), pol2(l));
    row[pos] = 255;
};
const hsv2Rgb = (h, s, v) => {
    let i = Math.floor(h * 6);
    let f = h * 6 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);
    let r, g, b;
    switch (i % 6) {
        case 0:
            r = v, g = t, b = p;
            break;
        case 1:
            r = q, g = v, b = p;
            break;
        case 2:
            r = p, g = v, b = t;
            break;
        case 3:
            r = p, g = q, b = v;
            break;
        case 4:
            r = t, g = p, b = v;
            break;
        // case 5
        default:
            r = v, g = p, b = q;
            break;
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};
const hsl2Rgb = (h, s, l) => {
    let r, g, b;
    if (s == 0) {
        r = g = b = l; // achromatic
    }
    else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2Rgb(p, q, h + 1 / 3);
        g = hue2Rgb(p, q, h);
        b = hue2Rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};
const hue2Rgb = (p, q, t) => {
    if (t < 0)
        t += 1;
    else if (t > 1)
        t -= 1;
    if (t < 1 / 6)
        return p + (q - p) * 6 * t;
    if (t < 1 / 2)
        return q;
    if (t < 2 / 3)
        return p + (q - p) * (2 / 3 - t) * 6;
    return p;
};
const split = (x) => {
    return [x & 0xFF, (x >> 8) & 0xFF, (x >> 16) & 0xFF];
};
const shuffle = (x) => {
    x = ((x & 0xF0F0F) << 4) | ((x >> 4) & 0xF0F0F);
    return [x & 0xFF, (x >> 8) & 0xFF, (x >> 16) & 0xFF];
};
const revSplit = (x) => {
    x = ((x & 0xFFFF) << 16) | ((x >> 16) & 0xFFFF);
    x = ((x & 0xFF00FF) << 8) | ((x >> 8) & 0xFF00FF);
    x = ((x & 0xF0F0F0F) << 4) | ((x >> 4) & 0xF0F0F0F);
    x = ((x & 0x33333333) << 2) | ((x >> 2) & 0x33333333);
    x = (((x & 0x55555555) << 1) | ((x >> 1) & 0x55555555)) >>> 8;
    return [x & 0xFF, (x >> 8) & 0xFF, (x >> 16) & 0xFF];
};
const revShuffle = (x) => {
    x = ((x & 0xFFFF) << 16) | ((x >> 16) & 0xFFFF);
    x = ((x & 0xFF00FF) << 8) | ((x >> 8) & 0xFF00FF);
    x = ((x & 0xF0F0F0F) << 4) | ((x >> 4) & 0xF0F0F0F);
    x = (((x & 0x33333333) << 2) | ((x >> 2) & 0x33333333)) >>> 8;
    return [x & 0xFF, (x >> 8) & 0xFF, (x >> 16) & 0xFF];
};
const rev8bit = (x) => {
    x = ((x & 0xF) << 4) | ((x >> 20) & 0xF); // 4567 0123
    x = ((x & 0x33) << 2) | ((x >> 2) & 0x33); // 6745 2301
    return ((x & 0x55) << 1) | ((x >> 1) & 0x55); // 7654 3210
};
const rev24bit = (x) => {
    x = ((x & 0xFFFF) << 16) | ((x >> 16) & 0xFFFF);
    x = ((x & 0xFF00FF) << 8) | ((x >> 8) & 0xFF00FF);
    x = ((x & 0xF0F0F0F) << 4) | ((x >> 4) & 0xF0F0F0F);
    x = ((x & 0x33333333) << 2) | ((x >> 2) & 0x33333333);
    x = ((x & 0x55555555) << 1) | ((x >> 1) & 0x55555555);
    return x >>> 8;
};
const pol1 = (x) => 1 - x / 255;
const pol2 = (x) => (1 - x / 255) ** 2;
