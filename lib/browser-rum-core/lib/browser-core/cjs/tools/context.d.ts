export interface Context {
    [x: string]: ContextValue;
}
export declare type ContextValue = string | number | boolean | Context | ContextArray | undefined | null;
export interface ContextArray extends Array<ContextValue> {
}
