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
function bufferExtend(source, length) {
    const sarr = new Uint8Array(source);
    const dest = new ArrayBuffer(length);
    const darr = new Uint8Array(dest);
    for (let i = 0; i < Math.min(source.byteLength, length); i++) {
        darr[i] = sarr[i];
    }
    return dest;
}
class HID {
    constructor(device) {
        this.device = device;
    }
    open() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.device.open();
            yield this.device.selectConfiguration(1);
            const hids = this.device.configuration.interfaces.filter(intf => intf.alternates[0].interfaceClass === 0xFF);
            if (hids.length === 0) {
                throw new Error("No HID interfaces found.");
            }
            this.interfaces = hids;
            if (this.interfaces.length === 1) {
                this.interface = this.interfaces[0];
            }
            yield this.device.claimInterface(this.interface.interfaceNumber);
            this.endpoints = this.interface.alternates[0].endpoints;
            this.epIn = null;
            this.epOut = null;
            for (const endpoint of this.endpoints) {
                if (endpoint.direction === "in") {
                    this.epIn = endpoint;
                }
                else {
                    this.epOut = endpoint;
                }
            }
            if (this.epIn === null || this.epOut === null) {
                // tslint:disable-next-line:no-console
                console.log("Unable to find an in and an out endpoint.");
            }
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.device.close();
        });
    }
    write(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const reportSize = this.epOut.packetSize;
            const buffer = bufferExtend(data, reportSize);
            return this.device.transferOut(this.epOut.endpointNumber, buffer);
        });
    }
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            const reportSize = this.epIn.packetSize;
            return this.device.transferIn(this.epIn.endpointNumber, reportSize)
                .then(res => res.data);
        });
    }
}
exports.HID = HID;

//# sourceMappingURL=hid.js.map
