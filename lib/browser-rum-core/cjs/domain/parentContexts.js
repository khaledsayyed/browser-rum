"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startParentContexts = exports.ACTION_CONTEXT_TIME_OUT_DELAY = exports.VIEW_CONTEXT_TIME_OUT_DELAY = void 0;
var browser_core_1 = require("@datadog/browser-core");
var lifeCycle_1 = require("./lifeCycle");
exports.VIEW_CONTEXT_TIME_OUT_DELAY = browser_core_1.SESSION_TIME_OUT_DELAY;
exports.ACTION_CONTEXT_TIME_OUT_DELAY = 5 * browser_core_1.ONE_MINUTE; // arbitrary
function startParentContexts(lifeCycle) {
    var viewContextHistory = new browser_core_1.ContextHistory(exports.VIEW_CONTEXT_TIME_OUT_DELAY);
    var actionContextHistory = new browser_core_1.ContextHistory(exports.ACTION_CONTEXT_TIME_OUT_DELAY);
    lifeCycle.subscribe(lifeCycle_1.LifeCycleEventType.VIEW_CREATED, function (view) {
        viewContextHistory.setCurrent(buildViewContext(view), view.startClocks.relative);
    });
    lifeCycle.subscribe(lifeCycle_1.LifeCycleEventType.VIEW_UPDATED, function (view) {
        // A view can be updated after its end.  We have to ensure that the view being updated is the
        // most recently created.
        var current = viewContextHistory.getCurrent();
        if (current && current.view.id === view.id) {
            viewContextHistory.setCurrent(buildViewContext(view), view.startClocks.relative);
        }
    });
    lifeCycle.subscribe(lifeCycle_1.LifeCycleEventType.VIEW_ENDED, function (_a) {
        var endClocks = _a.endClocks;
        viewContextHistory.closeCurrent(endClocks.relative);
    });
    lifeCycle.subscribe(lifeCycle_1.LifeCycleEventType.AUTO_ACTION_CREATED, function (action) {
        actionContextHistory.setCurrent(buildActionContext(action), action.startClocks.relative);
    });
    lifeCycle.subscribe(lifeCycle_1.LifeCycleEventType.AUTO_ACTION_COMPLETED, function (action) {
        if (actionContextHistory.getCurrent()) {
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            var actionEndTime = (action.startClocks.relative + action.duration);
            actionContextHistory.closeCurrent(actionEndTime);
        }
    });
    lifeCycle.subscribe(lifeCycle_1.LifeCycleEventType.AUTO_ACTION_DISCARDED, function () {
        actionContextHistory.clearCurrent();
    });
    lifeCycle.subscribe(lifeCycle_1.LifeCycleEventType.SESSION_RENEWED, function () {
        viewContextHistory.reset();
        actionContextHistory.reset();
    });
    function buildViewContext(view) {
        return {
            view: {
                id: view.id,
                name: view.name,
            },
        };
    }
    function buildActionContext(action) {
        return { action: { id: action.id } };
    }
    return {
        findAction: function (startTime) { return actionContextHistory.find(startTime); },
        findView: function (startTime) { return viewContextHistory.find(startTime); },
        stop: function () {
            viewContextHistory.stop();
            actionContextHistory.stop();
        },
    };
}
exports.startParentContexts = startParentContexts;
//# sourceMappingURL=parentContexts.js.map