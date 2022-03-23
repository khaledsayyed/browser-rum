/**
 * LIMITATION:
 * For NPM setup, this feature flag singleton is shared between RUM and Logs product.
 * This means that an experimental flag set on the RUM product will be set on the Logs product.
 * So keep in mind that in certain configurations, your experimental feature flag may affect other products.
 */
export declare function updateExperimentalFeatures(enabledFeatures: string[] | undefined): void;
export declare function isExperimentalFeatureEnabled(featureName: string): boolean;
export declare function resetExperimentalFeatures(): void;
