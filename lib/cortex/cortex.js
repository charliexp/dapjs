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
const debug_1 = require("../debug/debug");
const memory_1 = require("../memory/memory");
const prepared_1 = require("../memory/prepared");
const util_1 = require("../util");
const constants_1 = require("./constants");
const prepared_2 = require("./prepared");
/**
 * # Cortex M
 *
 * Manages access to a CPU core, and its associated memory and debug functionality.
 *
 * > **NOTE:** all of the methods that involve interaction with the CPU core
 * > are asynchronous, so must be `await`ed, or explicitly handled as a Promise.
 *
 * ## Usage
 *
 * First, let's create an instance of `CortexM`, using an associated _Debug Access
 * Port_ (DAP) instance that we created earlier.
 *
 * ```typescript
 * const core = new CortexM(dap);
 * ```
 *
 * Now, we can halt and resume the core just like this:
 *
 * > **NOTE:** If you're not using ES2017, you can replace the use of `async` and
 * > `await` with direct use of Promises. These examples also need to be run within
 * > an `async` function for `async` to be used.
 *
 * ```typescript
 * await core.halt();
 * await core.resume();
 * ```
 *
 * Resetting the core is just as easy:
 *
 * ```typescript
 * await core.reset();
 * ```
 *
 * You can even halt immediately after reset:
 *
 * ```typescript
 * await core.reset(true);
 * ```
 *
 * We can also read and write 32-bit values to/from core registers:
 *
 * ```typescript
 * const sp = await core.readCoreRegister(CortexReg.SP);
 *
 * await core.writeCoreRegister(CortexReg.R0, 0x1000);
 * await core.writeCoreRegister(CortexReg.PC, 0x1234);
 * ```
 *
 * ### See also
 *
 * For details on debugging and memory features, see the documentation for
 * `Debug` and `Memory`.
 */
