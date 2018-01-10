import { ApReg, Reg } from "./constants";
import { CMSISDAP } from "../transport/cmsis_dap";
/**
 * # Prepared DAP Command
 *
 * Batches together multiple Debug Access Port (DAP) commands into one (or more)
 * CMSIS-DAP Transfers that can be written together to improve link utilisation.
 *
 * > **NOTE:** this will not normally need to be used by applications or libraries
 * > depending on DAP.js.
 *
 * ## Architecture
 *
 * - `PreparedDapCommand` keeps a list of CMSIS-DAP `Transfer` commands.
 * - Every time an action is scheduled (writing to or reading from a DP or AP register),
 * we check to see if there is any remaining room in the current batch, starting a new
 * batch if none is available.
 * - When `go` is called, the batches are executed sequentially (so DAP commands are
 * executed in the order they were added).
 *
 * ### Reading Values
 *
 * Writing values to registers is relatively straight forward, however mixing register
 * reads and writes together requires us to keep track of how many commands in
 * each batch are read commands.
 *
 * Once data has successfully been read back from the target, the values read are assembled
 * into an array, and returned in the order they requested. This allows `PreparedDapCommand`s
 * to be used higher up the stack in places where multiple independent read operations take
 * place sequentially.
 *
 * ### Constructing CMSIS-DAP Commands
 *
 * We keep track of the number of commands in each batch, so that we can fill in the command
 * count field of the `DAP_Transfer`.
 */
export declare class PreparedDapCommand {
    private dap;
    private commands;
    private readCounts;
    private currentCommand;
    private commandCounts;
    private dpSelect;
    private csw;
    constructor(dap: CMSISDAP);
    /**
     * Schedule a value to be written to an AP or DP register.
     *
     * @param regId register ID to be written to
     * @param value value to be written
     */
    writeReg(regId: Reg, value: number): void;
    /**
     * Schedule a value to be read from an AP or DP register.
     * @param regId register to read from
     */
    readReg(regId: Reg): void;
    /**
     * Schedule multiple values to be written to the same register.
     *
     * **TODO:** figure out dynamically whether it's better to use DAP_TransferBlock vs
     * DAP_Transfer. We should be able to fill up the remaining space in a Transfer
     * and then start a TransferBlock _if_ we can fit in _13 or more_ values into the
     * TransferBlock. However, the gains from this are marginal unless we're using much
     * larger packet sizes than 64 bytes.
     *
     * @param regId register to write to repeatedly
     * @param data array of 32-bit values to be written
     */
    writeRegRepeat(regId: Reg, data: Uint32Array): void;
    /**
     * Asynchronously execute the commands scheduled.
     */
    go(): Promise<number[]>;
    /**
     * Schedule a value to be written to a DP register
     *
     * @param addr Address to write to
     * @param data Data to be written
     */
    writeDp(addr: Reg, data: number): void | Promise<void>;
    /**
     * Schedule a value to be written to an AP register
     *
     * @param addr Address to write to
     * @param data Data to be written
     */
    writeAp(addr: ApReg, data: number): Promise<void>;
    /**
     * Schedule a DP register to read from
     *
     * @param addr Address to read from
     */
    readDp(addr: Reg): void;
    /**
     * Schedule an AP register to read from
     *
     * @param addr Address to read from
     */
    readAp(addr: ApReg): void;
}
