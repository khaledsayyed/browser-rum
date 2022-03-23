import { Context, Duration, ClocksState, Observable } from '@datadog/browser-core';
import { ActionType } from '../../../rawRumEvent.types';
import { RumConfiguration } from '../../configuration';
import { LifeCycle } from '../../lifeCycle';
declare type AutoActionType = ActionType.CLICK;
export interface ActionCounts {
    errorCount: number;
    longTaskCount: number;
    resourceCount: number;
}
export interface CustomAction {
    type: ActionType.CUSTOM;
    name: string;
    startClocks: ClocksState;
    context?: Context;
}
export interface AutoAction {
    type: AutoActionType;
    id: string;
    name: string;
    startClocks: ClocksState;
    duration: Duration;
    counts: ActionCounts;
    event: Event;
}
export interface AutoActionCreatedEvent {
    id: string;
    startClocks: ClocksState;
}
export declare const AUTO_ACTION_MAX_DURATION: number;
export declare function trackActions(lifeCycle: LifeCycle, domMutationObservable: Observable<void>, { actionNameAttribute }: RumConfiguration): {
    stop(): void;
};
export {};
