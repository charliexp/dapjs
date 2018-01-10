import { DAP } from "../dap/dap";
import { Debug } from "../debug/debug";
import { Memory } from "../memory/memory";
import { CoreState, CoreType, CortexReg, CPUIDImplementer, ISA } from "./constants";
import { PreparedCortexMCommand } from "./prepared";
/**
 * # Cortex M
 *
 * Manages access to a CPU core, and its associated memory and debug functionality.
 *
 * > **NOTE:** all of the methods that involve interaction with the CPU core
 * > are asynchronous, so must be `await`ed, or explicitly handled as a Promise.
 *
 * ## Usage
 *
 * First, let's create an instance of `CortexM`, using an associated _Debug Access
 * Port_ (DAP) instance that we created earlier.
 *
 * ```typescript
 * const core = new CortexM(dap);
 * ```
 *
 * Now, we can halt and resume the core just like this:
 *
 * > **NOTE:** If you're not using ES2017, you can replace the use of `async` and
 * > `await` with direct use of Promises. These examples also need to be run within
 * > an `async` function for `async` to be used.
 *
 * ```typescript
 * await core.halt();
 * await core.resume();
 * ```
 *
 * Resetting the core is just as easy:
 *
 * ```typescript
 * await core.reset();
 * ```
 *
 * You can even halt immediately after reset:
 *
 * ```typescript
 * await core.reset(true);
 * ```
 *
 * We can also read and write 32-bit values to/from core registers:
 *
 * ```typescript
 * const sp = await core.readCoreRegister(CortexReg.SP);
 *
 * await core.writeCoreRegister(CortexReg.R0, 0x1000);
 * await core.writeCoreRegister(CortexReg.PC, 0x1234);
 * ```
 *
 * ### See also
 *
 * For details on debugging and memory features, see the documentation for
 * `Debug` and `Memory`.
 */
export declare class CortexM {
    /**
     * Read and write to on-chip memory associated with this CPU core.
     */
    readonly memory: Memory;
    /**
     * Control the CPU's debugging features.
     */
    readonly debug: Debug;
    /**
     * Underlying Debug Access Port (DAP).
     */
    private dev;
    constructor(device: DAP);
    /**
     * Initialise the debug access port on the device, and read the device type.
     */
    init(): Promise<void>;
    /**
     * Read the current state of the CPU.
     *
     * @returns A member of the `CoreState` enum corresponding to the current status of the CPU.
     */
    getState(): Promise<CoreState>;
    /**
     * Read the CPUID register from the CPU, and interpret its meaning in terms of implementer,
     * architecture and core type.
     */
    readCoreType(): Promise<[CPUIDImplementer, ISA, CoreType]>;
    prepareCommand(): PreparedCortexMCommand;
    /**
     * Read a core register from the CPU (e.g. r0...r15, pc, sp, lr, s0...)
     *
     * @param no Member of the `CortexReg` enum - an ARM Cortex CPU general-purpose register.
     */
    readCoreRegister(no: CortexReg): Promise<number>;
    /**
     * Write a 32-bit word to the specified CPU general-purpose register.
     *
     * @param no Member of the `CortexReg` enum - an ARM Cortex CPU general-purpose register.
     * @param val Value to be written.
     */
    writeCoreRegister(no: CortexReg, val: number): Promise<void>;
    /**
     * Halt the CPU core.
     */
    halt(): Promise<void>;
    /**
     * Resume the CPU core.
     */
    resume(): Promise<void>;
    /**
     * Find out whether the CPU is halted.
     */
    isHalted(): Promise<boolean>;
    /**
     * Read the current status of the CPU.
     *
     * @returns Object containing the contents of the `DHCSR` register, the `DFSR` register, and a boolean value
     * stating the current halted state of the CPU.
     */
    status(): Promise<{
        dfsr: number;
        dhscr: number;
        isHalted: boolean;
    }>;
    /**
     * Reset the CPU core. This currently does a software reset - it is also technically possible to perform a 'hard'
     * reset using the reset pin from the debugger.
     */
    reset(halt?: boolean): Promise<void>;
    /**
     * Run specified machine code natively on the device. Assumes usual C calling conventions
     * - returns the value of r0 once the program has terminated. The program _must_ terminate
     * in order for this function to return. This can be achieved by placing a `bkpt`
     * instruction at the end of the function.
     *
     * @param code array containing the machine code (32-bit words).
     * @param address memory address at which to place the code.
     * @param pc initial value of the program counter.
     * @param lr initial value of the link register.
     * @param sp initial value of the stack pointer.
     * @param upload should we upload the code before running it.
     * @param args set registers r0...rn before running code
     *
     * @returns A promise for the value of r0 on completion of the function call.
     */
    runCode(code: Uint32Array, address: number, pc: number, lr: number, sp: number, upload: boolean, ...args: number[]): Promise<number>;
    /**
     * Spin until the chip has halted.
     */
    waitForHalt(timeout?: number): Promise<void>;
    private softwareReset();
}
