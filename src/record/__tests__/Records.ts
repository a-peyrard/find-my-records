import { List, Map } from "immutable";
import { Run } from "../../domain/Run";
import { FindRecordsStream, Record } from "../Records";
import { Readable, Writable, WritableOptions } from "stream";
import { promiseStreamConsumption } from "../../util/Streams";

const dummy: Run.Meta = new Run.Meta("dummy", new Date());

class Sink extends Writable {
    public readonly records: Map<number, Record> = Map<number, Record>().asMutable();

    constructor(opts?: WritableOptions) {
        super({ ...opts, objectMode: true });
    }

    public _write(chunk: any, encoding: string, done: (error?: Error) => void): void {
        const record = Record.checkInstanceOf(chunk);
        this.records.set(record.distance, record);
        done();
    }
}

describe("FindRecordsStream", () => {
    it("should not extract anything if there is no record", () => {
        // GIVEN
        const positionsStream = new Readable({ objectMode: true });
        positionsStream.push(new Run.Position(dummy, 0, 0));
        positionsStream.push(new Run.Position(dummy, 10, 10));
        positionsStream.push(new Run.Position(dummy, 50, 20));
        positionsStream.push(new Run.Position(dummy, 550, 30));
        positionsStream.push(null);

        const sink = new Sink();
        return promiseStreamConsumption(
            // WHEN
            positionsStream.pipe(new FindRecordsStream(List.of(1000)))
                        .pipe(sink)
        ).then(() => {
            // THEN
            expect(sink.records.has(1000)).toBe(false);
        });
    });

    it("should extract record", () => {
        // GIVEN
        const positionsStream = new Readable({ objectMode: true });
        positionsStream.push(new Run.Position(dummy, 0, 0));
        positionsStream.push(new Run.Position(dummy, 10, 10));
        positionsStream.push(new Run.Position(dummy, 50, 20));
        positionsStream.push(new Run.Position(dummy, 500, 30));
        positionsStream.push(new Run.Position(dummy, 1000, 140));
        positionsStream.push(null);

        const sink = new Sink();
        return promiseStreamConsumption(
            // WHEN
            positionsStream.pipe(new FindRecordsStream(List.of(1000)))
                        .pipe(sink)
        ).then(() => {
            // THEN
            expect(sink.records.has(1000)).toBe(true);
            const kmRecord = sink.records.get(1000);
            expect(kmRecord.time).toBe(140);
        });
    });

    it("should extract starting position in record", () => {
        // GIVEN
        const initialPosition = new Run.Position(dummy, 0, 0);

        const positionsStream = new Readable({ objectMode: true });
        positionsStream.push(initialPosition);
        positionsStream.push(new Run.Position(dummy, 10, 10));
        positionsStream.push(new Run.Position(dummy, 50, 20));
        positionsStream.push(new Run.Position(dummy, 500, 30));
        positionsStream.push(new Run.Position(dummy, 1000, 140));
        positionsStream.push(null);

        const sink = new Sink();
        return promiseStreamConsumption(
            // WHEN
            positionsStream.pipe(new FindRecordsStream(List.of(1000)))
                        .pipe(sink)
        ).then(() => {
            // THEN
            expect(sink.records.has(1000)).toBe(true);
            const halfKmRecord = sink.records.get(1000);
            expect(halfKmRecord.startingPosition).toBe(initialPosition);
        });
    });

    it("should extract multiple record", () => {
        // GIVEN
        const positionsStream = new Readable({ objectMode: true });
        positionsStream.push(new Run.Position(dummy, 0, 0));
        positionsStream.push(new Run.Position(dummy, 10, 10));
        positionsStream.push(new Run.Position(dummy, 50, 20));
        positionsStream.push(new Run.Position(dummy, 500, 30));
        positionsStream.push(new Run.Position(dummy, 1000, 140));
        positionsStream.push(null);

        const sink = new Sink();
        return promiseStreamConsumption(
            // WHEN
            positionsStream.pipe(new FindRecordsStream(List.of(500, 1000)))
                        .pipe(sink)
        ).then(() => {
            // THEN
            expect(sink.records.has(500)).toBe(true);
            const halfKmRecord = sink.records.get(500);
            expect(halfKmRecord.time).toBe(30);

            expect(sink.records.has(1000)).toBe(true);
            const kmRecord = sink.records.get(1000);
            expect(kmRecord.time).toBe(140);
        });
    });

    it("should find best match for record", () => {
        // GIVEN
        const pivot = new Run.Position(dummy, 1050, 140);
        const positionsStream = new Readable({ objectMode: true });
        positionsStream.push(new Run.Position(dummy, 0, 0));
        positionsStream.push(new Run.Position(dummy, 10, 10));
        positionsStream.push(new Run.Position(dummy, 50, 20));
        positionsStream.push(new Run.Position(dummy, 500, 30));
        positionsStream.push(pivot);
        positionsStream.push(new Run.Position(dummy, 1090, 141));
        positionsStream.push(new Run.Position(dummy, 1190, 142));
        positionsStream.push(new Run.Position(dummy, 1290, 143));
        positionsStream.push(new Run.Position(dummy, 1390, 144));
        positionsStream.push(new Run.Position(dummy, 1590, 145));
        positionsStream.push(new Run.Position(dummy, 1890, 146));
        positionsStream.push(new Run.Position(dummy, 2070, 147));
        positionsStream.push(new Run.Position(dummy, 2090, 167));
        positionsStream.push(new Run.Position(dummy, 2200, 200));
        positionsStream.push(null);

        const sink = new Sink();
        return promiseStreamConsumption(
            // WHEN
            positionsStream.pipe(new FindRecordsStream(List.of(1000)))
                        .pipe(sink)
        ).then(() => {
            // THEN
            expect(sink.records.has(1000)).toBe(true);
            const kmRecord = sink.records.get(1000);
            expect(kmRecord.time).toBe(7);
            expect(kmRecord.startingPosition).toBe(pivot);
        });
    });

    it("should find best match for by removing from tail", () => {
        // GIVEN
        const startRecord = new Run.Position(dummy, 15, 15);
        const positionsStream = new Readable({ objectMode: true });
        positionsStream.push(new Run.Position(dummy, 0, 0));
        positionsStream.push(new Run.Position(dummy, 10, 10));
        positionsStream.push(new Run.Position(dummy, 11, 11));
        positionsStream.push(new Run.Position(dummy, 12, 12));
        positionsStream.push(new Run.Position(dummy, 13, 13));
        positionsStream.push(new Run.Position(dummy, 14, 14));
        positionsStream.push(startRecord);
        positionsStream.push(new Run.Position(dummy, 115, 45));
        positionsStream.push(new Run.Position(dummy, 118, 234));
        positionsStream.push(new Run.Position(dummy, 120, 800));
        positionsStream.push(null);

        const sink = new Sink();
        return promiseStreamConsumption(
            // WHEN
            positionsStream.pipe(new FindRecordsStream(List.of(100)))
                        .pipe(sink)
        ).then(() => {
            // THEN
            const record = sink.records.get(100);
            expect(record.time).toBe(30);
            expect(record.startingPosition).toBe(startRecord);
        });
    });

    it("should get real record measured distance", () => {
        // GIVEN
        const positionsStream = new Readable({ objectMode: true });
        positionsStream.push(new Run.Position(dummy, 0, 0));
        positionsStream.push(new Run.Position(dummy, 10, 10));
        positionsStream.push(new Run.Position(dummy, 50, 20));
        positionsStream.push(new Run.Position(dummy, 500, 30));
        positionsStream.push(new Run.Position(dummy, 1090, 141));
        positionsStream.push(new Run.Position(dummy, 2200, 200));
        positionsStream.push(new Run.Position(dummy, 2500, 300));
        positionsStream.push(null);

        const sink = new Sink();
        return promiseStreamConsumption(
            // WHEN
            positionsStream.pipe(new FindRecordsStream(List.of(2000)))
                        .pipe(sink)
        ).then(() => {
            // THEN
            expect(sink.records.has(2000)).toBe(true);
            const kmRecord = sink.records.get(2000);
            expect(kmRecord.time).toBe(180);
            expect(kmRecord.measuredDistance).toBe(2150);
        });
    });

    it("should contains run's metadata", () => {
        // GIVEN
        const positionsStream = new Readable({ objectMode: true });
        positionsStream.push(new Run.Position(dummy, 0, 0));
        positionsStream.push(new Run.Position(dummy, 10, 10));
        positionsStream.push(new Run.Position(dummy, 50, 20));
        positionsStream.push(new Run.Position(dummy, 500, 30));
        positionsStream.push(new Run.Position(dummy, 1090, 141));
        positionsStream.push(new Run.Position(dummy, 2200, 200));
        positionsStream.push(new Run.Position(dummy, 2500, 300));
        positionsStream.push(null);

        const sink = new Sink();
        return promiseStreamConsumption(
            // WHEN
            positionsStream.pipe(new FindRecordsStream(List.of(1000)))
                        .pipe(sink)
        ).then(() => {
            // THEN
            expect(sink.records.has(1000)).toBe(true);
            expect(sink.records.get(1000).runMeta.label).toBe(dummy.label);
            expect(sink.records.get(1000).runMeta.date).toBe(dummy.date);
        });
    });
});
