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
const breakpoint_1 = require("./breakpoint");
/**
 * # Debug Interface
 *
 * Keeps track of breakpoints set on the target, as well as deciding whether to
 * use a hardware breakpoint or a software breakpoint.
 *
 * ## Usage
 *
 * ```typescript
 * const dbg = core.debug;
 *
 * await dbg.setBreakpoint(0x123456);
 *
 * // resume the core and wait for the breakpoint
 * await core.resume();
 * await core.waitForHalt();
 *
 * // step forward one instruction
 * await dbg.step();
 *
 * // remove the breakpoint
 * await dbg.deleteBreakpoint(0x123456);
 * ```
 */
class Debug {
    constructor(core) {
        this.core = core;
        this.enabled = false;
        this.availableHWBreakpoints = [];
        this.breakpoints = new Map();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.setupFpb();
        });
    }
    /**
     * Enable debugging on the target CPU
     */
    enable() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.core.memory.write32(3758157296 /* DHCSR */, -1604386816 /* DBGKEY */ | 1 /* C_DEBUGEN */);
        });
    }
    /**
     * Set breakpoints at specified memory addresses.
     *
     * @param addrs An array of memory addresses at which to set breakpoints.
     */
    setBreakpoint(addr) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.breakpoints.has(addr)) {
                // we already have a breakpoint there.
                const breakpoint = this.breakpoints.get(addr);
                if (typeof breakpoint !== "number") {
                    // already enabled
                    // tslint:disable-next-line:no-console
                    console.warn(`Breakpoint at ${addr.toString(16)} already enabled.`);
                    return;
                }
            }
            let bkpt;
            // choose where best to place a breakpoint
            if (addr < 0x20000000) {
                // we can use a HWBreakpoint
                if (this.availableHWBreakpoints.length > 0) {
                    if (!this.enabled) {
                        yield this.setFpbEnabled(true);
                    }
                    const regAddr = this.availableHWBreakpoints.pop();
                    bkpt = new breakpoint_1.HWBreakpoint(regAddr, this.core, addr);
                }
                else {
                    bkpt = new breakpoint_1.SWBreakpoint(this.core, addr);
                }
            }
            else {
                bkpt = new breakpoint_1.SWBreakpoint(this.core, addr);
            }
            yield bkpt.set();
            this.breakpoints.set(addr, bkpt);
        });
    }
    deleteBreakpoint(addr) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.breakpoints.has(addr)) {
                const bkpt = this.breakpoints.get(addr);
                if (typeof bkpt !== "number") {
                    yield bkpt.clear();
                    if (bkpt instanceof breakpoint_1.HWBreakpoint) {
                        // return the register address to the pool
                        this.availableHWBreakpoints.push(bkpt.regAddr);
                    }
                }
                this.breakpoints.delete(addr);
            }
            else {
                // tslint:disable-next-line:no-console
                console.warn(`Breakpoint at ${addr.toString(16)} does not exist.`);
            }
        });
    }
    /**
     * Step the processor forward by one instruction.
     */
    step() {
        return __awaiter(this, void 0, void 0, function* () {
            const dhcsr = yield this.core.memory.read32(3758157296 /* DHCSR */);
            if (!(dhcsr & (4 /* C_STEP */ | 2 /* C_HALT */))) {
                // tslint:disable-next-line:no-console
                console.error("Target is not halted.");
                return;
            }
            const interruptsMasked = (8 /* C_MASKINTS */ & dhcsr) !== 0;
            if (!interruptsMasked) {
                yield this.core.memory.write32(3758157296 /* DHCSR */, -1604386816 /* DBGKEY */ |
                    1 /* C_DEBUGEN */ |
                    2 /* C_HALT */ |
                    8 /* C_MASKINTS */);
            }
            yield this.core.memory.write32(3758157296 /* DHCSR */, -1604386816 /* DBGKEY */ |
                1 /* C_DEBUGEN */ |
                8 /* C_MASKINTS */ |
                4 /* C_STEP */);
            yield this.core.waitForHalt();
            yield this.core.memory.write32(3758157296 /* DHCSR */, -1604386816 /* DBGKEY */ |
                1 /* C_DEBUGEN */ |
                2 /* C_HALT */);
        });
    }
    /**
     * Set up (and disable) the Flash Patch & Breakpoint unit. It will be enabled when
     * the first breakpoint is set.
     *
     * Also reads the number of available hardware breakpoints.
     */
    setupFpb() {
        return __awaiter(this, void 0, void 0, function* () {
            // setup FPB (breakpoint)
            const fpcr = yield this.core.memory.read32(3758104576 /* FP_CTRL */);
            const nbCode = ((fpcr >> 8) & 0x70) | ((fpcr >> 4) & 0xf);
            // const nbLit = (fpcr >> 7) & 0xf;
            // this.totalHWBreakpoints = nbCode;
            yield this.setFpbEnabled(false);
            for (let i = 0; i < nbCode; i++) {
                this.availableHWBreakpoints.push(3758104584 /* FP_COMP0 */ + (4 * i));
                yield this.core.memory.write32(3758104584 /* FP_COMP0 */ + (i * 4), 0);
            }
        });
    }
    /**
     * Enable or disable the Flash Patch and Breakpoint unit (FPB).
     *
     * @param enabled
     */
    setFpbEnabled(enabled = true) {
        return __awaiter(this, void 0, void 0, function* () {
            this.enabled = enabled;
            yield this.core.memory.write32(3758104576 /* FP_CTRL */, 2 /* FP_CTRL_KEY */ | (enabled ? 1 : 0));
        });
    }
}
exports.Debug = Debug;

//# sourceMappingURL=debug.js.map
