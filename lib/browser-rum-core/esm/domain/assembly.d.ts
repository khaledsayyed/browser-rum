import { CommonContext } from '../rawRumEvent.types';
import { LifeCycle } from './lifeCycle';
import { ParentContexts } from './parentContexts';
import { RumSessionManager } from './rumSessionManager';
import { UrlContexts } from './urlContexts';
import { RumConfiguration } from './configuration';
export declare function startRumAssembly(configuration: RumConfiguration, lifeCycle: LifeCycle, sessionManager: RumSessionManager, parentContexts: ParentContexts, urlContexts: UrlContexts, getCommonContext: () => CommonContext): void;
