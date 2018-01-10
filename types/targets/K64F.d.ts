import { IFlashAlgo, IPlatform } from "./platform";
export declare class K64F implements IPlatform {
    flashAlgo: IFlashAlgo;
    constructor();
    overrideSecurityBits(address: number, data: Uint32Array): void;
}
