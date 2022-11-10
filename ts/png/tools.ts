// 0 < length <= 4
const array2Uint = (buf: Uint8Array, start: number = 0, end: number = -1): number => {
    end >= 0 || (end = buf.length);
    let value = 0;
    let shift = 0;
    for (let i = end - 1; i >= start; i--) {
        value |= buf[i] << shift;
        shift += 8;
    }
    return value >>> 0;
}

const array2HexString = (buf: Uint8Array, start: number = 0, end: number = -1, separator = ' '): string => {
    end >= 0 || (end = buf.length);
    let arr = [];
    for (let i = start; i < end; i++)
        arr.push(buf[i] > 15 ? buf[i].toString(16) : '0' + buf[i].toString(16));
    return arr.join(separator).toUpperCase();
}

const array2AsciiString = (buf: Uint8Array, start: number = 0, end: number = -1): string => {
    return String.fromCharCode(...buf.slice(start, end >= 0 ? end : buf.length));
}

const uint2Array = (n: number, length: number = 4, array: Uint8Array | null = null, offset: number = 0): Uint8Array => {
    array != null || (array = new Uint8Array(length));
    for (let i = length - 1; i >= 0; i--) {
        array[offset + i] = n & 0xFF;
        n >>= 8
    }
    return array;
}

const string2Array = (str: string, array: Uint8Array | null = null, offset: number = 0): Uint8Array => {
    array != null || (array = new Uint8Array(str.length));
    for (let i = 0; i < str.length; i++)
        array[offset + i] = str.charCodeAt(i);
    return array;
}

export { array2Uint, array2HexString, array2AsciiString, uint2Array, string2Array };