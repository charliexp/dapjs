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
const prepared_1 = require("./prepared");
const cmsis_dap_1 = require("../transport/cmsis_dap");
const util_1 = require("../util");
class DAP {
    // private idcode: number;
    constructor(device) {
        this.device = device;
        this.dap = new cmsis_dap_1.CMSISDAP(device);
    }
    reconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.dap.disconnect();
            yield util_1.delay(100);
            yield this.init();
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.dap.connect();
            yield this.readDp(0 /* IDCODE */);
            // const n = await this.readDp(Reg.IDCODE);
            // this.idcode = n;
            let prep = this.prepareCommand();
            prep.writeReg(0 /* DP_0x0 */, 1 << 2); // clear sticky error
            prep.writeDp(2 /* SELECT */, 0);
            prep.writeDp(1 /* CTRL_STAT */, 1073741824 /* CSYSPWRUPREQ */ | 268435456 /* CDBGPWRUPREQ */);
            const m = 536870912 /* CDBGPWRUPACK */ | 2147483648 /* CSYSPWRUPACK */;
            prep.readDp(1 /* CTRL_STAT */);
            let v = (yield prep.go())[0];
            while ((v & m) !== m) {
                v = yield this.readDp(1 /* CTRL_STAT */);
            }
            prep = this.prepareCommand();
            prep.writeDp(1 /* CTRL_STAT */, (1073741824 /* CSYSPWRUPREQ */ |
                268435456 /* CDBGPWRUPREQ */ |
                0 /* TRNNORMAL */ |
                3840 /* MASKLANE */));
            prep.writeDp(2 /* SELECT */, 0);
            prep.readAp(252 /* IDR */);
            yield prep.go();
        });
    }
    writeReg(regId, val) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.regOp(regId, val);
        });
    }
    readReg(regId) {
        return __awaiter(this, void 0, void 0, function* () {
            const buf = yield this.regOp(regId, null);
            const v = util_1.readUInt32LE(buf, 3);
            return v;
        });
    }
    prepareCommand() {
        return new prepared_1.PreparedDapCommand(this.dap);
    }
    readDp(addr) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.readReg(addr);
        });
    }
    readAp(addr) {
        return __awaiter(this, void 0, void 0, function* () {
            const prep = this.prepareCommand();
            prep.writeDp(2 /* SELECT */, util_1.bank(addr));
            prep.readReg(util_1.apReg(addr, 2 /* READ */));
            return (yield prep.go())[0];
        });
    }
    writeDp(addr, data) {
        if (addr === 2 /* SELECT */) {
            if (data === this.dpSelect) {
                return Promise.resolve();
            }
            this.dpSelect = data;
        }
        return this.writeReg(addr, data);
    }
    writeAp(addr, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (addr === 0 /* CSW */) {
                if (data === this.csw) {
                    return Promise.resolve();
                }
                this.csw = data;
            }
            const prep = this.prepareCommand();
            prep.writeDp(2 /* SELECT */, util_1.bank(addr));
            prep.writeReg(util_1.apReg(addr, 0 /* WRITE */), data);
            yield prep.go();
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.device.close();
        });
    }
    readRegRepeat(regId, cnt) {
        return __awaiter(this, void 0, void 0, function* () {
            util_1.assert(cnt <= 15);
            const request = util_1.regRequest(regId);
            const sendargs = [0, cnt];
            for (let i = 0; i < cnt; ++i) {
                sendargs.push(request);
            }
            const buf = yield this.dap.cmdNums(5 /* DAP_TRANSFER */, sendargs);
            if (buf[1] !== cnt) {
                throw new Error(("(many) Bad #trans " + buf[1]));
            }
            else if (buf[2] !== 1) {
                throw new Error(("(many) Bad transfer status " + buf[2]));
            }
            return buf.subarray(3, 3 + cnt * 4);
        });
    }
    writeRegRepeat(regId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const remainingLength = 64 - 1 - 1 - 2 - 1; // 14
            util_1.assert(data.length <= remainingLength / 4);
            /*
                BYTE | BYTE *****| SHORT**********| BYTE *************| WORD *********|
              > 0x06 | DAP Index | Transfer Count | Transfer Request  | Transfer Data |
                     |***********|****************|*******************|+++++++++++++++|
            */
            const request = util_1.regRequest(regId, true);
            const sendargs = [0, data.length, 0, request];
            data.forEach(d => {
                // separate d into bytes
                util_1.addInt32(sendargs, d);
            });
            const buf = yield this.dap.cmdNums(6 /* DAP_TRANSFER_BLOCK */, sendargs);
            if (buf[3] !== 1) {
                throw new Error(("(many-wr) Bad transfer status " + buf[2]));
            }
        });
    }
    regOp(regId, val) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = util_1.regRequest(regId, val !== null);
            const sendargs = [0, 1, request];
            if (val !== null) {
                util_1.addInt32(sendargs, val);
            }
            const buf = yield this.dap.cmdNums(5 /* DAP_TRANSFER */, sendargs);
            if (buf[1] !== 1) {
                throw new Error(("Bad #trans " + buf[1]));
            }
            else if (buf[2] !== 1) {
                if (buf[2] === 2) {
                    throw new Error(("Transfer wait"));
                }
                throw new Error(("Bad transfer status " + buf[2]));
            }
            return buf;
        });
    }
}
exports.DAP = DAP;

//# sourceMappingURL=dap.js.map
