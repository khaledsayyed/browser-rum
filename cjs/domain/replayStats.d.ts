import { ReplayStats } from '@datadog/browser-rum-core';
export declare const MAX_STATS_HISTORY = 10;
export declare function addSegment(viewId: string): void;
export declare function addRecord(viewId: string): void;
export declare function addWroteData(viewId: string, additionalRawSize: number): void;
export declare function getReplayStats(viewId: string): ReplayStats | undefined;
export declare function resetReplayStats(): void;
