import { LifeCycle, ParentContexts, RumConfiguration, RumSessionManager } from '@datadog/browser-rum-core';
import { DeflateWorker } from '../domain/segmentCollection';
export declare function startRecording(lifeCycle: LifeCycle, configuration: RumConfiguration, sessionManager: RumSessionManager, parentContexts: ParentContexts, worker: DeflateWorker): {
    stop: () => void;
};
