export interface BrowserWindow extends Window {
    DatadogEventBridge?: DatadogEventBridge;
}
export interface DatadogEventBridge {
    getAllowedWebViewHosts(): string;
    send(msg: string): void;
}
export declare function getEventBridge<T, E>(): {
    getAllowedWebViewHosts(): string[];
    send(eventType: T, event: E): void;
} | undefined;
export declare function canUseEventBridge(): boolean;
