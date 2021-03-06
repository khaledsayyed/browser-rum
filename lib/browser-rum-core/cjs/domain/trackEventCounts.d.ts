import { LifeCycle } from './lifeCycle';
export interface EventCounts {
    errorCount: number;
    userActionCount: number;
    longTaskCount: number;
    resourceCount: number;
}
export declare function trackEventCounts(lifeCycle: LifeCycle, callback?: (eventCounts: EventCounts) => void): {
    stop: () => void;
    eventCounts: {
        errorCount: number;
        longTaskCount: number;
        resourceCount: number;
        userActionCount: number;
    };
};
