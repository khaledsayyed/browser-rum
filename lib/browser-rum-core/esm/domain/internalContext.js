import { __assign } from "tslib";
/**
 * Internal context keep returning v1 format
 * to not break compatibility with logs data format
 */
export function startInternalContext(applicationId, sessionManager, parentContexts, urlContexts) {
    return {
        get: function (startTime) {
            var viewContext = parentContexts.findView(startTime);
            var urlContext = urlContexts.findUrl(startTime);
            var session = sessionManager.findTrackedSession(startTime);
            if (session && viewContext && urlContext) {
                var actionContext = parentContexts.findAction(startTime);
                return {
                    application_id: applicationId,
                    session_id: session.id,
                    user_action: actionContext
                        ? {
                            id: actionContext.action.id,
                        }
                        : undefined,
                    view: __assign(__assign({}, viewContext.view), urlContext.view),
                };
            }
        },
    };
}
//# sourceMappingURL=internalContext.js.map