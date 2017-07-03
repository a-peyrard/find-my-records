"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Run_1 = require("../domain/Run");
const immutable_1 = require("immutable");
const stream_1 = require("stream");
const Types_1 = require("../util/Types");
class RecordsAggregatorStream extends stream_1.Transform {
    constructor(options) {
        super(Object.assign({}, options, { objectMode: true }));
        this.records = immutable_1.Map().asMutable();
    }
    _transform(chunk, encoding, done) {
        const record = Record.checkInstanceOf(chunk);
        const oldRecord = this.records.get(record.distance);
        if (record.isBetterThan(oldRecord)) {
            this.records.set(record.distance, record);
            this.push(record);
        }
        done();
    }
}
exports.RecordsAggregatorStream = RecordsAggregatorStream;
class FindRecordsStream extends stream_1.Transform {
    constructor(distances, options) {
        super(Object.assign({}, options, { objectMode: true }));
        this.distances = distances;
        this.trackers = immutable_1.Map().withMutations(mutable => this.distances.forEach((distance) => mutable.set(distance, new Tracker(distance))));
    }
    _transform(chunk, encoding, callback) {
        const position = Run_1.Run.Position.checkInstanceOf(chunk);
        this.trackers.forEach((tracker) => {
            const newRecord = tracker.track(position);
            if (newRecord) {
                this.push(newRecord);
            }
        });
        callback();
    }
}
exports.FindRecordsStream = FindRecordsStream;
class Record {
    constructor(distance, time, startingPosition, measuredDistance) {
        this.distance = distance;
        this.time = time;
        this.startingPosition = startingPosition;
        this.measuredDistance = measuredDistance;
        this.runMeta = startingPosition.runMeta;
    }
    static checkInstanceOf(chunk) {
        if (chunk instanceof Record) {
            return chunk;
        }
        throw new Types_1.WrongTypeException("Record", chunk);
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
    track(position) {
        let newRecord;
        this.queue.push(position);
        while (this.queueDistance() >= this.distance) {
            const cur = this.extractRecord();
            if (cur.isBetterThan(this.best)) {
                this.best = cur;
                newRecord = cur;
            }
            // move the window
            this.queue.shift();
        }
        return newRecord;
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