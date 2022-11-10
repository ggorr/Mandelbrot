"use strict";

// filter = 'none' | 'sub' | 'up' | 'average' | 'paeth' | 'min sum'
const filtrate = (data: Uint8Array, width: number, filter: string = 'none', bpp: number = 4): Uint8Array => {
    switch (filter.toLocaleLowerCase()) {
        case 'none':
            return filtrateNoneFull(data, width, bpp);
        case 'sub':
            return filtrateSubFull(data, width, bpp);
        case 'up':
            return filtrateUpFull(data, width, bpp);
        case 'average':
            return filtrateAverageFull(data, width, bpp);
        case 'paeth':
            return filtratePaethFull(data, width, bpp);
        case 'min sum':
            return filtrateMinSum(data, width, bpp);
        default:
            throw new Error('unknown filter: ' + filter);
    }
}

const filtrateMinSum = (data: Uint8Array, width: number, bpp: number = 4): Uint8Array => {
    let lineBytes = width * bpp;
    let height = data.length / lineBytes;
    let out = new Uint8Array((lineBytes + 1) * height);
    let funcs = [filtrateNoneLine, filtrateSubLine, filtrateUpLine, filtrateAverageLine, filtratePaethLine];
    // let count = Array<number>(5);
    // count.fill(0);

    let dst = [new Uint8Array(lineBytes + 1), new Uint8Array(lineBytes + 1), new Uint8Array(lineBytes + 1), new Uint8Array(lineBytes + 1), new Uint8Array(lineBytes + 1)]
    let src = new Uint8Array(lineBytes << 1);
    // src.fill(0);
    src.set(data.slice(0, lineBytes), lineBytes);
    let minSum, minInd;
    for (let k = 0; k < height; k++) {
        if (k > 0)
            src = data.slice((k - 1) * lineBytes, (k + 1) * lineBytes);
        minSum = Infinity;
        minInd = -1;
        for (let i = 0; i < 5; i++) {
            funcs[i](dst[i], src, bpp);
            let sum = 0;
            for (let j = 0; j < dst[i].length; j++)
                sum += dst[i][j];
            // let sum = dst[i].reduce((t, v) => t + v);
            if (sum < minSum) {
                minSum = sum;
                minInd = i;
            }
        }
        out.set(dst[minInd], k * (lineBytes + 1));
        // count[minInd]++;
    }
    // console.log(count);
    return out;
}

const filtrateLineFull = (data: Uint8Array, width: number, bpp: number = 4): Uint8Array => {
    // let func = filtrateNoneLine;
    // let func = filtrateSubLine;
    // let func = filtrateUpLine;
    let func = filtrateAverageLine;
    // let func = filtratePaethLine;
    let lineBytes = width * bpp;
    let height = data.length / lineBytes;
    let out = new Uint8Array((lineBytes + 1) * height);

    let dst = new Uint8Array(lineBytes + 1);
    let src = new Uint8Array(lineBytes << 1);
    src.set(data.slice(0, lineBytes), lineBytes);
    func(dst, src, bpp);
    out.set(dst, 0);
    for (let i = 1; i < height; i++) {
        func(dst, data.slice((i - 1) * lineBytes, (i + 1) * lineBytes), bpp);
        out.set(dst, i * (lineBytes + 1));
    }
    return out;
}

// bpp: bytes(samples) per pixel
const filtrateNoneLine = (dst: Uint8Array, src: Uint8Array, bpp: number): void => {
    dst[0] = 0;
    dst.set(src.slice(src.length >>> 1, src.length), 1);
};

// bpp: bytes(samples) per pixel
const filtrateSubLine = (dst: Uint8Array, src: Uint8Array, bpp: number): void => {
    const lineBytes = src.length >>> 1;
    dst[0] = 1;
    dst.set(src.slice(lineBytes, lineBytes + bpp), 1);
    let srcPos = lineBytes + bpp;
    let srcBpp = lineBytes; // srcBpp = srcPos - bpp
    let dstPos = bpp + 1;
    let v;
    while (srcPos < src.length) {
        v = src[srcPos++] - src[srcBpp++];
        dst[dstPos++] = v >= 0 ? v : 256 + v;
    }
};

