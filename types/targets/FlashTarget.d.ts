import { CortexM } from "../cortex/cortex";
import { DAP } from "../dap/dap";
import { IPlatform } from "./platform";
import { FlashProgram } from "./FlashProgram";
/**
 * # Flash Target
 *
 * Represents a target device containing a flash region. In rare cases that a
 * target chip only has RAM, uploading a program is as simple as writing a
 * block of data to memory.
 *
 * ## Usage
 *
 * Initialising the `FlashTarget` object is the same as configuring a Cortex-M
 * object, but with an additional parameter for the platform (contains the
 * flashing algorithm and memory layout).
 *
 * ```typescript
 * import {K64F, DAP, FlashTarget} from "dapjs";
 *
 * // make sure hid is an object implementing the `IHID` interface.
 * const dap = new DAP(hid);
 * const device = new FlashTarget(dap, K64F);
 * ```
 *
 * Now, we can do all of the operations you'd expect. As usual, these examples
 * work in a function marked `async`. Alternatively, they can be implemented
 * using Promises directly.
 *
 * ```typescript
 * await device.eraseChip();
 *
 * // flash a hex program
 *
 * ```
 */
export declare class FlashTarget extends CortexM {
    protected platform: IPlatform;
    private inited;
    constructor(device: DAP, platform: IPlatform);
    /**
     * Initialise the flash driver on the chip. Must be called before any of the other
     * flash-related methods.
     */
    flashInit(): Promise<number>;
    /**
     * Erase _all_ data stored in flash on the chip.
     */
    eraseChip(): Promise<number>;
    /**
     * Flash a contiguous block of data to flash at a specified address.
     *
     * @param data Array of 32-bit integers to write to flash.
     * @param address Memory address in flash to write to.
     * @param progressCb Callback to keep track of progress through upload (from 0.0 to 1.0)
     */
    flash(data: Uint32Array, address?: number, progressCb?: (progress: number) => void): Promise<void>;
    /**
     * Upload a program consisting of one or more disjoint sections to flash.
     *
     * @param program Program to be uploaded
     * @param progressCb Callback to receive progress updates (from 0.0 to 1.0)
     */
    program(program: FlashProgram, progressCb: (progress: number) => void): Promise<void>;
    /**
     * Un-init the flash algorithm. Commonly, we use this to ensure that the flashing
     * algorithms are re-uploaded after resets.
     */
    flashUnInit(): void;
}
/**
 * Map of mbed device codes to platform objects. Can be used by applications
 * to dynamically select flashing algorithm based on the devices connected to
 * the computer.
 *
 * > *TODO:* extend the mbed devices API to include data stored here, so that we can
 * > expand to cover all devices without needing to update DAP.js.
 */
export declare let FlashTargets: Map<string, IPlatform>;
