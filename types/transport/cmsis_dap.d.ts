import { IHID } from "./hid";
export declare const enum DapCmd {
    DAP_INFO = 0,
    DAP_LED = 1,
    DAP_CONNECT = 2,
    DAP_DISCONNECT = 3,
    DAP_TRANSFER_CONFIGURE = 4,
    DAP_TRANSFER = 5,
    DAP_TRANSFER_BLOCK = 6,
    DAP_TRANSFER_ABORT = 7,
    DAP_WRITE_ABORT = 8,
    DAP_DELAY = 9,
    DAP_RESET_TARGET = 10,
    DAP_SWJ_PINS = 16,
    DAP_SWJ_CLOCK = 17,
    DAP_SWJ_SEQUENCE = 18,
    DAP_SWD_CONFIGURE = 19,
    DAP_JTAG_SEQUENCE = 20,
    DAP_JTAG_CONFIGURE = 21,
    DAP_JTAG_IDCODE = 22,
    DAP_VENDOR0 = 128,
}
export declare class CMSISDAP {
    private hid;
    constructor(hid: IHID);
    resetTarget(): Promise<Uint8Array>;
    disconnect(): Promise<Uint8Array>;
    cmdNums(op: DapCmd, data: number[]): Promise<Uint8Array>;
    connect(): Promise<void>;
    private jtagToSwd();
    private swjSequence(data);
    private info(id);
    private send(command);
}
