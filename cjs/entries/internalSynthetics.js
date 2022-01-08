"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.datadogRum = exports.DefaultPrivacyLevel = void 0;
/**
 * Entry point consumed by the Datadog Synthetics worker to automatically inject a RUM SDK instance
 * in test runs.
 *
 * WARNING: this module is not intended for public usages, and won't follow semver for breaking
 * changes.
 */
var browser_rum_core_1 = require("@datadog/browser-rum-core");
var startRecording_1 = require("../boot/startRecording");
var recorderApi_1 = require("../boot/recorderApi");
var browser_core_1 = require("@datadog/browser-core");
Object.defineProperty(exports, "DefaultPrivacyLevel", { enumerable: true, get: function () { return browser_core_1.DefaultPrivacyLevel; } });
// Disable the rule that forbids potential side effects, because we know that those functions don't
// have side effects.
/* eslint-disable local-rules/disallow-side-effects */
var recorderApi = (0, recorderApi_1.makeRecorderApi)(startRecording_1.startRecording);
exports.datadogRum = (0, browser_rum_core_1.makeRumPublicApi)(browser_rum_core_1.startRum, recorderApi, { ignoreInitIfSyntheticsWillInjectRum: false });
/* eslint-enable local-rules/disallow-side-effects */
//# sourceMappingURL=internalSynthetics.js.map