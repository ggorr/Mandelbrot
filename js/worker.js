'use strice';
import colorize from './color.js';
onmessage = (e) => {
    if (e.data.depths == undefined) {
        let u = Array(e.data.width);
        for (let i = 0; i < e.data.width; i++)
            u[i] = e.data.minX + i / e.data.unit;
        let depths = [];
        let line = new Uint8Array(4 * e.data.width);
        for (let j = 0; j < e.data.height; j++) {
            let v = e.data.maxY - j / e.data.unit;
            let rowDepths = Array(e.data.width);
            for (let i = 0; i < e.data.width; i++)
                rowDepths[i] = mandelbrot(u[i], v, e.data.iter);
            colorize(rowDepths, e.data.iter, e.data.color, line);
            postMessage(line);
            depths.push(rowDepths);
        }
        postMessage(depths);
    }
    else {
        let line = new Uint8Array(4 * e.data.depths[0].length);
        for (let j = 0; j < e.data.depths.length; j++) {
            colorize(e.data.depths[j], e.data.iter, e.data.color, line);
            postMessage(line);
        }
        postMessage(null);
    }
};
const mandelbrot = (u, v, iter) => {
    let x = 0, y = 0;
    let x2 = 0, y2 = 0;
    let n = 0;
    while (x2 + y2 <= 4 && n++ < iter) {
        y = 2 * x * y + v;
        x = x2 - y2 + u;
        x2 = x * x;
        y2 = y * y;
    }
    return n;
};
