"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.datadogRum = exports.DefaultPrivacyLevel = void 0;
// Keep the following in sync with packages/rum-slim/src/entries/main.ts
var browser_core_1 = require("@datadog/browser-core");
var browser_rum_core_1 = require("@datadog/browser-rum-core");
var startRecording_1 = require("../boot/startRecording");
var recorderApi_1 = require("../boot/recorderApi");
var browser_core_2 = require("@datadog/browser-core");
Object.defineProperty(exports, "DefaultPrivacyLevel", { enumerable: true, get: function () { return browser_core_2.DefaultPrivacyLevel; } });
var recorderApi = recorderApi_1.makeRecorderApi(startRecording_1.startRecording);
exports.datadogRum = browser_rum_core_1.makeRumPublicApi(browser_rum_core_1.startRum, recorderApi);
browser_core_1.defineGlobal(browser_core_1.getGlobalObject(), 'DD_RUM', exports.datadogRum);
//# sourceMappingURL=main.js.map