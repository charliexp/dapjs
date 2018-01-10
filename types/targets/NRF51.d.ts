import { IFlashAlgo, IPlatform } from "./platform";
export declare class NRF51 implements IPlatform {
    flashAlgo: IFlashAlgo;
    constructor();
    overrideSecurityBits(_address: number, _data: Uint32Array): void;
}
