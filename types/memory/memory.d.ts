import { DAP } from "../dap/dap";
import { PreparedMemoryCommand } from "./prepared";
/**
 * # Memory Interface
 *
 * Controls access to the target's memory.
 *
 * ## Usage
 *
 * Using an instance of `CortexM`, as described before, we can simply read and
 * write numbers to memory as follows:
 *
 * ```typescript
 * const mem = core.memory;
 *
 * // NOTE: the address parameter must be word (4-byte) aligned.
 * await mem.write32(0x200000, 12345);
 * const val = await mem.read32(0x200000);
 *
 * // val === 12345
 *
 * // NOTE: the address parameter must be half-word (2-byte) aligned
 * await mem.write16(0x2000002, 65534);
 * const val16 = await mem.read16(0x2000002);
 *
 * // val16 === 65534
 * ```
 *
 * To write a larger block of memory, we can use `readBlock` and `writeBlock`. Again,
 * these blocks must be written to word-aligned addresses in memory.
 *
 * ```typescript
 * const data = new Uint32Array([0x1234, 0x5678, 0x9ABC, 0xDEF0]);
 * await mem.writeBlock(0x200000, data);
 *
 * const readData = await mem.readBlock(0x200000, data.length, 0x100);
 * ```
 *
 * ## See also
 *
 * `PreparedMemoryCommand` provides an equivalent API with better performance (in some
 * cases) by enabling batched memory operations.
 */
export declare class Memory {
    private dev;
    constructor(dev: DAP);
    /**
     * Write a 32-bit word to the specified (word-aligned) memory address.
     *
     * @param addr Memory address to write to
     * @param data Data to write (values above 2**32 will be truncated)
     */
    write32(addr: number, data: number): Promise<void>;
    /**
     * Write a 16-bit word to the specified (half word-aligned) memory address.
     *
     * @param addr Memory address to write to
     * @param data Data to write (values above 2**16 will be truncated)
     */
    write16(addr: number, data: number): Promise<void>;
    /**
     * Read a 32-bit word from the specified (word-aligned) memory address.
     *
     * @param addr Memory address to read from.
     */
    read32(addr: number): Promise<number>;
    /**
     * Read a 16-bit word from the specified (half word-aligned) memory address.
     *
     * @param addr Memory address to read from.
     */
    read16(addr: number): Promise<number>;
    /**
     * Reads a block of memory from the specified memory address.
     *
     * @param addr Address to read from
     * @param words Number of words to read
     * @param pageSize Memory page size
     */
    readBlock(addr: number, words: number, pageSize: number): Promise<Uint8Array>;
    /**
     * Write a block of memory to the specified memory address.
     *
     * @param addr Memory address to write to.
     * @param words Array of 32-bit words to write to memory.
     */
    writeBlock(addr: number, words: Uint32Array): Promise<void>;
    prepareCommand(): PreparedMemoryCommand;
    private readBlockCore(addr, words);
    private writeBlockCore(addr, words);
}
