function display(): void {
    let offset = 10;
    let canvas = document.getElementById('canvas') as HTMLCanvasElement;
    let context = canvas.getContext('2d') as CanvasRenderingContext2D;

    let unit = parseFloat((document.getElementById('unit') as HTMLInputElement).value);
    let iter = parseInt((document.getElementById('iter') as HTMLInputElement).value);

    let cenX = Math.ceil(2.1 * unit);
    let cenY = Math.ceil(1.6 * unit);
    let mx = Math.ceil(3.2 * unit);
    let my = Math.ceil(3.2 * unit);
    canvas.width = mx;
    canvas.height = my;
    let image: ImageData = context.createImageData(mx, my);
    
    let colorUnit = 0xFFFFFF / iter;

    for (let i = 0; i < mx; i++) {
        let u = (i - cenX) / unit;
        for (let j = 0; j < my; j++) {
            let v = (cenY - j) / unit;
            let pos = 4 * (mx * j + i);
            let n = mandelbrot(u, v, iter);

            let color = Math.round(n * colorUnit);
            image.data[pos] = color % 256;
            color /= 256
            image.data[pos + 1] = color % 256;
            color /= 256
            image.data[pos + 2] = color;
            image.data[pos + 3] = 255;
        }
        context.putImageData(image, offset, offset);
    }
}

function mandelbrot(u: number, v: number, iter: number): number {
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
export { display };
