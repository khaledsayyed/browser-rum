export declare class BoundedBuffer {
    private limit;
    private buffer;
    constructor(limit?: number);
    add(callback: () => void): void;
    drain(): void;
}
