"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startViewCollection = void 0;
var browser_core_1 = require("@datadog/browser-core");
var rawRumEvent_types_1 = require("../../../rawRumEvent.types");
var lifeCycle_1 = require("../../lifeCycle");
var trackViews_1 = require("./trackViews");
function startViewCollection(lifeCycle, configuration, location, domMutationObservable, locationChangeObservable, foregroundContexts, recorderApi, initialViewName) {
    lifeCycle.subscribe(lifeCycle_1.LifeCycleEventType.VIEW_UPDATED, function (view) {
        return lifeCycle.notify(lifeCycle_1.LifeCycleEventType.RAW_RUM_EVENT_COLLECTED, processViewUpdate(view, foregroundContexts, recorderApi));
    });
    return trackViews_1.trackViews(location, lifeCycle, domMutationObservable, locationChangeObservable, !configuration.trackViewsManually, initialViewName);
}
exports.startViewCollection = startViewCollection;
function processViewUpdate(view, foregroundContexts, recorderApi) {
    var replayStats = recorderApi.getReplayStats(view.id);
    var viewEvent = {
        _dd: {
            document_version: view.documentVersion,
            replay_stats: replayStats,
        },
        date: view.startClocks.timeStamp,
        type: rawRumEvent_types_1.RumEventType.VIEW,
        view: {
            action: {
                count: view.eventCounts.userActionCount,
            },
            cumulative_layout_shift: view.cumulativeLayoutShift,
            dom_complete: browser_core_1.toServerDuration(view.timings.domComplete),
            dom_content_loaded: browser_core_1.toServerDuration(view.timings.domContentLoaded),
            dom_interactive: browser_core_1.toServerDuration(view.timings.domInteractive),
            error: {
                count: view.eventCounts.errorCount,
            },
            first_contentful_paint: browser_core_1.toServerDuration(view.timings.firstContentfulPaint),
            first_input_delay: browser_core_1.toServerDuration(view.timings.firstInputDelay),
            first_input_time: browser_core_1.toServerDuration(view.timings.firstInputTime),
            is_active: view.isActive,
            name: view.name,
            largest_contentful_paint: browser_core_1.toServerDuration(view.timings.largestContentfulPaint),
            load_event: browser_core_1.toServerDuration(view.timings.loadEvent),
            loading_time: discardNegativeDuration(browser_core_1.toServerDuration(view.loadingTime)),
            loading_type: view.loadingType,
            long_task: {
                count: view.eventCounts.longTaskCount,
            },
            resource: {
                count: view.eventCounts.resourceCount,
            },
            time_spent: browser_core_1.toServerDuration(view.duration),
            in_foreground_periods: foregroundContexts.selectInForegroundPeriodsFor(view.startClocks.relative, view.duration),
        },
        session: {
            has_replay: replayStats ? true : undefined,
        },
    };
    if (!browser_core_1.isEmptyObject(view.customTimings)) {
        viewEvent.view.custom_timings = browser_core_1.mapValues(view.customTimings, browser_core_1.toServerDuration);
    }
    return {
        rawRumEvent: viewEvent,
        startTime: view.startClocks.relative,
        domainContext: {
            location: view.location,
        },
    };
}
function discardNegativeDuration(duration) {
    return browser_core_1.isNumber(duration) && duration < 0 ? undefined : duration;
}
//# sourceMappingURL=viewCollection.js.map