class CortexM {
    constructor(device) {
        this.dev = device;
        this.memory = new memory_1.Memory(device);
        this.debug = new debug_1.Debug(this);
    }
    /**
     * Initialise the debug access port on the device, and read the device type.
     */
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.dev.init();
            // FIXME: don't run this if security is enabled on the K64F
            yield this.debug.init();
            yield this.readCoreType();
        });
    }
    /**
     * Read the current state of the CPU.
     *
     * @returns A member of the `CoreState` enum corresponding to the current status of the CPU.
     */
    getState() {
        return __awaiter(this, void 0, void 0, function* () {
            const dhcsr = yield this.memory.read32(3758157296 /* DHCSR */);
            if (dhcsr & 33554432 /* S_RESET_ST */) {
                const newDHCSR = yield this.memory.read32(3758157296 /* DHCSR */);
                if (newDHCSR & 33554432 /* S_RESET_ST */ && !(newDHCSR & 16777216 /* S_RETIRE_ST */)) {
                    return 0 /* TARGET_RESET */;
                }
            }
            if (dhcsr & 524288 /* S_LOCKUP */) {
                return 1 /* TARGET_LOCKUP */;
            }
            else if (dhcsr & 262144 /* S_SLEEP */) {
                return 2 /* TARGET_SLEEPING */;
            }
            else if (dhcsr & 131072 /* S_HALT */) {
                return 3 /* TARGET_HALTED */;
            }
            else {
                return 4 /* TARGET_RUNNING */;
            }
        });
    }
    /**
     * Read the CPUID register from the CPU, and interpret its meaning in terms of implementer,
     * architecture and core type.
     */
    readCoreType() {
        return __awaiter(this, void 0, void 0, function* () {
            const cpuid = yield this.memory.read32(3758157056 /* CPUID */);
            const implementer = ((cpuid & constants_1.CPUID_IMPLEMENTER_MASK) >> constants_1.CPUID_IMPLEMENTER_POS);
            const arch = ((cpuid & constants_1.CPUID_ARCHITECTURE_MASK) >> constants_1.CPUID_ARCHITECTURE_POS);
            const coreType = ((cpuid & constants_1.CPUID_PARTNO_MASK) >> constants_1.CPUID_PARTNO_POS);
            return [implementer, arch, coreType];
        });
    }
    prepareCommand() {
        return new prepared_2.PreparedCortexMCommand(this.dev);
    }
    /**
     * Read a core register from the CPU (e.g. r0...r15, pc, sp, lr, s0...)
     *
     * @param no Member of the `CortexReg` enum - an ARM Cortex CPU general-purpose register.
     */
    readCoreRegister(no) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.memory.write32(3758157300 /* DCRSR */, no);
            const v = yield this.memory.read32(3758157296 /* DHCSR */);
            util_1.assert(v & 65536 /* S_REGRDY */);
            return yield this.memory.read32(3758157304 /* DCRDR */);
        });
    }
    /**
     * Write a 32-bit word to the specified CPU general-purpose register.
     *
     * @param no Member of the `CortexReg` enum - an ARM Cortex CPU general-purpose register.
     * @param val Value to be written.
     */
    writeCoreRegister(no, val) {
        return __awaiter(this, void 0, void 0, function* () {
            const prep = new prepared_1.PreparedMemoryCommand(this.dev);
            prep.write32(3758157304 /* DCRDR */, val);
            prep.write32(3758157300 /* DCRSR */, no | 65536 /* DCRSR_REGWnR */);
            prep.read32(3758157296 /* DHCSR */);
            const v = (yield prep.go())[0];
            util_1.assert(v & 65536 /* S_REGRDY */);
        });
    }
    /**
     * Halt the CPU core.
     */
    halt() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.memory.write32(3758157296 /* DHCSR */, -1604386816 /* DBGKEY */ | 1 /* C_DEBUGEN */ | 2 /* C_HALT */);
        });
    }
    /**
     * Resume the CPU core.
     */
    resume() {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.isHalted()) {
                yield this.memory.write32(3758157104 /* DFSR */, 4 /* DFSR_DWTTRAP */ | 2 /* DFSR_BKPT */ | 1 /* DFSR_HALTED */);
                yield this.debug.enable();
            }
        });
    }
    /**
     * Find out whether the CPU is halted.
     */
    isHalted() {
        return __awaiter(this, void 0, void 0, function* () {
            const s = yield this.status();
            return s.isHalted;
        });
    }
    /**
     * Read the current status of the CPU.
     *
     * @returns Object containing the contents of the `DHCSR` register, the `DFSR` register, and a boolean value
     * stating the current halted state of the CPU.
     */
    status() {
        return __awaiter(this, void 0, void 0, function* () {
            const prep = new prepared_1.PreparedMemoryCommand(this.dev);
            prep.read32(3758157296 /* DHCSR */);
            prep.read32(3758157104 /* DFSR */);
            const results = yield prep.go();
            const dhcsr = results[0];
            const dfsr = results[1];
            return {
                dfsr,
                dhscr: dhcsr,
                isHalted: !!(dhcsr & 131072 /* S_HALT */),
            };
        });
    }
    /**
     * Reset the CPU core. This currently does a software reset - it is also technically possible to perform a 'hard'
     * reset using the reset pin from the debugger.
     */
    reset(halt = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (halt) {
                yield this.halt();
                // VC_CORERESET causes the core to halt on reset.
                const demcr = yield this.memory.read32(3758157308 /* DEMCR */);
                yield this.memory.write32(3758157308 /* DEMCR */, demcr | 1 /* DEMCR_VC_CORERESET */);
                yield this.softwareReset();
                yield this.waitForHalt();
                // Unset the VC_CORERESET bit
                yield this.memory.write32(3758157308 /* DEMCR */, demcr);
            }
            else {
                yield this.softwareReset();
            }
        });
    }
    /**
     * Run specified machine code natively on the device. Assumes usual C calling conventions
     * - returns the value of r0 once the program has terminated. The program _must_ terminate
     * in order for this function to return. This can be achieved by placing a `bkpt`
     * instruction at the end of the function.
     *
     * @param code array containing the machine code (32-bit words).
     * @param address memory address at which to place the code.
     * @param pc initial value of the program counter.
     * @param lr initial value of the link register.
     * @param sp initial value of the stack pointer.
     * @param upload should we upload the code before running it.
     * @param args set registers r0...rn before running code
     *
     * @returns A promise for the value of r0 on completion of the function call.
     */
    runCode(code, address, pc, lr, sp, upload, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            // await this.halt();
            const cmd = this.prepareCommand();
            cmd.halt();
            // Point the program counter to the start of the program
            cmd.writeCoreRegister(15 /* PC */, pc);
            cmd.writeCoreRegister(14 /* LR */, lr);
            cmd.writeCoreRegister(13 /* SP */, sp);
            for (let i = 0; i < args.length; i++) {
                cmd.writeCoreRegister(i, args[i]);
            }
            yield cmd.go();
            // Write the program to memory at the specified address
            if (upload) {
                yield this.memory.writeBlock(address, code);
            }
            // Run the program and wait for halt
            yield this.resume();
            yield this.waitForHalt(constants_1.DEFAULT_RUNCODE_TIMEOUT); // timeout after 10s
            return yield this.readCoreRegister(0 /* R0 */);
        });
    }
    /**
     * Spin until the chip has halted.
     */
    waitForHalt(timeout = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let running = true;
                if (timeout > 0) {
                    setTimeout(() => {
                        reject("waitForHalt timed out.");
                        running = false;
                    }, timeout);
                }
                while (running && !(yield this.isHalted())) {
                    /* empty */
                }
                if (running) {
                    resolve();
                }
            }));
        });
    }
    softwareReset() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.memory.write32(3758157068 /* NVIC_AIRCR */, 100270080 /* NVIC_AIRCR_VECTKEY */ | 4 /* NVIC_AIRCR_SYSRESETREQ */);
            // wait for the system to come out of reset
            let dhcsr = yield this.memory.read32(3758157296 /* DHCSR */);
            while ((dhcsr & 33554432 /* S_RESET_ST */) !== 0) {
                dhcsr = yield this.memory.read32(3758157296 /* DHCSR */);
            }
        });
    }
}
exports.CortexM = CortexM;

//# sourceMappingURL=cortex.js.map
