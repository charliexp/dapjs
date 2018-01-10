export declare class FlashSection {
    address: number;
    data: Uint32Array;
    constructor(address: number, data: Uint32Array);
    toString(): string;
}
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
export declare class FlashProgram {
    sections: FlashSection[];
    constructor(sections: FlashSection[]);
    static fromIntelHex(hex: string): FlashProgram;
    static fromBinary(addr: number, bin: Uint32Array): FlashProgram;
    totalByteLength(): number;
    toString(): string;
}
