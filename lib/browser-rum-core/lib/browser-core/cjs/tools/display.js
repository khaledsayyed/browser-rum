"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.display = void 0;
/* eslint-disable no-console, local-rules/disallow-side-effects */
/**
 * Keep references on console methods to avoid triggering patched behaviors
 *
 * NB: in some setup, console could already be patched by another SDK.
 * In this case, some display messages can be sent by the other SDK
 * but we should be safe from infinite loop nonetheless.
 */
exports.display = {
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
};
//# sourceMappingURL=display.js.map