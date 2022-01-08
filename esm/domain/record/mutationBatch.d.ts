import { RumMutationRecord } from './types';
export declare function createMutationBatch(processMutationBatch: (mutations: RumMutationRecord[]) => void): {
    addMutations: (mutations: RumMutationRecord[]) => void;
    flush: () => void;
    stop: () => void;
};
