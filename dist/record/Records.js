"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immutable_1 = require("immutable");
class Records {
    constructor(positions, distances) {
        this.positions = positions;
        this.distances = distances;
    }
    static from(positions) {
        return new Records(positions, immutable_1.List());
    }
    distance(distance) {
        return new Records(this.positions, this.distances.push(distance));
    }
    extract() {
        if (this.distances.isEmpty()) {
            throw new Error("unable to calculate any record, there is no specified distances!");
        }
        const trackers = immutable_1.Map().withMutations(mutable => this.distances.forEach(distance => mutable.set(distance, new Tracker(distance))));
        this.positions.forEach(position => trackers.forEach(tracker => tracker.track(position)));
        return trackers.toSeq()
            .filter(tracker => tracker.hasRecord())
            .map(tracker => tracker.getRecord())
            .toMap();
    }
}
exports.Records = Records;
class Record {
    constructor(distance, time, startingPosition, measuredDistance) {
        this.distance = distance;
        this.time = time;
        this.startingPosition = startingPosition;
        this.measuredDistance = measuredDistance;
    }
    isBetterThan(other) {
        if (!other) {
            return true;
        }
        if (this.distance !== other.distance) {
            throw new Error("Can not compare incompatible records, current is for distance: " + this.distance +
                ", trying to be compared with a record for distance: " + other.distance);
        }
        if (this.time < other.time) {
            return true;
        }
        // tricky case, two record have same time, but one could be a little bit longer than the other,
        // so we chose the longer one to be the better
        return this.time === other.time && this.measuredDistance > other.measuredDistance;
    }
}
exports.Record = Record;
class Tracker {
    constructor(distance) {
        this.distance = distance;
        this.queue = [];
    }
    hasRecord() {
        return this.best !== undefined;
    }
    getRecord() {
        return this.best;
    }
    track(position) {
        this.queue.push(position);
        while (this.queueDistance() >= this.distance) {
            const cur = this.extractRecord();
            if (cur.isBetterThan(this.best)) {
                this.best = cur;
            }
            // move the window
            this.queue.shift();
        }
        return this;
    }
    queueDistance() {
        return this.tail().distance - this.head().distance;
    }
    extractRecord() {
        return new Record(this.distance, this.tail().elapsedTime - this.head().elapsedTime, this.head(), this.queueDistance());
    }
    tail() {
        return this.queue[this.queue.length - 1];
    }
    head() {
        return this.queue[0];
    }
}
//# sourceMappingURL=Records.js.map