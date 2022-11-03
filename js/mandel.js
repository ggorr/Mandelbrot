let unit, minX, maxX, minY, maxY;
let offset = 10;
function setView() {
    unit = parseFloat(document.getElementById('unit').value);
    minX = parseFloat(document.getElementById('min-x').value);
    maxX = parseFloat(document.getElementById('max-x').value);
    minY = parseFloat(document.getElementById('min-y').value);
    maxY = parseFloat(document.getElementById('max-y').value);
    document.getElementById('view').innerHTML = `(${Math.round((maxX - minX) * unit)}, ${Math.round((maxY - minY) * unit)})`;
}
function trunc(x) {
    return Math.round(x * 10000000000) / 10000000000;
}
function setXy(x, y) {
    document.getElementById('xy').innerHTML = `(${trunc(minX + (x - offset) / unit)}, ${trunc(maxY - (y - offset) / unit)})`;
}
function centerTo(canvasX, canvasY) {
    let x = minX + (canvasX - offset) / unit;
    let y = maxY - (canvasY - offset) / unit;
    let sx = x - (minX + maxX) / 2;
    minX += sx;
    maxX += sx;
    let sy = y - (minY + maxY) / 2;
    minY += sy;
    maxY += sy;
    document.getElementById('min-x').value = `${trunc(minX)}`;
    document.getElementById('max-x').value = `${trunc(maxX)}`;
    document.getElementById('min-y').value = `${trunc(minY)}`;
    document.getElementById('max-y').value = `${trunc(maxY)}`;
    setView(); // test
}
function expand(factor) {
    unit *= factor;
    let t = minX;
    minX = ((factor + 1) * t + (factor - 1) * maxX) / (2 * factor);
    maxX = ((factor - 1) * t + (factor + 1) * maxX) / (2 * factor);
    t = minY;
    minY = ((factor + 1) * t + (factor - 1) * maxY) / (2 * factor);
    maxY = ((factor - 1) * t + (factor + 1) * maxY) / (2 * factor);
    document.getElementById('unit').value = `${trunc(unit)}`;
    document.getElementById('min-x').value = `${trunc(minX)}`;
    document.getElementById('max-x').value = `${trunc(maxX)}`;
    document.getElementById('min-y').value = `${trunc(minY)}`;
    document.getElementById('max-y').value = `${trunc(maxY)}`;
    setView(); // test
}
let worker = null;
let interval;
function display() {
    if (worker != null)
        return;
    worker = new Worker("./js/worker.js", { type: 'module' });
    let canvas = document.getElementById('canvas');
    let context = canvas.getContext('2d');
    let iter = parseInt(document.getElementById('iter').value);
    let width = Math.round((maxX - minX) * unit);
    let height = Math.round((maxY - minY) * unit);
    canvas.width = width;
    canvas.height = height;
    let image = context.createImageData(width, height);
    let pos = 0;
    worker.onmessage = (ev) => {
        for (let i = 0; i < ev.data.length; i++)
            image.data[pos++] = ev.data[i];
        context.putImageData(image, offset, offset);
        if (pos == 4 * width * height)
            stopDisplay();
    };
    worker.postMessage({ width: width, height: height, minX: minX, maxY: maxY, unit: unit, iter: iter });
    let timeCount = 0;
    interval = setInterval(() => {
        timeCount++;
        document.getElementById("time").innerHTML = (timeCount / 10).toFixed(1);
    }, 100);
}
function stopDisplay() {
    if (worker == null)
        return;
    clearInterval(interval);
    worker.terminate();
    worker = null;
}
export { setView, setXy, centerTo, expand, display, stopDisplay };
