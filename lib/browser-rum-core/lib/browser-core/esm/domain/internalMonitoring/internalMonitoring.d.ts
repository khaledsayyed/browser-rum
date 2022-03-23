import { Context } from '../../tools/context';
import { Parameters, ThisParameterType } from '../../tools/utils';
import { Configuration } from '../configuration';
declare enum StatusType {
    info = "info",
    error = "error"
}
export interface InternalMonitoring {
    setExternalContextProvider: (provider: () => Context) => void;
}
export interface MonitoringMessage extends Context {
    message: string;
    status: StatusType;
    error?: {
        kind?: string;
        stack: string;
    };
}
export declare function startInternalMonitoring(configuration: Configuration): InternalMonitoring;
export declare function startFakeInternalMonitoring(): MonitoringMessage[];
export declare function resetInternalMonitoring(): void;
export declare function monitored<T extends (...params: any[]) => unknown>(_: any, __: string, descriptor: TypedPropertyDescriptor<T>): void;
export declare function monitor<T extends (...args: any[]) => any>(fn: T): T;
export declare function callMonitored<T extends (...args: any[]) => any>(fn: T, context: ThisParameterType<T>, args: Parameters<T>): ReturnType<T> | undefined;
export declare function callMonitored<T extends (this: void) => any>(fn: T): ReturnType<T> | undefined;
export declare function addMonitoringMessage(message: string, context?: Context): void;
export declare function addMonitoringError(e: unknown): void;
export declare function setDebugMode(debugMode: boolean): void;
export {};
