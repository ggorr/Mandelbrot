onmessage = function (e: MessageEvent) {
    let colorUnit = 0xFFFFFF / e.data.iter;
    let line: number[] = Array(4 * e.data.mx);
    let u: number[] = Array<number>(e.data.mx);
    for (let i = 0; i < e.data.mx; i++)
        u[i] = (i - e.data.cenX) / e.data.unit;
    for (let j = 0; j < e.data.my; j++) {
        let v = (e.data.cenY - j) / e.data.unit;
        let pos = 0;
        for (let i = 0; i < e.data.mx; i++) {
            let n = mandelbrot(u[i], v, e.data.iter);
            let color = Math.round(n * colorUnit);
            line[pos++] = color & 0xFF;
            line[pos++] = (color >> 8)  & 0xFF;
            line[pos++] = (color >> 16)  & 0xFF;
            line[pos++] = 255;
        }
        postMessage(line)
    }
}

function mandelbrot1(u: number, v: number, iter: number): number {
    let x = 0;
    let y = 0;
    let n = 0;
    while (x * x + y * y <= 4 && n < iter) {
        let tx = x;
        x = tx * tx - y * y + u;
        y = 2 * tx * y + v;
        n++;
    }
    return n;
}
