"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doStartDeflateWorker = exports.resetDeflateWorkerState = exports.startDeflateWorker = void 0;
var browser_core_1 = require("@datadog/browser-core");
var deflateWorker_1 = require("./deflateWorker");
var state = { status: 0 /* Nil */ };
function startDeflateWorker(callback, createDeflateWorkerImpl) {
    if (createDeflateWorkerImpl === void 0) { createDeflateWorkerImpl = deflateWorker_1.createDeflateWorker; }
    switch (state.status) {
        case 0 /* Nil */:
            state = { status: 1 /* Loading */, callbacks: [callback] };
            doStartDeflateWorker(createDeflateWorkerImpl);
            break;
        case 1 /* Loading */:
            state.callbacks.push(callback);
            break;
        case 2 /* Error */:
            callback();
            break;
        case 3 /* Initialized */:
            callback(state.worker);
            break;
    }
}
exports.startDeflateWorker = startDeflateWorker;
function resetDeflateWorkerState() {
    state = { status: 0 /* Nil */ };
}
exports.resetDeflateWorkerState = resetDeflateWorkerState;
/**
 * Starts the deflate worker and handle messages and errors
 *
 * The spec allow browsers to handle worker errors differently:
 * - Chromium throws an exception
 * - Firefox fires an error event
 *
 * more details: https://bugzilla.mozilla.org/show_bug.cgi?id=1736865#c2
 */
function doStartDeflateWorker(createDeflateWorkerImpl) {
    if (createDeflateWorkerImpl === void 0) { createDeflateWorkerImpl = deflateWorker_1.createDeflateWorker; }
    try {
        var worker_1 = createDeflateWorkerImpl();
        worker_1.addEventListener('error', browser_core_1.monitor(onError));
        worker_1.addEventListener('message', browser_core_1.monitor(function (_a) {
            var data = _a.data;
            if (data.type === 'errored') {
                onError(data.error);
            }
            else if (data.type === 'initialized') {
                onInitialized(worker_1);
            }
        }));
        worker_1.postMessage({ action: 'init' });
        return worker_1;
    }
    catch (error) {
        onError(error);
    }
}
exports.doStartDeflateWorker = doStartDeflateWorker;
function onInitialized(worker) {
    if (state.status === 1 /* Loading */) {
        state.callbacks.forEach(function (callback) { return callback(worker); });
        state = { status: 3 /* Initialized */, worker: worker };
    }
}
function onError(error) {
    if (state.status === 1 /* Loading */) {
        browser_core_1.display.error('Session Replay recording failed to start: an error occurred while creating the Worker:', error);
        if (error instanceof Event || (error instanceof Error && browser_core_1.includes(error.message, 'Content Security Policy'))) {
            browser_core_1.display.error('Please make sure CSP is correctly configured ' +
                'https://docs.datadoghq.com/real_user_monitoring/faq/content_security_policy');
        }
        else {
            browser_core_1.addMonitoringError(error);
        }
        state.callbacks.forEach(function (callback) { return callback(); });
        state = { status: 2 /* Error */ };
    }
    else {
        browser_core_1.addMonitoringError(error);
    }
}
//# sourceMappingURL=startDeflateWorker.js.map