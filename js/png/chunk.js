'use strict';
import * as tools from './tools.js';
import crc32 from './crc.js';
class Chunk {
    constructor(param) {
        if (typeof param == 'number')
            this.buffer = new Uint8Array(param + 8);
        else
            this.buffer = param;
    }
    get Size() {
        return this.buffer.length + 4;
    }
    get ContentSize() {
        return this.buffer.length - 8;
    }
    get Identifier() {
        return tools.array2AsciiString(this.buffer, 0, 4);
    }
    set Identifier(identifier) {
        tools.string2Array(identifier, this.buffer, 0);
    }
    get Content() {
        return this.buffer.slice(4, this.buffer.length - 4);
    }
    set Content(content) {
        this.buffer.set(content, 4);
    }
    get Crc() {
        return tools.array2Uint(this.buffer, this.buffer.length - 4);
    }
    buildCrc() {
        let crc = crc32(this.buffer, 0, this.buffer.length - 4);
        tools.uint2Array(crc, 4, this.buffer, this.buffer.length - 4);
    }
    checkCrc() {
        let crc = crc32(this.buffer, 0, this.buffer.length - 4);
        return crc == this.Crc;
    }
    get Array() {
        let arr = new Uint8Array(4 + this.buffer.length);
        tools.uint2Array(this.buffer.length - 8, 4, arr, 0);
        arr.set(this.buffer, 4);
        return arr;
    }
    static readFrom(buf, offset = 0) {
        // size of content
        let contentSize = tools.array2Uint(buf, offset, offset + 4);
        offset += 4;
        let chunk;
        switch (tools.array2AsciiString(buf, offset, offset + 4)) {
            case "IHDR":
                chunk = new IhdrChunk(buf.slice(offset, offset + contentSize + 8));
                break;
            case "IDAT":
                chunk = new IdatChunk(buf.slice(offset, offset + contentSize + 8));
                break;
            case "IEND":
                chunk = new IendChunk(buf.slice(offset, offset + contentSize + 8));
                break;
            default:
                chunk = new Chunk(buf.slice(offset, offset + contentSize + 8));
        }
        if (!chunk.checkCrc())
            throw new Error('crc mismatch');
        return [chunk, offset + contentSize + 8];
    }
}
class IhdrChunk extends Chunk {
    constructor(param = undefined) {
        if (param == undefined) {
            super(IhdrChunk.CONTENT_SIZE);
            tools.string2Array(IhdrChunk.IDENTIFIER, this.buffer);
        }
        else
            super(param);
    }
    get Width() {
        return tools.array2Uint(this.buffer, 4, 8);
    }
    set Width(width) {
        tools.uint2Array(width, 4, this.buffer, 4);
    }
    get Height() {
        return tools.array2Uint(this.buffer, 8, 12);
    }
    set Height(height) {
        tools.uint2Array(height, 4, this.buffer, 8);
    }
    get BitPerPixel() {
        return this.buffer[12] & 0xFF;
    }
    set BitPerPixel(bitPerPixel) {
        this.buffer[12] = bitPerPixel;
    }
    get ColorType() {
        return this.buffer[13] & 0xFF;
    }
    set ColorType(colorType) {
        this.buffer[13] = colorType;
    }
    get Interlace() {
        return this.buffer[16] & 0xFF;
    }
    set Interlace(interlace) {
        this.buffer[16] = interlace;
    }
}
IhdrChunk.IDENTIFIER = 'IHDR';
IhdrChunk.CONTENT_SIZE = 13;
class IdatChunk extends Chunk {
    constructor(param) {
        super(param);
        if (typeof param == 'number')
            tools.string2Array(IdatChunk.IDENTIFIER, this.buffer);
    }
    get Compression() {
        return this.buffer[4] & 0xFF;
    }
    get FcheckValue() {
        return this.buffer[5] & 0xFF;
    }
    get CompressedData() {
        return this.buffer.slice(6, this.buffer.length - 4);
    }
    get CheckValue() {
        return tools.array2Uint(this.buffer, this.buffer.length - 8, this.buffer.length - 4);
    }
}
IdatChunk.IDENTIFIER = 'IDAT';
class IendChunk extends Chunk {
    constructor(param = undefined) {
        if (param == undefined) {
            super(IendChunk.CONTENT_SIZE);
            tools.string2Array(IendChunk.IDENTIFIER, this.buffer);
            tools.uint2Array(IendChunk.CRC, 4, this.buffer, this.buffer.length - 4);
        }
        else
            super(param);
    }
}
IendChunk.IDENTIFIER = 'IEND';
IendChunk.CRC = 0xAE426082;
IendChunk.CONTENT_SIZE = 0;
export { Chunk, IhdrChunk, IdatChunk, IendChunk };
