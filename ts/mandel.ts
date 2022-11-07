let unit: number, minX: number, maxX: number, minY: number, maxY: number;

const setView = (): void => {
    unit = parseFloat((document.getElementById('unit') as HTMLInputElement).value);
    minX = parseFloat((document.getElementById('min-x') as HTMLInputElement).value);
    maxX = parseFloat((document.getElementById('max-x') as HTMLInputElement).value);
    minY = parseFloat((document.getElementById('min-y') as HTMLInputElement).value);
    maxY = parseFloat((document.getElementById('max-y') as HTMLInputElement).value);
    (document.getElementById('view') as HTMLSpanElement).innerHTML = `(${Math.round((maxX - minX) * unit)}, ${Math.round((maxY - minY) * unit)})`;
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
    setView(); // test
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
    setView(); // test
}

let worker: Worker | null = null;
let interval: number;

const display = (): void => {
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
    let image: ImageData = context.createImageData(width, height);
    let pos = 0;
    worker.onmessage = (ev) => {
        for (let i = 0; i < ev.data.length; i++)
            image.data[pos++] = ev.data[i];
        context.putImageData(image, 0, 0);
        if (pos == 4 * width * height)
            stopDisplay();
    }
    worker.postMessage({ width: width, height: height, minX: minX, maxY: maxY, unit: unit, iter: iter });

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

const downloadPng = () => {
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

export { setView, setXy, centerTo, expand, display, stopDisplay, downloadPng };
