'use strict';

import * as tools from './tools.js';
import crc32 from './crc.js';

class Chunk {
    buffer!: Uint8Array;

    constructor(param: number | Uint8Array) {
        if (typeof param == 'number')
            this.buffer = new Uint8Array(param + 8);
        else
            this.buffer = param;
    }

    get Size():number {
        return this.buffer.length + 4;
    }

    get ContentSize(): number {
        return this.buffer.length - 8;
    }

    get Identifier(): string {
        return tools.array2AsciiString(this.buffer, 0, 4);
    }

    set Identifier(identifier: string) {
        tools.string2Array(identifier, this.buffer, 0);
    }

    get Content(): Uint8Array {
        return this.buffer.slice(4, this.buffer.length - 4);
    }

    set Content(content: Uint8Array) {
        this.buffer.set(content, 4);
    }

    get Crc(): number {
        return tools.array2Uint(this.buffer, this.buffer.length - 4);
    }

    buildCrc(): void {
        let crc = crc32(this.buffer, 0, this.buffer.length - 4);
        tools.uint2Array(crc, 4, this.buffer, this.buffer.length - 4);
    }

    checkCrc(): boolean {
        let crc = crc32(this.buffer, 0, this.buffer.length - 4);
        return crc == this.Crc;
    }

    get Array(): Uint8Array {
        let arr = new Uint8Array(4 + this.buffer.length);
        tools.uint2Array(this.buffer.length - 8, 4, arr, 0);
        arr.set(this.buffer, 4);
        return arr;
    }

    static readFrom(buf: Uint8Array, offset: number = 0): [Chunk, number] {
        // size of content
        let contentSize = tools.array2Uint(buf, offset, offset + 4);
        offset += 4;

        let chunk: Chunk;
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
    static readonly IDENTIFIER: string = 'IHDR';
    static readonly CONTENT_SIZE: number = 13;

    constructor(param: Uint8Array | undefined = undefined) {
        if (param == undefined) {
            super(IhdrChunk.CONTENT_SIZE);
            tools.string2Array(IhdrChunk.IDENTIFIER, this.buffer);
        } else
            super(param);
    }

    get Width(): number {
        return tools.array2Uint(this.buffer, 4, 8);
    }

    set Width(width: number) {
        tools.uint2Array(width, 4, this.buffer, 4);
    }

    get Height(): number {
        return tools.array2Uint(this.buffer, 8, 12);
    }

    set Height(height: number) {
        tools.uint2Array(height, 4, this.buffer, 8);
    }

    get BitPerPixel(): number {
        return this.buffer[12] & 0xFF;
    }

    set BitPerPixel(bitPerPixel: number) {
        this.buffer[12] = bitPerPixel;
    }

    get ColorType(): number {
        return this.buffer[13] & 0xFF;
    }

    set ColorType(colorType: number) {
        this.buffer[13] = colorType;
    }

    get Interlace(): number {
        return this.buffer[16] & 0xFF;
    }

    set Interlace(interlace: number) {
        this.buffer[16] = interlace;
    }
}

class IdatChunk extends Chunk {
    static readonly IDENTIFIER: string = 'IDAT';

    constructor(param: Uint8Array | number) {
        super(param);
        if (typeof param == 'number')
            tools.string2Array(IdatChunk.IDENTIFIER, this.buffer);
    }

    get Compression(): number {
        return this.buffer[4] & 0xFF;
    }

    get FcheckValue(): number {
        return this.buffer[5] & 0xFF;
    }

    get CompressedData(): Uint8Array {
        return this.buffer.slice(6, this.buffer.length - 4);
    }

    get CheckValue(): number {
        return tools.array2Uint(this.buffer, this.buffer.length - 8, this.buffer.length - 4);
    }
}

class IendChunk extends Chunk {
    static readonly IDENTIFIER: string = 'IEND';
    static readonly CRC: number = 0xAE426082;
    static readonly CONTENT_SIZE: number = 0;

    constructor(param: Uint8Array | undefined = undefined) {
        if (param == undefined) {
            super(IendChunk.CONTENT_SIZE);
            tools.string2Array(IendChunk.IDENTIFIER, this.buffer);
            tools.uint2Array(IendChunk.CRC, 4, this.buffer, this.buffer.length - 4);
        } else
            super(param);
    }
}

export { Chunk, IhdrChunk, IdatChunk, IendChunk };