import { Context, RawError, RelativeTime, Subscription } from '@datadog/browser-core';
import { RumPerformanceEntry } from '../browser/performanceCollection';
import { RumEventDomainContext } from '../domainContext.types';
import { CommonContext, RawRumEvent } from '../rawRumEvent.types';
import { RumEvent } from '../rumEvent.types';
import { RequestCompleteEvent, RequestStartEvent } from './requestCollection';
import { AutoAction, AutoActionCreatedEvent } from './rumEventsCollection/action/trackActions';
import { ViewEvent, ViewCreatedEvent, ViewEndedEvent } from './rumEventsCollection/view/trackViews';
export declare enum LifeCycleEventType {
    PERFORMANCE_ENTRY_COLLECTED = 0,
    AUTO_ACTION_CREATED = 1,
    AUTO_ACTION_COMPLETED = 2,
    AUTO_ACTION_DISCARDED = 3,
    VIEW_CREATED = 4,
    VIEW_UPDATED = 5,
    VIEW_ENDED = 6,
    REQUEST_STARTED = 7,
    REQUEST_COMPLETED = 8,
    SESSION_EXPIRED = 9,
    SESSION_RENEWED = 10,
    BEFORE_UNLOAD = 11,
    RAW_RUM_EVENT_COLLECTED = 12,
    RUM_EVENT_COLLECTED = 13,
    RAW_ERROR_COLLECTED = 14
}
export declare class LifeCycle {
    private callbacks;
    notify(eventType: LifeCycleEventType.PERFORMANCE_ENTRY_COLLECTED, data: RumPerformanceEntry): void;
    notify(eventType: LifeCycleEventType.REQUEST_STARTED, data: RequestStartEvent): void;
    notify(eventType: LifeCycleEventType.REQUEST_COMPLETED, data: RequestCompleteEvent): void;
    notify(eventType: LifeCycleEventType.AUTO_ACTION_COMPLETED, data: AutoAction): void;
    notify(eventType: LifeCycleEventType.AUTO_ACTION_CREATED, data: AutoActionCreatedEvent): void;
    notify(eventType: LifeCycleEventType.VIEW_CREATED, data: ViewCreatedEvent): void;
    notify(eventType: LifeCycleEventType.VIEW_UPDATED, data: ViewEvent): void;
    notify(eventType: LifeCycleEventType.VIEW_ENDED, data: ViewEndedEvent): void;
    notify(eventType: LifeCycleEventType.RAW_ERROR_COLLECTED, data: {
        error: RawError;
        savedCommonContext?: CommonContext;
        customerContext?: Context;
    }): void;
    notify(eventType: LifeCycleEventType.SESSION_EXPIRED | LifeCycleEventType.SESSION_RENEWED | LifeCycleEventType.BEFORE_UNLOAD | LifeCycleEventType.AUTO_ACTION_DISCARDED): void;
    notify(eventType: LifeCycleEventType.RAW_RUM_EVENT_COLLECTED, data: RawRumEventCollectedData): void;
    notify(eventType: LifeCycleEventType.RUM_EVENT_COLLECTED, data: RumEvent & Context): void;
    subscribe(eventType: LifeCycleEventType.PERFORMANCE_ENTRY_COLLECTED, callback: (data: RumPerformanceEntry) => void): Subscription;
    subscribe(eventType: LifeCycleEventType.REQUEST_STARTED, callback: (data: RequestStartEvent) => void): Subscription;
    subscribe(eventType: LifeCycleEventType.REQUEST_COMPLETED, callback: (data: RequestCompleteEvent) => void): Subscription;
    subscribe(eventType: LifeCycleEventType.AUTO_ACTION_COMPLETED, callback: (data: AutoAction) => void): Subscription;
    subscribe(eventType: LifeCycleEventType.AUTO_ACTION_CREATED, callback: (data: AutoActionCreatedEvent) => void): Subscription;
    subscribe(eventType: LifeCycleEventType.VIEW_CREATED, callback: (data: ViewCreatedEvent) => void): Subscription;
    subscribe(eventType: LifeCycleEventType.VIEW_UPDATED, callback: (data: ViewEvent) => void): Subscription;
    subscribe(eventType: LifeCycleEventType.VIEW_ENDED, callback: (data: ViewEndedEvent) => void): Subscription;
    subscribe(eventType: LifeCycleEventType.RAW_ERROR_COLLECTED, callback: (data: {
        error: RawError;
        savedCommonContext?: CommonContext;
        customerContext?: Context;
    }) => void): Subscription;
    subscribe(eventType: LifeCycleEventType.SESSION_EXPIRED | LifeCycleEventType.SESSION_RENEWED | LifeCycleEventType.BEFORE_UNLOAD | LifeCycleEventType.AUTO_ACTION_DISCARDED, callback: () => void): Subscription;
    subscribe(eventType: LifeCycleEventType.RAW_RUM_EVENT_COLLECTED, callback: (data: RawRumEventCollectedData) => void): Subscription;
    subscribe(eventType: LifeCycleEventType.RUM_EVENT_COLLECTED, callback: (data: RumEvent & Context) => void): Subscription;
}
export interface RawRumEventCollectedData<E extends RawRumEvent = RawRumEvent> {
    startTime: RelativeTime;
    savedCommonContext?: CommonContext;
    customerContext?: Context;
    rawRumEvent: E;
    domainContext: RumEventDomainContext<E['type']>;
}
