"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const sax = require("sax");
const Arrays_1 = require("../util/Arrays");
const moment = require("moment");
const GpsPoint_1 = require("../domain/GpsPoint");
const Run_1 = require("../domain/Run");
const HAILE_BEST_KM_IN_SEC = 140;
class PositionParserStream extends stream_1.Transform {
    constructor(options) {
        super(Object.assign({}, options, { objectMode: true }));
        this.currentPath = [];
        this.runMeta = {};
        this.totalDistance = 0;
        this.saxStream = sax.createStream(false, { lowercase: true });
        this.saxStream.on("opentag", this.onOpenTag.bind(this));
        this.saxStream.on("closetag", this.onCloseTag.bind(this));
        this.saxStream.on("text", this.onText.bind(this));
    }
    onOpenTag(node) {
        if (!node.isSelfClosing) {
            this.currentPath.push(node.name);
        }
        this.pathMatcher(node, {
            path: ["gpx", "trk", "trkseg", "trkpt"],
            consumer: n => {
                const cur = new GpsPoint_1.default(n.attributes.lat, n.attributes.lon);
                const distanceFromLast = GpsPoint_1.default.distance(this.lastPoint, cur);
                this.currentPosition = {
                    runMeta: this.runMeta,
                    distanceFromLast
                };
                this.lastPoint = cur;
            }
        });
    }
    isNotBetterThanHaile() {
        if (!this.lastSavedPosition) {
            return true;
        }
        const metersRun = this.currentPosition.distanceFromLast;
        const time = this.currentPosition.elapsedTime - this.lastSavedPosition.elapsedTime;
        return time * (1000 / metersRun) > HAILE_BEST_KM_IN_SEC;
    }
    onCloseTag(tagName) {
        this.pathMatcher(tagName, {
            path: ["gpx", "trk", "trkseg", "trkpt"],
            consumer: () => {
                if (this.isNotBetterThanHaile()) {
                    this.totalDistance += this.currentPosition.distanceFromLast;
                    this.push(new Run_1.Run.Position(new Run_1.Run.Meta(this.runMeta.label, this.runMeta.date), this.totalDistance, this.currentPosition.elapsedTime));
                    this.lastSavedPosition = this.currentPosition;
                }
                delete this.currentPosition;
            }
        });
        this.currentPath.pop();
    }
    onText(text) {
        this.pathMatcher(text, {
            path: ["gpx", "metadata", "time"],
            consumer: t => this.runMeta.date = moment(t).toDate()
        }, {
            path: ["gpx", "trk", "name"],
            consumer: t => this.runMeta.label = t
        }, {
            path: ["gpx", "trk", "trkseg", "trkpt", "time"],
            consumer: rawTime => {
                const time = moment(rawTime);
                if (!this.startTime) {
                    this.startTime = time;
                }
                this.currentPosition.elapsedTime = time.diff(this.startTime) / 1000;
            }
        });
    }
    pathMatcher(val, ...matchers) {
        for (const matcher of matchers) {
            if (this.checkPath(matcher.path)) {
                matcher.consumer(val);
                break;
            }
        }
    }
    checkPath(expectedPath) {
        return Arrays_1.arraysEquals(this.currentPath, expectedPath);
    }
    _transform(chunk, encoding, callback) {
        this.saxStream.write(chunk);
        callback();
    }
}
exports.PositionParserStream = PositionParserStream;
//# sourceMappingURL=PositionParserStream.js.map