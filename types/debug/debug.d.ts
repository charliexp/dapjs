import { CortexM } from "../cortex/cortex";
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
export declare class Debug {
    private core;
    private breakpoints;
    private availableHWBreakpoints;
    private enabled;
    constructor(core: CortexM);
    init(): Promise<void>;
    /**
     * Enable debugging on the target CPU
     */
    enable(): Promise<void>;
    /**
     * Set breakpoints at specified memory addresses.
     *
     * @param addrs An array of memory addresses at which to set breakpoints.
     */
    setBreakpoint(addr: number): Promise<void>;
    deleteBreakpoint(addr: number): Promise<void>;
    /**
     * Step the processor forward by one instruction.
     */
    step(): Promise<void>;
    /**
     * Set up (and disable) the Flash Patch & Breakpoint unit. It will be enabled when
     * the first breakpoint is set.
     *
     * Also reads the number of available hardware breakpoints.
     */
    private setupFpb();
    /**
     * Enable or disable the Flash Patch and Breakpoint unit (FPB).
     *
     * @param enabled
     */
    private setFpbEnabled(enabled?);
}
