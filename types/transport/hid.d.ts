/// <reference types="w3c-web-usb" />
export interface IHID {
    write(data: ArrayBuffer): Promise<void>;
    read(): Promise<Uint8Array>;
    close(): Promise<void>;
}
export declare class HID {
    private device;
    private interfaces;
    private interface;
    private endpoints;
    private epIn;
    private epOut;
    constructor(device: USBDevice);
    open(): Promise<void>;
    close(): Promise<void>;
    write(data: ArrayBuffer): Promise<USBOutTransferResult>;
    read(): Promise<DataView>;
}
