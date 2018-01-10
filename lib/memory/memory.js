"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../util");
const prepared_1 = require("./prepared");
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
class Memory {
    constructor(dev) {
        this.dev = dev;
    }
    /**
     * Write a 32-bit word to the specified (word-aligned) memory address.
     *
     * @param addr Memory address to write to
     * @param data Data to write (values above 2**32 will be truncated)
     */
    write32(addr, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const prep = this.dev.prepareCommand();
            prep.writeAp(0 /* CSW */, 587202640 /* CSW_VALUE */ | 2 /* CSW_SIZE32 */);
            prep.writeAp(4 /* TAR */, addr);
            prep.writeAp(12 /* DRW */, data);
            yield prep.go();
        });
    }
    /**
     * Write a 16-bit word to the specified (half word-aligned) memory address.
     *
     * @param addr Memory address to write to
     * @param data Data to write (values above 2**16 will be truncated)
     */
    write16(addr, data) {
        return __awaiter(this, void 0, void 0, function* () {
            data = data << ((addr & 0x02) << 3);
            const prep = this.dev.prepareCommand();
            prep.writeAp(0 /* CSW */, 587202640 /* CSW_VALUE */ | 1 /* CSW_SIZE16 */);
            prep.writeAp(4 /* TAR */, addr);
            prep.writeAp(12 /* DRW */, data);
            yield prep.go();
        });
    }
    /**
     * Read a 32-bit word from the specified (word-aligned) memory address.
     *
     * @param addr Memory address to read from.
     */
    read32(addr) {
        return __awaiter(this, void 0, void 0, function* () {
            const prep = this.dev.prepareCommand();
            prep.writeAp(0 /* CSW */, 587202640 /* CSW_VALUE */ | 2 /* CSW_SIZE32 */);
            prep.writeAp(4 /* TAR */, addr);
            prep.readAp(12 /* DRW */);
            try {
                return (yield prep.go())[0];
            }
            catch (e) {
                // transfer wait, try again.
                yield util_1.delay(100);
                return yield this.read32(addr);
            }
        });
    }
    /**
     * Read a 16-bit word from the specified (half word-aligned) memory address.
     *
     * @param addr Memory address to read from.
     */
    read16(addr) {
        return __awaiter(this, void 0, void 0, function* () {
            const prep = this.dev.prepareCommand();
            prep.writeAp(0 /* CSW */, 587202640 /* CSW_VALUE */ | 1 /* CSW_SIZE16 */);
            prep.writeAp(4 /* TAR */, addr);
            prep.readAp(12 /* DRW */);
            let val;
            try {
                val = (yield prep.go())[0];
            }
            catch (e) {
                // transfer wait, try again.
                yield util_1.delay(100);
                val = yield this.read16(addr);
            }
            val = (val >> ((addr & 0x02) << 3) & 0xffff);
            return val;
        });
    }
    /**
     * Reads a block of memory from the specified memory address.
     *
     * @param addr Address to read from
     * @param words Number of words to read
     * @param pageSize Memory page size
     */
    readBlock(addr, words, pageSize) {
        return __awaiter(this, void 0, void 0, function* () {
            const funs = [() => __awaiter(this, void 0, void 0, function* () { return Promise.resolve(); })];
            const bufs = [];
            const end = addr + words * 4;
            let ptr = addr;
            while (ptr < end) {
                let nextptr = ptr + pageSize;
                if (ptr === addr) {
                    nextptr &= ~(pageSize - 1);
                }
                const len = Math.min(nextptr - ptr, end - ptr);
                const ptr0 = ptr;
                util_1.assert((len & 3) === 0);
                funs.push(() => __awaiter(this, void 0, void 0, function* () {
                    bufs.push(yield this.readBlockCore(ptr0, len >> 2));
                }));
                ptr = nextptr;
            }
            for (const f of funs) {
                yield f();
            }
            const result = yield util_1.bufferConcat(bufs);
            return result.subarray(0, words * 4);
        });
    }
    /**
     * Write a block of memory to the specified memory address.
     *
     * @param addr Memory address to write to.
     * @param words Array of 32-bit words to write to memory.
     */
    writeBlock(addr, words) {
        return __awaiter(this, void 0, void 0, function* () {
            if (words.length === 0) {
                return;
            }
            return this.writeBlockCore(addr, words);
        });
    }
    prepareCommand() {
        return new prepared_1.PreparedMemoryCommand(this.dev);
    }
    readBlockCore(addr, words) {
        return __awaiter(this, void 0, void 0, function* () {
            const prep = this.dev.prepareCommand();
            prep.writeAp(0 /* CSW */, 587202640 /* CSW_VALUE */ | 2 /* CSW_SIZE32 */);
            prep.writeAp(4 /* TAR */, addr);
            yield prep.go();
            let lastSize = words % 15;
            if (lastSize === 0) {
                lastSize = 15;
            }
            const blocks = [];
            for (let i = 0; i < Math.ceil(words / 15); i++) {
                const b = yield this.dev.readRegRepeat(util_1.apReg(12 /* DRW */, 2 /* READ */), i === blocks.length - 1 ? lastSize : 15);
                blocks.push(b);
            }
            return util_1.bufferConcat(blocks);
        });
    }
    writeBlockCore(addr, words) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const blSz = 14;
                const reg = util_1.apReg(12 /* DRW */, 0 /* WRITE */);
                const prep = this.dev.prepareCommand();
                prep.writeAp(0 /* CSW */, 587202640 /* CSW_VALUE */ | 2 /* CSW_SIZE32 */);
                prep.writeAp(4 /* TAR */, addr);
                for (let i = 0; i < Math.ceil(words.length / blSz); i++) {
                    prep.writeRegRepeat(reg, words.subarray(i * blSz, i * blSz + blSz));
                }
                yield prep.go();
            }
            catch (e) {
                if (e.dapWait) {
                    yield util_1.delay(100);
                    return yield this.writeBlockCore(addr, words);
                }
                else {
                    throw e;
                }
            }
        });
    }
}
exports.Memory = Memory;

//# sourceMappingURL=memory.js.map
