import { ApReg, Reg } from "./constants";
import { PreparedDapCommand } from "./prepared";
import { CMSISDAP } from "../transport/cmsis_dap";
import { IHID } from "../transport/hid";
export declare class DAP {
    private device;
    dap: CMSISDAP;
    private dpSelect;
    private csw;
    constructor(device: IHID);
    reconnect(): Promise<void>;
    init(): Promise<void>;
    writeReg(regId: Reg, val: number): Promise<Uint8Array>;
    readReg(regId: Reg): Promise<number>;
    prepareCommand(): PreparedDapCommand;
    readDp(addr: Reg): Promise<number>;
    readAp(addr: ApReg): Promise<number>;
    writeDp(addr: Reg, data: number): Promise<void> | Promise<Uint8Array>;
    writeAp(addr: ApReg, data: number): Promise<void>;
    close(): Promise<void>;
    readRegRepeat(regId: Reg, cnt: number): Promise<Uint8Array>;
    writeRegRepeat(regId: Reg, data: Uint32Array): Promise<void>;
    private regOp(regId, val);
}
