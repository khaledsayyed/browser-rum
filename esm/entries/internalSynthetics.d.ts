export { DefaultPrivacyLevel } from '@datadog/browser-core';
export declare const datadogRum: {
    init: (initConfiguration: import("@datadog/browser-rum-core").RumInitConfiguration) => void;
    addRumGlobalContext: (key: string, value: any) => void;
    removeRumGlobalContext: (key: string) => void;
    getRumGlobalContext: () => import("@datadog/browser-core").Context;
    setRumGlobalContext: (newContext: object) => void;
    getInternalContext: (startTime?: number | undefined) => import("@datadog/browser-rum-core/cjs/rawRumEvent.types").InternalContext | undefined;
    getInitConfiguration: () => import("@datadog/browser-core").InitConfiguration | undefined;
    addAction: (name: string, context?: object | undefined) => void;
    addError: (error: unknown, context?: object | undefined) => void;
    addTiming: (name: string, time?: number | undefined) => void;
    setUser: (newUser: import("@datadog/browser-rum-core/cjs/rawRumEvent.types").User) => void;
    removeUser: () => void;
    startView: (name?: string | undefined) => void;
    stopView: () => void;
    startSessionReplayRecording: () => void;
    stopSessionReplayRecording: () => void;
} & {
    onReady(callback: () => void): void;
};
