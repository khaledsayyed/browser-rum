import { __assign } from "tslib";
import { BoundedBuffer, buildCookieOptions, createContextManager, deepClone, makePublicApi, monitor, clocksNow, timeStampNow, display, callMonitored, createHandlingStack, canUseEventBridge, areCookiesAuthorized, startInternalMonitoring, } from '@datadog/browser-core';
import { ActionType } from '../rawRumEvent.types';
import { willSyntheticsInjectRum } from '../domain/syntheticsContext';
import { validateAndBuildRumConfiguration } from '../domain/configuration';
export function makeRumPublicApi(startRumImpl, recorderApi, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.ignoreInitIfSyntheticsWillInjectRum, ignoreInitIfSyntheticsWillInjectRum = _c === void 0 ? true : _c;
    var isAlreadyInitialized = false;
    var globalContextManager = createContextManager();
    var user = {};
    var getInternalContextStrategy = function () { return undefined; };
    var getInitConfigurationStrategy = function () { return undefined; };
    var bufferApiCalls = new BoundedBuffer();
    var addTimingStrategy = function (name, time) {
        if (time === void 0) { time = timeStampNow(); }
        bufferApiCalls.add(function () { return addTimingStrategy(name, time); });
    };
    var startViewStrategy = function (name, startClocks) {
        if (startClocks === void 0) { startClocks = clocksNow(); }
        bufferApiCalls.add(function () { return startViewStrategy(name, startClocks); });
    };
    var addActionStrategy = function (action, commonContext) {
        if (commonContext === void 0) { commonContext = clonedCommonContext(); }
        bufferApiCalls.add(function () { return addActionStrategy(action, commonContext); });
    };
    var addErrorStrategy = function (providedError, commonContext) {
        if (commonContext === void 0) { commonContext = clonedCommonContext(); }
        bufferApiCalls.add(function () { return addErrorStrategy(providedError, commonContext); });
    };
    var stopViewStrategy = function () {
        bufferApiCalls.add(function () { return stopViewStrategy(); });
    };
    function clonedCommonContext() {
        return deepClone({
            context: globalContextManager.get(),
            user: user,
        });
    }
    function initRum(initConfiguration) {
        // If we are in a Synthetics test configured to automatically inject a RUM instance, we want to
        // completely discard the customer application RUM instance by ignoring their init() call.  But,
        // we should not ignore the init() call from the Synthetics-injected RUM instance, so the
        // internal `ignoreInitIfSyntheticsWillInjectRum` option is here to bypass this condition.
        if (ignoreInitIfSyntheticsWillInjectRum && willSyntheticsInjectRum()) {
            return;
        }
        if (canUseEventBridge()) {
            initConfiguration = overrideInitConfigurationForBridge(initConfiguration);
        }
        else if (!canHandleSession(initConfiguration)) {
            return;
        }
        if (!canInitRum(initConfiguration)) {
            return;
        }
        var configuration = validateAndBuildRumConfiguration(initConfiguration);
        if (!configuration) {
            return;
        }
        var internalMonitoring = startInternalMonitoring(configuration);
        if (!configuration.trackViewsManually) {
            doStartRum(configuration, internalMonitoring);
        }
        else {
            // drain beforeInitCalls by buffering them until we start RUM
            // if we get a startView, drain re-buffered calls before continuing to drain beforeInitCalls
            // in order to ensure that calls are processed in order
            var beforeInitCalls = bufferApiCalls;
            bufferApiCalls = new BoundedBuffer();
            startViewStrategy = function (name) {
                doStartRum(configuration, internalMonitoring, name);
            };
            beforeInitCalls.drain();
        }
        getInitConfigurationStrategy = function () { return deepClone(initConfiguration); };
        isAlreadyInitialized = true;
    }
    function doStartRum(configuration, internalMonitoring, initialViewName) {
        var startRumResults = startRumImpl(configuration, internalMonitoring, function () { return ({
            user: user,
            context: globalContextManager.get(),
            hasReplay: recorderApi.isRecording() ? true : undefined,
        }); }, recorderApi, initialViewName);
        (startViewStrategy = startRumResults.startView, addActionStrategy = startRumResults.addAction, addErrorStrategy = startRumResults.addError, addTimingStrategy = startRumResults.addTiming, getInternalContextStrategy = startRumResults.getInternalContext, stopViewStrategy = startRumResults.stopView);
        bufferApiCalls.drain();
        recorderApi.onRumStart(startRumResults.lifeCycle, configuration, startRumResults.session, startRumResults.parentContexts);
    }
    var rumPublicApi = makePublicApi({
        init: monitor(initRum),
        addRumGlobalContext: monitor(globalContextManager.add),
        removeRumGlobalContext: monitor(globalContextManager.remove),
        getRumGlobalContext: monitor(globalContextManager.get),
        setRumGlobalContext: monitor(globalContextManager.set),
        getInternalContext: monitor(function (startTime) { return getInternalContextStrategy(startTime); }),
        getInitConfiguration: monitor(function () { return getInitConfigurationStrategy(); }),
        addAction: monitor(function (name, context) {
            addActionStrategy({
                name: name,
                context: deepClone(context),
                startClocks: clocksNow(),
                type: ActionType.CUSTOM,
            });
        }),
        addError: function (error, context) {
            var handlingStack = createHandlingStack();
            callMonitored(function () {
                addErrorStrategy({
                    error: error,
                    handlingStack: handlingStack,
                    context: deepClone(context),
                    startClocks: clocksNow(),
                });
            });
        },
        addTiming: monitor(function (name, time) {
            addTimingStrategy(name, time);
        }),
        setUser: monitor(function (newUser) {
            var sanitizedUser = sanitizeUser(newUser);
            if (sanitizedUser) {
                user = sanitizedUser;
            }
            else {
                display.error('Unsupported user:', newUser);
            }
        }),
        removeUser: monitor(function () {
            user = {};
        }),
        startView: monitor(function (name) {
            startViewStrategy(name);
        }),
        stopView: monitor(function () {
            stopViewStrategy();
        }),
        startSessionReplayRecording: monitor(recorderApi.start),
        stopSessionReplayRecording: monitor(recorderApi.stop),
    });
    return rumPublicApi;
    function sanitizeUser(newUser) {
        if (typeof newUser !== 'object' || !newUser) {
            return;
        }
        var result = deepClone(newUser);
        if ('id' in result) {
            result.id = String(result.id);
        }
        if ('name' in result) {
            result.name = String(result.name);
        }
        if ('email' in result) {
            result.email = String(result.email);
        }
        return result;
    }
    function canHandleSession(initConfiguration) {
        if (!areCookiesAuthorized(buildCookieOptions(initConfiguration))) {
            display.warn('Cookies are not authorized, we will not send any data.');
            return false;
        }
        if (isLocalFile()) {
            display.error('Execution is not allowed in the current context.');
            return false;
        }
        return true;
    }
    function canInitRum(initConfiguration) {
        if (isAlreadyInitialized) {
            if (!initConfiguration.silentMultipleInit) {
                display.error('DD_RUM is already initialized.');
            }
            return false;
        }
        return true;
    }
    function overrideInitConfigurationForBridge(initConfiguration) {
        return __assign(__assign({}, initConfiguration), { applicationId: 'empty', clientToken: 'empty', sampleRate: 100 });
    }
    function isLocalFile() {
        return window.location.protocol === 'file:';
    }
}
//# sourceMappingURL=rumPublicApi.js.map