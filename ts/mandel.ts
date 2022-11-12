import toPng from './png/png.js';

let unit: number, minX: number, maxX: number, minY: number, maxY: number, coloring: string | undefined;

const display = (): void => {
    setView();
    let radios = ['rgb0', 'rgb1', 'rgb2', 'rgb3', 'hsv0', 'hsv1', 'hsv2', 'hsv3', 'hsl0', 'hsl1', 'hsl2', 'hsl3'];
    coloring = radios.find(v => (document.getElementById(v) as HTMLInputElement).checked);
    showImage();
}

const setView = (): void => {
    unit = parseFloat((document.getElementById('unit') as HTMLInputElement).value);
    minX = parseFloat((document.getElementById('min-x') as HTMLInputElement).value);
    maxX = parseFloat((document.getElementById('max-x') as HTMLInputElement).value);
    minY = parseFloat((document.getElementById('min-y') as HTMLInputElement).value);
    maxY = parseFloat((document.getElementById('max-y') as HTMLInputElement).value);
    (document.getElementById('view') as HTMLSpanElement).innerHTML = `(${Math.round((maxX - minX) * unit)}, ${Math.round((maxY - minY) * unit)})`;
    // (document.getElementById('view') as HTMLSpanElement).innerHTML = `(${(maxX - minX) * unit}, ${(maxY - minY) * unit})`;
}

const trunc = (x: number): number => {
    return Math.round(x * 10000000000) / 10000000000;
}

const setXy = (x: number, y: number): void => {
    (document.getElementById('xy') as HTMLSpanElement).innerHTML = `(${trunc(minX + x / unit)}, ${trunc(maxY - y / unit)})`;
}

const centerTo = (canvasX: number, canvasY: number): void => {
    let x = minX + canvasX / unit;
    let y = maxY - canvasY / unit;
    let sx = x - (minX + maxX) / 2;
    minX += sx;
    maxX += sx;
    let sy = y - (minY + maxY) / 2;
    minY += sy;
    maxY += sy;
    (document.getElementById('min-x') as HTMLInputElement).value = `${trunc(minX)}`;
    (document.getElementById('max-x') as HTMLInputElement).value = `${trunc(maxX)}`;
    (document.getElementById('min-y') as HTMLInputElement).value = `${trunc(minY)}`;
    (document.getElementById('max-y') as HTMLInputElement).value = `${trunc(maxY)}`;
    setView();
}

const expand = (factor: number): void => {
    unit *= factor;
    let t = minX;
    minX = ((factor + 1) * t + (factor - 1) * maxX) / (2 * factor);
    maxX = ((factor - 1) * t + (factor + 1) * maxX) / (2 * factor);
    t = minY;
    minY = ((factor + 1) * t + (factor - 1) * maxY) / (2 * factor);
    maxY = ((factor - 1) * t + (factor + 1) * maxY) / (2 * factor);
    (document.getElementById('unit') as HTMLInputElement).value = `${trunc(unit)}`;
    (document.getElementById('min-x') as HTMLInputElement).value = `${trunc(minX)}`;
    (document.getElementById('max-x') as HTMLInputElement).value = `${trunc(maxX)}`;
    (document.getElementById('min-y') as HTMLInputElement).value = `${trunc(minY)}`;
    (document.getElementById('max-y') as HTMLInputElement).value = `${trunc(maxY)}`;
    setView();
}

let worker: Worker | null = null;
let interval: number;
let image: ImageData;

const showImage = (): void => {
    if (worker != null)
        return;
    worker = new Worker("./js/worker.js", { type: 'module' });

    let canvas = document.getElementById('canvas') as HTMLCanvasElement;
    let context = canvas.getContext('2d') as CanvasRenderingContext2D;

    let iter = parseInt((document.getElementById('iter') as HTMLInputElement).value);

    let width = Math.round((maxX - minX) * unit);
    let height = Math.round((maxY - minY) * unit);
    canvas.width = width;
    canvas.height = height;
    image = context.createImageData(width, height);
    let pos = 0;
    worker.onmessage = (ev) => {
        image.data.set(ev.data, pos);
        context.putImageData(image, 0, 0);
        pos += 4 * width;
        if (pos == 4 * width * height)
            stopDisplay();
    }
    worker.postMessage({ width: width, height: height, minX: minX, maxY: maxY, unit: unit, iter: iter, coloring: coloring });

    let timeCount = 0;
    interval = setInterval(() => {
        timeCount++;
        (document.getElementById("time") as HTMLSpanElement).innerHTML = (timeCount / 10).toFixed(1);
    }, 100);
}

const stopDisplay = () => {
    if (worker == null)
        return;
    clearInterval(interval);
    worker.terminate();
    worker = null;
}

const downloadPng0 = () => {
    // download
    let canvas = document.getElementById('canvas') as HTMLCanvasElement;
    canvas.toBlob((blob) => {
        if (blob != null) {
            let link = document.createElement("a");
            link.download = (document.getElementById('filename') as HTMLInputElement).value;
            link.href = window.URL.createObjectURL(blob);
            link.click();
        }
    }, 'image/png');
}

const downloadPng = (pngFilter: string = 'none') => {
    // download
    let data = toPng(new Uint8Array(image.data.buffer), image.width, pngFilter);
    let blob = new Blob([data], { type: 'image/png' });
    let link = document.createElement("a");
    link.download = (document.getElementById('filename') as HTMLInputElement).value;
    link.href = window.URL.createObjectURL(blob);
    link.click();
}

export { setView, setXy, centerTo, expand, display, stopDisplay, downloadPng, downloadPng0 };
