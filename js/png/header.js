'use strict';
const HEADER_SIZE = 8;
const DEFAULT_HEADER = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
const isValidHeader = (buf, offset = 0) => {
    for (let i = 0; i < HEADER_SIZE; i++)
        if (buf[offset + i] != DEFAULT_HEADER[i])
            return false;
    return true;
};
export { HEADER_SIZE, DEFAULT_HEADER, isValidHeader };
