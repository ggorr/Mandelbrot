'use strict';
import * as chunk from './chunk.js';
import filtrate from "./filter.js";
import { deflate } from './pako.js';
import { HEADER_SIZE, DEFAULT_HEADER } from './header.js';
// filter = 'none' | 'sub' | 'up' | 'average' | 'paeth' | 'min sum'
// bpp: bytes per channel in pixel
const toPng = (data, width, filter = 'none', bpp = 4) => {
    let height = data.length / (width << 2);
    let ihdrChunk = new chunk.IhdrChunk();
    ihdrChunk.Width = width;
    ihdrChunk.Height = height;
    ihdrChunk.BitPerPixel = 8; // bit/pixel/channel
    ihdrChunk.ColorType = 6; // RGBA
    ihdrChunk.Interlace = 0;
    ihdrChunk.buildCrc();
    let filteredData = filtrate(data, width, filter, bpp);
    let deflatedData = deflate(filteredData);
    let idatChunk = new chunk.IdatChunk(deflatedData.length);
    idatChunk.Content = deflatedData;
    idatChunk.buildCrc();
    let iendChunk = new chunk.IendChunk();
    let dst = new Uint8Array(HEADER_SIZE + ihdrChunk.Size + idatChunk.Size + iendChunk.Size);
    dst.set(DEFAULT_HEADER);
    let pos = HEADER_SIZE;
    dst.set(ihdrChunk.Array, pos);
    dst.set(idatChunk.Array, pos += ihdrChunk.Size);
    dst.set(iendChunk.Array, pos += idatChunk.Size);
    return dst;
};
export default toPng;
