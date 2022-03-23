import { RumConfiguration } from '../domain/configuration';
import { LifeCycle } from '../domain/lifeCycle';
export declare function startRumBatch(configuration: RumConfiguration, lifeCycle: LifeCycle): {
    stop: () => void;
};
