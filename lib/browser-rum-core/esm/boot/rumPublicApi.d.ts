import { Context, InitConfiguration, InternalMonitoring } from '@datadog/browser-core';
import { LifeCycle } from '../domain/lifeCycle';
import { ParentContexts } from '../domain/parentContexts';
import { RumSessionManager } from '../domain/rumSessionManager';
import { CommonContext, User, ReplayStats } from '../rawRumEvent.types';
import { RumConfiguration, RumInitConfiguration } from '../domain/configuration';
import { startRum } from './startRum';
export declare type RumPublicApi = ReturnType<typeof makeRumPublicApi>;
export declare type StartRum = (configuration: RumConfiguration, internalMonitoring: InternalMonitoring, getCommonContext: () => CommonContext, recorderApi: RecorderApi, initialViewName?: string) => StartRumResult;
declare type StartRumResult = ReturnType<typeof startRum>;
export interface RecorderApi {
    start: () => void;
    stop: () => void;
    onRumStart: (lifeCycle: LifeCycle, configuration: RumConfiguration, sessionManager: RumSessionManager, parentContexts: ParentContexts) => void;
    isRecording: () => boolean;
    getReplayStats: (viewId: string) => ReplayStats | undefined;
}
interface RumPublicApiOptions {
    ignoreInitIfSyntheticsWillInjectRum?: boolean;
}
export declare function makeRumPublicApi(startRumImpl: StartRum, recorderApi: RecorderApi, { ignoreInitIfSyntheticsWillInjectRum }?: RumPublicApiOptions): {
    init: (initConfiguration: RumInitConfiguration) => void;
    addRumGlobalContext: (key: string, value: any) => void;
    removeRumGlobalContext: (key: string) => void;
    getRumGlobalContext: () => Context;
    setRumGlobalContext: (newContext: object) => void;
    getInternalContext: (startTime?: number | undefined) => import("../rawRumEvent.types").InternalContext | undefined;
    getInitConfiguration: () => InitConfiguration | undefined;
    addAction: (name: string, context?: object | undefined) => void;
    addError: (error: unknown, context?: object | undefined) => void;
    addTiming: (name: string, time?: number | undefined) => void;
    setUser: (newUser: User) => void;
    removeUser: () => void;
    startView: (name?: string | undefined) => void;
    stopView: () => void;
    startSessionReplayRecording: () => void;
    stopSessionReplayRecording: () => void;
} & {
    onReady(callback: () => void): void;
};
export {};
