'use strict';

const createTable32 = (): Uint32Array => {
	let table32: Uint32Array = new Uint32Array(256);
	for (let i = 0; i < 256; i++) {
		let c = i;
		for (let k = 0; k < 8; k++) {
			if ((c & 1) == 1)
				c = 0xEDB88320 ^ ((c >> 1) & 0x7FFFFFFF);
			else
				c = ((c >> 1) & 0x7FFFFFFF);
		}
		table32[i] = c;
	}
	return table32;
}

const crc32 = (buf: Uint8Array, start: number = 0, end: number = -1, crc: number = 0): number => {
	let table32 = createTable32();
	end >= 0 || (end = buf.length);
	crc ^= 0xFFFFFFFF;
	for (let i = start; i < end; i++)
		crc = table32[(crc ^ buf[i]) & 0xFF] ^ ((crc >> 8) & 0xFFFFFF);
	return (crc ^ 0xFFFFFFFF) >>> 0;
}

export default crc32;