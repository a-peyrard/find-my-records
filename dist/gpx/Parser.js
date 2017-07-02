"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const moment = require("moment");
const GpsPoint_1 = require("../domain/GpsPoint");
const pify = require("pify");
const xml2js = require("xml2js");
const immutable_1 = require("immutable");
const Run_1 = require("../domain/Run");
const util_1 = require("util");
function parse(filePath) {
    return pify(fs.readFile)(filePath, "utf8")
        .then(data => pify(new xml2js.Parser().parseString)(data))
        .then((data) => {
        ensureTagExists(data, "gpx");
        return {
            date: moment(data.gpx.metadata[0].time[0]).toDate(),
            unparsedTrack: data.gpx.trk
        };
    })
        .then((data) => {
        ensureTagExists(data, "unparsedTrack");
        return {
            runMeta: new Run_1.Run.Meta(data.unparsedTrack[0].name[0], data.date),
            unparsedPoints: data.unparsedTrack[0].trkseg[0].trkpt
        };
    })
        .then((data) => new Run_1.Run(data.runMeta, extractPositions(data)));
}
exports.default = parse;
function ensureTagExists(data, tag) {
    if (util_1.isNullOrUndefined(data[tag])) {
        throw new Error("unable to find the tag [" + tag + "]");
    }
}
/*
    extracts from an array of trkpt json objects, a list of positions
 */
function extractPositions({ runMeta, unparsedPoints }) {
    const stack = [];
    let currentDistance = 0;
    let lastPoint = trkptToGpsPoint(unparsedPoints[0]);
    const startTime = moment(unparsedPoints[0].time[0]);
    for (let i = 1; i < unparsedPoints.length; i++) {
        const unparsedPoint = unparsedPoints[i];
        const cur = trkptToGpsPoint(unparsedPoint);
        currentDistance += GpsPoint_1.default.distance(lastPoint, cur);
        stack.push(toPosition(runMeta, currentDistance, unparsedPoint.time[0], startTime));
        lastPoint = cur;
    }
    return immutable_1.List(stack);
}
function trkptToGpsPoint(trkpt) {
    return new GpsPoint_1.default(trkpt.$.lat, trkpt.$.lon);
}
function toPosition(runMeta, distanceFromStart, rawTime, startTime) {
    return new Run_1.Run.Position(runMeta, distanceFromStart, moment(rawTime).diff(startTime) / 1000);
}
//# sourceMappingURL=Parser.js.map