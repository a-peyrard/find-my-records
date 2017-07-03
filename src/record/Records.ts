import { Run } from "../domain/Run";
import { List, Map } from "immutable";
import { Transform, TransformOptions } from "stream";
import { WrongTypeException } from "../util/Types";

export class RecordsAggregatorStream extends Transform {
    private readonly records: Map<number, Record> = Map<number, Record>().asMutable();

    constructor(options?: TransformOptions) {
        super({ ...options, objectMode: true });
    }

    public _transform(chunk: any, encoding: string, done: (error?: Error, data?: any) => void): void {
        const record = Record.checkInstanceOf(chunk);

        const oldRecord = this.records.get(record.distance);
        if (record.isBetterThan(oldRecord)) {
            this.records.set(record.distance, record);
            this.push(record);
        }
        done();
    }
}

export class FindRecordsStream extends Transform {
    private readonly trackers: Map<number, Tracker>;

    constructor(readonly distances: List<number>, options?: TransformOptions) {
        super({ ...options, objectMode: true });

        this.trackers = Map<number, Tracker>().withMutations(
            mutable => this.distances.forEach(
                (distance: number) => mutable.set(distance, new Tracker(distance))
            )
        );
    }

    public _transform(chunk: any, encoding: string, callback: (error?: Error, data?: any) => void): void {
        const position = Run.Position.checkInstanceOf(chunk);
        this.trackers.forEach((tracker: Tracker) => {
            const newRecord = tracker.track(position);
            if (newRecord) {
                this.push(newRecord);
            }
        });
        callback();
    }
}

export class Record {
    public static checkInstanceOf(chunk: any): Record {
        if (chunk instanceof Record) {
            return chunk as Record;
        }
        throw new WrongTypeException("Record", chunk);
    }

    public readonly runMeta: Run.Meta;

    public constructor(public readonly distance: number,
                       public readonly time: number,
                       public readonly startingPosition: Run.Position,
                       public readonly measuredDistance: number) {

        this.runMeta = startingPosition.runMeta;
    }

    public isBetterThan(other?: Record) {
        if (!other) {
            return true;
        }
        if (this.distance !== other.distance) {
            throw new Error(
                "Can not compare incompatible records, current is for distance: " + this.distance +
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

class Tracker {
    private best: Record;
    private queue: Run.Position[] = [];

    public constructor(private readonly distance: number) {}

    public track(position: Run.Position): Record | undefined {
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

    private queueDistance() {
        return this.tail().distance - this.head().distance;
    }

    private extractRecord(): Record {
        return new Record(
            this.distance,
            this.tail().elapsedTime - this.head().elapsedTime,
            this.head(),
            this.queueDistance(),
        );
    }

    private tail() {
        return this.queue[this.queue.length - 1];
    }

    private head() {
        return this.queue[0];
    }
}
