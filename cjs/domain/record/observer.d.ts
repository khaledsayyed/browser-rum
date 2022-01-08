import { DefaultPrivacyLevel } from '@datadog/browser-core';
import { InputCallback, ListenerHandler, ObserverParam } from './types';
export declare function initObservers(o: ObserverParam): ListenerHandler;
export declare const INPUT_TAGS: string[];
export declare function initInputObserver(cb: InputCallback, defaultPrivacyLevel: DefaultPrivacyLevel): ListenerHandler;
