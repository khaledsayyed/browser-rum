import { Observable } from '@datadog/browser-core';
import { CommonContext } from '../../../rawRumEvent.types';
import { LifeCycle } from '../../lifeCycle';
import { ForegroundContexts } from '../../foregroundContexts';
import { RumConfiguration } from '../../configuration';
import { CustomAction } from './trackActions';
export declare function startActionCollection(lifeCycle: LifeCycle, domMutationObservable: Observable<void>, configuration: RumConfiguration, foregroundContexts: ForegroundContexts): {
    addAction: (action: CustomAction, savedCommonContext?: CommonContext | undefined) => void;
};
