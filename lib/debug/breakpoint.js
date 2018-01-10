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
class HWBreakpoint {
    constructor(regAddr, parent, addr) {
        this.regAddr = regAddr;
        this.parent = parent;
        this.addr = addr;
    }
    set() {
        return __awaiter(this, void 0, void 0, function* () {
            /* set hardware breakpoint */
            const bpMatch = ((this.addr & 0x2) ? 2 : 1) << 30;
            yield this.parent.memory.write32(this.regAddr, this.addr & 0x1ffffffc | bpMatch | 1);
        });
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            /* clear hardware breakpoint */
            yield this.parent.memory.write32(this.regAddr, 0);
        });
    }
}
exports.HWBreakpoint = HWBreakpoint;
class SWBreakpoint {
    constructor(parent, addr) {
        this.parent = parent;
        this.addr = addr;
    }
    set() {
        return __awaiter(this, void 0, void 0, function* () {
            // read the instruction from the CPU...
            this.instruction = yield this.parent.memory.read16(this.addr);
            yield this.parent.memory.write16(this.addr, SWBreakpoint.BKPT_INSTRUCTION);
        });
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            /* clear hardware breakpoint */
            yield this.parent.memory.write16(this.addr, this.instruction);
        });
    }
}
SWBreakpoint.BKPT_INSTRUCTION = 0xbe00;
exports.SWBreakpoint = SWBreakpoint;

//# sourceMappingURL=breakpoint.js.map
