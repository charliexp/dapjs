"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../util");
class FlashSection {
    constructor(address, data) {
        this.address = address;
        this.data = data;
        /* empty */
    }
    toString() {
        return `${this.data.byteLength} bytes @ ${this.address.toString(16)}`;
    }
}
exports.FlashSection = FlashSection;
/**
 * # Flash Program
 *
 * Represents a program to be flashed to memory as a series of disjoint sections
 * in memory/flash.
 *
 * ## Usage
 *
 * Use with a hex file is as simple as loading it from disk, and calling `fromIntelHex`.
 *
 * ```typescript
 * const hexFile = "microbit.hex";
 * const hexData = fs.readFileSync(hexFile, { encoding: 'utf-8' });
 *
 * const program = FlashProgram.fromIntelHex(hexData);
 * core.program(program, (progress) => {
 *     console.log(`Flash progress: ${progress * 100}%`);
 * });
 * ```
 *
 * When used with a binary file, you must make sure that the file is stored in a
 * Uint32Array, and you must provide a base address for the binary to be written to.
 * The base address is commonly zero.
 */
class FlashProgram {
    constructor(sections) {
        this.sections = sections;
    }
    static fromIntelHex(hex) {
        const lines = hex.split(/\n/);
        let upperAddr = 0;
        let startAddr = 0;
        let current = null;
        const chunks = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.substr(0, 1) !== ":") {
                throw new Error(`Invaild line in hex file: ${i + 1}`);
            }
            else {
                const length = parseInt(line.substr(1, 2), 16);
                const addr = upperAddr + parseInt(line.substr(3, 4), 16);
                const fieldType = parseInt(line.substr(7, 2), 16);
                const data = line.substr(9, length * 2);
                if (fieldType === 0x00) {
                    if (current && addr !== startAddr + (current.length / 2)) {
                        // non-contiguous
                        const sectionData = util_1.hex2bin(current);
                        chunks.push(new FlashSection(startAddr, new Uint32Array(sectionData.buffer)));
                        current = "";
                        startAddr = addr;
                    }
                    else if (!current) {
                        startAddr = addr;
                        current = "";
                    }
                    current += data;
                }
                else if (fieldType === 0x01) {
                    // EOF
                    break;
                }
                else if (fieldType === 0x02) {
                    // extended segment address record
                    upperAddr = parseInt(data, 16) << 4;
                }
                else if (fieldType === 0x04) {
                    // extended linear address record
                    upperAddr = parseInt(data, 16) << 16;
                }
            }
        }
        return new FlashProgram(chunks);
    }
    static fromBinary(addr, bin) {
        return new FlashProgram([new FlashSection(addr, bin)]);
    }
    totalByteLength() {
        return this.sections.map(s => s.data.byteLength).reduce((x, y) => x + y);
    }
    toString() {
        return this.sections.toString();
    }
}
exports.FlashProgram = FlashProgram;

//# sourceMappingURL=FlashProgram.js.map