// bpp: bytes(samples) per pixel
const filtrateUpLine = (dst: Uint8Array, src: Uint8Array, bpp: number): void => {
    const lineBytes = src.length >>> 1;
    dst[0] = 2;
    let srcPos = lineBytes;
    let srcUp = 0; // srcUp = srcPos - bpp * width
    let dstPos = 1;
    let v;
    while (srcPos < src.length) {
        v = src[srcPos++] - src[srcUp++];
        dst[dstPos++] = v >= 0 ? v : 256 + v;
    }
};

// bpp: bytes(samples) per pixel
const filtrateAverageLine = (dst: Uint8Array, src: Uint8Array, bpp: number): void => {
    let lineBytes = src.length >>> 1;
    dst[0] = 3;
    let srcPos = lineBytes;
    let srcUp = 0; // srcUp = srcPos - bpp * width
    let dstPos = 1;
    let stop = lineBytes + bpp;
    let v;
    // the first pixel
    while (srcPos < stop) {
        // v = src[srcPos++] - Math.floor(src[srcUp++] / 2);
        v = src[srcPos++] - (src[srcUp++] >>> 1);
        dst[dstPos++] = v >= 0 ? v : 256 + v;
    }
    let srcBpp = lineBytes; // srcBpp = srcPos - bpp;
    // after first pixel
    while (srcPos < src.length) {
        // v = src[srcPos++] - Math.floor((src[srcBpp++] + src[srcUp++]) / 2);
        v = src[srcPos++] - (src[srcBpp++] + src[srcUp++] >>> 1);
        dst[dstPos++] = v >= 0 ? v : 256 + v;
    }
};

// bpp: bytes(samples) per pixel
const filtratePaethLine = (dst: Uint8Array, src: Uint8Array, bpp: number): void => {
    let lineBytes = src.length >>> 1;
    dst[0] = 4;
    let srcPos = lineBytes;
    let srcUp = 0; // srcUp = srcPos - bpp * width
    let dstPos = 1;
    let stop = lineBytes + bpp;
    let v;
    // the first pixel
    while (srcPos < stop) {
        v = src[srcPos++] - src[srcUp++];
        dst[dstPos++] = v >= 0 ? v : 256 + v;
    }
    let srcBpp = lineBytes; // srcBpp = srcPos - bpp;
    let srcUpBpp = 0; // srcUpBpp = srcUp - bpp;
    // after first pixel
    while (srcPos < src.length) {
        v = src[srcPos++] - paethPredictor(src[srcBpp++], src[srcUp++], src[srcUpBpp++]);
        dst[dstPos++] = v >= 0 ? v : 256 + v;
    }
};


// bpp: bytes(samples) per pixel
const filtrateNoneFull = (src: Uint8Array, width: number, bpp: number): Uint8Array => {
    const lineBytes = bpp * width;
    const height = src.length / lineBytes;
    const dst = new Uint8Array((lineBytes + 1) * height);
    let srcPos = 0;
    let dstPos = 0;
    while (srcPos < src.length) {
        dst[dstPos++] = 0;
        dst.set(src.slice(srcPos, srcPos + lineBytes), dstPos);
        dstPos += lineBytes;
        srcPos += lineBytes;
    }
    return dst;
}

// bpp: bytes(samples) per pixel
const filtrateSubFull = (src: Uint8Array, width: number, bpp: number): Uint8Array => {
    const lineBytes = bpp * width;
    const height = src.length / lineBytes;
    const dst = new Uint8Array((lineBytes + 1) * height);
    let srcPos = 0;
    let dstPos = 0;
    let srcBpp;  // srcBpp = srcPos - bpp
    let v, stop;
    while (srcPos < src.length) {
        dst[dstPos++] = 1;
        // the first pixel of each scanline
        dst.set(src.slice(srcPos, srcPos + bpp), dstPos);
        stop = srcPos + lineBytes;
        srcBpp = srcPos;
        srcPos += bpp;
        dstPos += bpp;
        while (srcPos < stop) {
            v = src[srcPos++] - src[srcBpp++];
            dst[dstPos++] = v >= 0 ? v : 256 + v;
        }
    }
    return dst;
}

// bpp: bytes(samples) per pixel
const filtrateUpFull = (src: Uint8Array, width: number, bpp: number): Uint8Array => {
    const lineBytes = bpp * width;
    const height = src.length / lineBytes;
    const dst = new Uint8Array((lineBytes + 1) * height);
    dst[0] = 2;
    // the first scanline
    dst.set(src.slice(0, lineBytes), 1);
    let srcPos = lineBytes;
    let srcUp = 0; // srcUp = srcPos - bpp * width
    let dstPos = lineBytes + 1;
    let v, stop;
    while (srcPos < src.length) {
        dst[dstPos++] = 2;
        stop = srcPos + lineBytes;
        while (srcPos < stop) {
            v = src[srcPos++] - src[srcUp++];
            dst[dstPos++] = v >= 0 ? v : 256 + v;
        }
    }
    return dst;
}

