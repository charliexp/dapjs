import { CortexM } from "../cortex/cortex";
export interface IBreakpoint {
    set(): Promise<void>;
    clear(): Promise<void>;
}
export declare type DisabledBreakpoint = number;
export declare class HWBreakpoint implements IBreakpoint {
    readonly regAddr: number;
    private readonly parent;
    readonly addr: number;
    constructor(regAddr: number, parent: CortexM, addr: number);
    set(): Promise<void>;
    clear(): Promise<void>;
}
export declare class SWBreakpoint implements IBreakpoint {
    private readonly parent;
    readonly addr: number;
    private static BKPT_INSTRUCTION;
    private instruction;
    constructor(parent: CortexM, addr: number);
    set(): Promise<void>;
    clear(): Promise<void>;
}
