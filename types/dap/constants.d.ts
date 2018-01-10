export declare const enum DapRegisters {
    CSYSPWRUPACK = 2147483648,
    CDBGPWRUPACK = 536870912,
    CSYSPWRUPREQ = 1073741824,
    CDBGPWRUPREQ = 268435456,
    TRNNORMAL = 0,
    MASKLANE = 3840,
}
export declare const enum Csw {
    CSW_SIZE = 7,
    CSW_SIZE8 = 0,
    CSW_SIZE16 = 1,
    CSW_SIZE32 = 2,
    CSW_ADDRINC = 48,
    CSW_NADDRINC = 0,
    CSW_SADDRINC = 16,
    CSW_PADDRINC = 32,
    CSW_DBGSTAT = 64,
    CSW_TINPROG = 128,
    CSW_HPROT = 33554432,
    CSW_MSTRTYPE = 536870912,
    CSW_MSTRCORE = 0,
    CSW_MSTRDBG = 536870912,
    CSW_RESERVED = 16777216,
    CSW_VALUE = 587202640,
}
export declare const enum DapVal {
    AP_ACC = 1,
    DP_ACC = 0,
    READ = 2,
    WRITE = 0,
    VALUE_MATCH = 16,
    MATCH_MASK = 32,
}
export declare const enum Reg {
    DP_0x0 = 0,
    DP_0x4 = 1,
    DP_0x8 = 2,
    DP_0xC = 3,
    AP_0x0 = 4,
    AP_0x4 = 5,
    AP_0x8 = 6,
    AP_0xC = 7,
    IDCODE = 0,
    ABORT = 0,
    CTRL_STAT = 1,
    SELECT = 2,
}
export declare const enum ApReg {
    CSW = 0,
    TAR = 4,
    DRW = 12,
    IDR = 252,
}
