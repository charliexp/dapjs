export declare const DEFAULT_RUNCODE_TIMEOUT = 10000;
export declare const enum CortexSpecialReg {
    DFSR = 3758157104,
    DFSR_EXTERNAL = 16,
    DFSR_VCATCH = 8,
    DFSR_DWTTRAP = 4,
    DFSR_BKPT = 2,
    DFSR_HALTED = 1,
    DEMCR = 3758157308,
    DEMCR_TRCENA = 16777216,
    DEMCR_VC_HARDERR = 1024,
    DEMCR_VC_BUSERR = 256,
    DEMCR_VC_CORERESET = 1,
    CPUID = 3758157056,
    DCRSR = 3758157300,
    DCRSR_REGWnR = 65536,
    DCRSR_REGSEL = 31,
    DHCSR = 3758157296,
    C_DEBUGEN = 1,
    C_HALT = 2,
    C_STEP = 4,
    C_MASKINTS = 8,
    C_SNAPSTALL = 32,
    S_REGRDY = 65536,
    S_HALT = 131072,
    S_SLEEP = 262144,
    S_LOCKUP = 524288,
    S_RETIRE_ST = 16777216,
    S_RESET_ST = 33554432,
    DCRDR = 3758157304,
    CPACR = 3758157192,
    CPACR_CP10_CP11_MASK = 15728640,
    NVIC_AIRCR = 3758157068,
    NVIC_AIRCR_VECTKEY = 100270080,
    NVIC_AIRCR_VECTRESET = 1,
    NVIC_AIRCR_SYSRESETREQ = 4,
    DBGKEY = -1604386816,
    FP_CTRL = 3758104576,
    FP_CTRL_KEY = 2,
    FP_COMP0 = 3758104584,
    DWT_CTRL = 3758100480,
    DWT_COMP_BASE = 3758100512,
    DWT_MASK_OFFSET = 4,
    DWT_FUNCTION_OFFSET = 8,
    DWT_COMP_BLOCK_SIZE = 16,
}
export declare const CPUID_IMPLEMENTER_MASK = 4278190080;
export declare const CPUID_IMPLEMENTER_POS = 24;
export declare const CPUID_VARIANT_MASK = 15728640;
export declare const CPUID_VARIANT_POS = 20;
export declare const CPUID_ARCHITECTURE_MASK = 983040;
export declare const CPUID_ARCHITECTURE_POS = 16;
export declare const CPUID_PARTNO_MASK = 65520;
export declare const CPUID_PARTNO_POS = 4;
export declare const CPUID_REVISION_MASK = 15;
export declare const CPUID_REVISION_POS = 0;
export declare const enum CPUIDImplementer {
    CPUID_IMPLEMENTER_ARM = 65,
}
export declare const enum ISA {
    ARMv6M = 12,
    ARMv7M = 15,
}
export declare const ISANames: Map<ISA, string>;
export declare const enum CoreType {
    CortexM0 = 3104,
    CortexM1 = 3105,
    CortexM3 = 3107,
    CortexM4 = 3108,
    CortexM0p = 3168,
}
export declare const CoreNames: Map<CoreType, string>;
export declare const enum CortexReg {
    R0 = 0,
    R1 = 1,
    R2 = 2,
    R3 = 3,
    R4 = 4,
    R5 = 5,
    R6 = 6,
    R7 = 7,
    R8 = 8,
    R9 = 9,
    R10 = 10,
    R11 = 11,
    R12 = 12,
    SP = 13,
    LR = 14,
    PC = 15,
    XPSR = 16,
    MSP = 17,
    PSP = 18,
    PRIMASK = 20,
    CONTROL = 20,
}
export declare const enum CoreState {
    TARGET_RESET = 0,
    TARGET_LOCKUP = 1,
    TARGET_SLEEPING = 2,
    TARGET_HALTED = 3,
    TARGET_RUNNING = 4,
}
