import { Context, ClocksState } from '@datadog/browser-core';
import { CommonContext } from '../../../rawRumEvent.types';
import { LifeCycle } from '../../lifeCycle';
import { ForegroundContexts } from '../../foregroundContexts';
export interface ProvidedError {
    startClocks: ClocksState;
    error: unknown;
    context?: Context;
    handlingStack: string;
}
export declare function startErrorCollection(lifeCycle: LifeCycle, foregroundContexts: ForegroundContexts): {
    addError: ({ error, handlingStack, startClocks, context: customerContext }: ProvidedError, savedCommonContext?: CommonContext | undefined) => void;
};
export declare function doStartErrorCollection(lifeCycle: LifeCycle, foregroundContexts: ForegroundContexts): {
    addError: ({ error, handlingStack, startClocks, context: customerContext }: ProvidedError, savedCommonContext?: CommonContext | undefined) => void;
};
