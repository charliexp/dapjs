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
class CMSISDAP {
    // private maxSent = 1;
    constructor(hid) {
        this.hid = hid;
    }
    resetTarget() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.cmdNums(10 /* DAP_RESET_TARGET */, []);
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.cmdNums(3 /* DAP_DISCONNECT */, []);
        });
    }
    cmdNums(op, data) {
        return __awaiter(this, void 0, void 0, function* () {
            data.unshift(op);
            const buf = yield this.send(data);
            if (buf[0] !== op) {
                throw new Error(`Bad response for ${op} -> ${buf[0]}`);
            }
            switch (op) {
                case 2 /* DAP_CONNECT */:
                case 0 /* DAP_INFO */:
                case 5 /* DAP_TRANSFER */:
                case 6 /* DAP_TRANSFER_BLOCK */:
                    break;
                default:
                    if (buf[1] !== 0) {
                        throw new Error(`Bad status for ${op} -> ${buf[1]}`);
                    }
            }
            return buf;
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            const v = yield this.info(254 /* PACKET_COUNT */);
            if (v) {
                // this.maxSent = v as number;
            }
            else {
                throw new Error("DAP_INFO returned invalid packet count.");
            }
            yield this.cmdNums(17 /* DAP_SWJ_CLOCK */, util_1.addInt32(null, 10000000));
            const buf = yield this.cmdNums(2 /* DAP_CONNECT */, [0]);
            if (buf[1] !== 1) {
                throw new Error("SWD mode not enabled.");
            }
            yield this.cmdNums(17 /* DAP_SWJ_CLOCK */, util_1.addInt32(null, 10000000));
            yield this.cmdNums(4 /* DAP_TRANSFER_CONFIGURE */, [0, 0x50, 0, 0, 0]);
            yield this.cmdNums(19 /* DAP_SWD_CONFIGURE */, [0]);
            yield this.jtagToSwd();
        });
    }
    jtagToSwd() {
        return __awaiter(this, void 0, void 0, function* () {
            const arrs = [
                [56, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff],
                [16, 0x9e, 0xe7],
                [56, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff],
                [8, 0x00],
            ];
            for (const arr of arrs) {
                yield this.swjSequence(arr);
            }
        });
    }
    swjSequence(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.cmdNums(18 /* DAP_SWJ_SEQUENCE */, data);
        });
    }
    info(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const buf = yield this.cmdNums(0 /* DAP_INFO */, [id]);
            if (buf[1] === 0) {
                return null;
            }
            switch (id) {
                case 240 /* CAPABILITIES */:
                case 254 /* PACKET_COUNT */:
                case 255 /* PACKET_SIZE */:
                    if (buf[1] === 1) {
                        return buf[2];
                    }
                    else if (buf[1] === 2) {
                        return buf[3] << 8 | buf[2];
                    }
            }
            return buf.subarray(2, buf[1] + 2 - 1); // .toString("utf8")
        });
    }
    send(command) {
        return __awaiter(this, void 0, void 0, function* () {
            const array = Uint8Array.from(command);
            yield this.hid.write(array.buffer);
            const response = yield this.hid.read();
            return new Uint8Array(response.buffer);
        });
    }
}
exports.CMSISDAP = CMSISDAP;

//# sourceMappingURL=cmsis_dap.js.map