// bpp: bytes(samples) per pixel
const filtrateAverageFull = (src: Uint8Array, width: number, bpp: number): Uint8Array => {
    const lineBytes = bpp * width;
    const height = src.length / lineBytes;
    const dst = new Uint8Array((lineBytes + 1) * height);
    dst[0] = 3;
    // the first pixel of the first scanline
    dst.set(src.slice(0, bpp), 1);
    let srcPos = bpp;
    let srcBpp = 0; // srcBpp = srcPos - bpp
    let dstPos = bpp + 1;
    let v, stop;
    // the first scanline
    while (srcPos < lineBytes) {
        // v = src[srcPos++] - Math.floor(src[srcBpp++] / 2);
        v = src[srcPos++] - (src[srcBpp++] >>> 1);
        dst[dstPos++] = v >= 0 ? v : 256 + v;
    }
    let srcUp = 0; // srcUp = srcPos - lineBytes
    while (srcPos < src.length) {
        dst[dstPos++] = 3;
        // the first pixel of each scanline
        stop = srcPos + bpp;
        while (srcPos < stop) {
            // v = src[srcPos++] - Math.floor(src[srcUp++] / 2);
            v = src[srcPos++] - (src[srcUp++] >>> 1);
            dst[dstPos++] = v >= 0 ? v : 256 + v;
        }
        srcBpp = srcPos - bpp;
        stop += lineBytes - bpp;
        // each scanline
        while (srcPos < stop) {
            // v = src[srcPos++] - Math.floor((src[srcBpp++] + src[srcUp++]) / 2);
            v = src[srcPos++] - (src[srcBpp++] + src[srcUp++] >>> 1);
            dst[dstPos++] = v >= 0 ? v : 256 + v;
        }
        // for (let j = 0; j < bpp * width; j++) {
        //     v = src[srcPos] - Math.floor((j < bpp ? src[srcUp] : src[srcBpp] + src[srcUp]) / 2);
        //     dst[dstPos++] = v >= 0 ? v : 256 + v;
        //     srcPos++;
        //     srcBpp++;
        //     srcUp++;
        // }
    }
    return dst;
}

// bpp: bytes(samples) per pixel
const filtratePaethFull = (src: Uint8Array, width: number, bpp: number): Uint8Array => {
    const lineBytes = bpp * width;
    const height = src.length / lineBytes;
    const dst = new Uint8Array((lineBytes + 1) * height);
    dst[0] = 4;
    // the first pixel of the first scanline
    dst.set(src.slice(0, bpp), 1);
    let srcPos = bpp;
    let srcBpp = 0; // srcBpp = srcPos - bpp
    let dstPos = bpp + 1;
    let v, stop;
    // the first scanline
    while (srcPos < lineBytes) {
        v = src[srcPos++] - src[srcBpp++];
        dst[dstPos++] = v >= 0 ? v : 256 + v;
    }
    let srcUp = 0; // srcUp = srcPos - bpp * width
    let srcUpBpp; // srcUpBpp = srcUp - bpp;
    while (srcPos < src.length) {
        dst[dstPos++] = 4;
        // the first pixel of each scanline
        stop = srcPos + bpp;
        while (srcPos < stop) {
            v = src[srcPos++] - src[srcUp++];
            dst[dstPos++] = v >= 0 ? v : 256 + v;
        }
        srcBpp = srcPos - bpp;
        srcUpBpp = srcUp - bpp;
        stop += lineBytes - bpp;
        //each scanline
        while (srcPos < stop) {
            v = src[srcPos++] - paethPredictor(src[srcBpp++], src[srcUp++], src[srcUpBpp++]);
            dst[dstPos++] = v >= 0 ? v : 256 + v;
        }
    }
    return dst;
}

// a = left, b = above, c = upper left
const paethPredictor = (a: number, b: number, c: number): number => {
    let p = a + b - c;
    let pa = Math.abs(p - a);
    let pb = Math.abs(p - b);
    let pc = Math.abs(p - c)
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

export default filtrate;