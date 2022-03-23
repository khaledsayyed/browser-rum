import { RelativeTime } from '@datadog/browser-core';
import { ActionContext, ViewContext } from '../rawRumEvent.types';
import { LifeCycle } from './lifeCycle';
export declare const VIEW_CONTEXT_TIME_OUT_DELAY: number;
export declare const ACTION_CONTEXT_TIME_OUT_DELAY: number;
export interface ParentContexts {
    findAction: (startTime?: RelativeTime) => ActionContext | undefined;
    findView: (startTime?: RelativeTime) => ViewContext | undefined;
    stop: () => void;
}
export declare function startParentContexts(lifeCycle: LifeCycle): ParentContexts;
