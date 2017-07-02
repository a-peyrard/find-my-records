"use strict";
exports.__esModule = true;
var fs = require("fs");
var moment = require("moment");
var GpsPoint_1 = require("../domain/GpsPoint");
var pify = require("pify");
var xml2js = require("xml2js");
var immutable_1 = require("immutable");
var Run_1 = require("../domain/Run");
var util_1 = require("util");
function parse(filePath) {
    return pify(fs.readFile)(filePath, "utf8")
        .then(function (data) { return pify(new xml2js.Parser().parseString)(data); })
        .then(function (data) {
        ensureTagExists(data, "gpx");
        return {
            date: moment(data.gpx.metadata[0].time[0]).toDate(),
            unparsedTrack: data.gpx.trk
        };
    })
        .then(function (data) {
        ensureTagExists(data, "unparsedTrack");
        return {
            runMeta: new Run_1.Run.Meta(data.unparsedTrack[0].name[0], data.date),
            unparsedPoints: data.unparsedTrack[0].trkseg[0].trkpt
        };
    })
        .then(function (data) { return new Run_1.Run(data.runMeta, extractPositions(data)); });
}
exports["default"] = parse;
function ensureTagExists(data, tag) {
    if (util_1.isNullOrUndefined(data[tag])) {
        throw new Error("unable to find the tag [" + tag + "]");
    }
}
/*
    extracts from an array of trkpt json objects, a list of positions
 */
function extractPositions(_a) {
    var runMeta = _a.runMeta, unparsedPoints = _a.unparsedPoints;
    var stack = [];
    var currentDistance = 0;
    var lastPoint = trkptToGpsPoint(unparsedPoints[0]);
    var startTime = moment(unparsedPoints[0].time[0]);
    for (var i = 1; i < unparsedPoints.length; i++) {
        var unparsedPoint = unparsedPoints[i];
        var cur = trkptToGpsPoint(unparsedPoint);
        currentDistance += GpsPoint_1["default"].distance(lastPoint, cur);
        stack.push(toPosition(runMeta, currentDistance, unparsedPoint.time[0], startTime));
        lastPoint = cur;
    }
    return immutable_1.List(stack);
}
function trkptToGpsPoint(trkpt) {
    return new GpsPoint_1["default"](trkpt.$.lat, trkpt.$.lon);
}
function toPosition(runMeta, distanceFromStart, rawTime, startTime) {
    return new Run_1.Run.Position(runMeta, distanceFromStart, moment(rawTime).diff(startTime) / 1000);
}
//# sourceMappingURL=Parser.js.map