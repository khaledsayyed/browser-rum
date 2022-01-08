"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetReplayStats = exports.getReplayStats = exports.addWroteData = exports.addRecord = exports.addSegment = exports.MAX_STATS_HISTORY = void 0;
exports.MAX_STATS_HISTORY = 10;
var statsPerView;
function addSegment(viewId) {
    getOrCreateReplayStats(viewId).segments_count += 1;
}
exports.addSegment = addSegment;
function addRecord(viewId) {
    getOrCreateReplayStats(viewId).records_count += 1;
}
exports.addRecord = addRecord;
function addWroteData(viewId, additionalRawSize) {
    getOrCreateReplayStats(viewId).segments_total_raw_size += additionalRawSize;
}
exports.addWroteData = addWroteData;
function getReplayStats(viewId) {
    return statsPerView === null || statsPerView === void 0 ? void 0 : statsPerView.get(viewId);
}
exports.getReplayStats = getReplayStats;
function resetReplayStats() {
    statsPerView = undefined;
}
exports.resetReplayStats = resetReplayStats;
function getOrCreateReplayStats(viewId) {
    if (!statsPerView) {
        statsPerView = new Map();
    }
    var replayStats;
    if (statsPerView.has(viewId)) {
        replayStats = statsPerView.get(viewId);
    }
    else {
        replayStats = {
            records_count: 0,
            segments_count: 0,
            segments_total_raw_size: 0,
        };
        statsPerView.set(viewId, replayStats);
        if (statsPerView.size > exports.MAX_STATS_HISTORY) {
            deleteOldestStats();
        }
    }
    return replayStats;
}
function deleteOldestStats() {
    if (!statsPerView) {
        return;
    }
    if (statsPerView.keys) {
        statsPerView.delete(statsPerView.keys().next().value);
    }
    else {
        // IE11 doesn't support map.keys
        var isFirst_1 = true;
        statsPerView.forEach(function (_value, key) {
            if (isFirst_1) {
                statsPerView.delete(key);
                isFirst_1 = false;
            }
        });
    }
}
//# sourceMappingURL=replayStats.js.map