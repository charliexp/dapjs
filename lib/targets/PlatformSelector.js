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
class PlatformSelector {
    constructor() {
        this.deviceCache = new Map();
    }
    lookupDevice(code) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.deviceCache.has(code)) {
                return this.deviceCache.get(code);
            }
            const xhr = new XMLHttpRequest();
            xhr.open("get", `https://os.mbed.com/api/v3/platforms/${code}/`, true);
            xhr.responseType = "json";
            return new Promise((resolve, _reject) => {
                xhr.onload = (_e) => {
                    const device = {
                        name: xhr.response.name,
                        productCode: xhr.response.productcode,
                    };
                    this.deviceCache.set(code, device);
                    resolve(device);
                };
                xhr.send();
            });
        });
    }
}
exports.PlatformSelector = PlatformSelector;

//# sourceMappingURL=PlatformSelector.js.map
