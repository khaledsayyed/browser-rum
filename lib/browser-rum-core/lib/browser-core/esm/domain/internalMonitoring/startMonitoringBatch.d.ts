import { Configuration, MonitoringMessage } from '../..';
export declare function startMonitoringBatch(configuration: Configuration): {
    add(message: MonitoringMessage): void;
};
