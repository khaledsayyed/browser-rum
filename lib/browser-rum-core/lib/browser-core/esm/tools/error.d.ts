import { StackTrace } from '../domain/tracekit';
import { ClocksState } from './timeUtils';
export interface RawError {
    startClocks: ClocksState;
    message: string;
    type?: string;
    stack?: string;
    source: ErrorSource;
    resource?: {
        url: string;
        statusCode: number;
        method: string;
    };
    originalError?: unknown;
    handling?: ErrorHandling;
    handlingStack?: string;
}
export declare const ErrorSource: {
    readonly AGENT: "agent";
    readonly CONSOLE: "console";
    readonly CUSTOM: "custom";
    readonly LOGGER: "logger";
    readonly NETWORK: "network";
    readonly SOURCE: "source";
};
export declare enum ErrorHandling {
    HANDLED = "handled",
    UNHANDLED = "unhandled"
}
export declare type ErrorSource = typeof ErrorSource[keyof typeof ErrorSource];
export declare function formatUnknownError(stackTrace: StackTrace | undefined, errorObject: any, nonErrorPrefix: string, handlingStack?: string): {
    message: string;
    stack: string;
    handlingStack: string | undefined;
    type: string | undefined;
};
export declare function toStackTraceString(stack: StackTrace): string;
export declare function formatErrorMessage(stack: StackTrace): string;
/**
 Creates a stacktrace without SDK internal frames.
 
 Constraints:
 - Has to be called at the utmost position of the call stack.
 - No internal monitoring should encapsulate the function, that is why we need to use callMonitored inside of it.
 */
export declare function createHandlingStack(): string;
