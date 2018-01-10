export interface IPlatform {
    name: string;
    productCode: string;
}
export declare class PlatformSelector {
    private deviceCache;
    constructor();
    lookupDevice(code: string): Promise<IPlatform>;
}
