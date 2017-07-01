import { Position } from "../domain/Position";
import { List, Map } from "immutable";
import { Transform, TransformOptions } from "stream";
import { WrongTypeException } from "../util/Types";

export class Records {
    public static from(positions: List<Position>) {
        return new Records(positions, List<number>());
    }

    private constructor(private readonly positions: List<Position>,
                        private readonly distances: List<number>) {}

    public distance(distance: number): Records {
        return new Records(this.positions, this.distances.push(distance));
    }

    public extract(): Map<number, Record> {
        if (this.distances.isEmpty()) {
            throw new Error("unable to calculate any record, there is no specified distances!");
        }
        const findRecords = new FindRecordsStream(this.distances);
        this.positions.forEach(position => findRecords.write(position));
        return findRecords.extractBests();
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
        const position = Position.checkInstanceOf(chunk);
        this.trackers.forEach((tracker: Tracker) => {
            const newRecord = tracker.track(position);
            if (newRecord) {
                this.push(newRecord);
            }
        });
        callback();
    }

    public extractBests(): Map<number, Record> {
        return this.trackers.toSeq()
                   .filter((tracker: Tracker) => tracker.hasRecord())
                   .map((tracker: Tracker) => tracker.getRecord())
                   .toMap();
    }
}

export class Record {
    public static checkInstanceOf(chunk: any): Record {
        if (chunk instanceof Record) {
            return chunk as Record;
        }
        throw new WrongTypeException("Record", chunk);
    }

    public constructor(public readonly distance: number,
                       public readonly time: number,
                       public readonly startingPosition: Position,
                       public readonly measuredDistance: number) {}

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
    private queue: Position[] = [];

    public constructor(private readonly distance: number) {}

    public hasRecord() {
        return this.best !== undefined;
    }

    public getRecord(): Record {
        return this.best;
    }

    public track(position: Position): Record | undefined {
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
