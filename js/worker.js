"use strict";
onmessage = function (e) {
    let colorUnit = 0xFFFFFF / e.data.iter;
    let line = Array(4 * e.data.width);
    let u = Array(e.data.width);
    for (let i = 0; i < e.data.width; i++)
        u[i] = e.data.minX + i / e.data.unit;
    for (let j = 0; j < e.data.height; j++) {
        let v = e.data.maxY - j / e.data.unit;
        let pos = 0;
        for (let i = 0; i < e.data.width; i++) {
            let color = Math.round(mandelbrot(u[i], v, e.data.iter) * colorUnit);
            line[pos++] = color & 0xFF;
            line[pos++] = (color >> 8) & 0xFF;
            line[pos++] = (color >> 16) & 0xFF;
            line[pos++] = 255;
        }
        postMessage(line);
    }
};
function mandelbrot(u, v, iter) {
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
}
