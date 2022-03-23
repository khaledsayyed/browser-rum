import { InternalContext } from '../rawRumEvent.types';
import { ParentContexts } from './parentContexts';
import { RumSessionManager } from './rumSessionManager';
import { UrlContexts } from './urlContexts';
/**
 * Internal context keep returning v1 format
 * to not break compatibility with logs data format
 */
export declare function startInternalContext(applicationId: string, sessionManager: RumSessionManager, parentContexts: ParentContexts, urlContexts: UrlContexts): {
    get: (startTime?: number | undefined) => InternalContext | undefined;
};
