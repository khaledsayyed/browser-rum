import { EventEmitter, RelativeTime } from '@datadog/browser-core';
export declare function trackFirstHidden(emitter?: EventEmitter): {
    timeStamp: RelativeTime;
};
export declare function resetFirstHidden(): void;
