import { Writable, WritableOptions } from "stream";
import { Record } from "../record/Records";
import { WrongTypeException } from "../util/Types";
import { Position } from "../domain/Position";
import { UpdatableRecordTable } from "./UpdatableRecordTable";
import { ConsoleUpdatableRecordTable } from "./console/ConsoleUpdatableRecordTable";

/**
 * Wrapper for UpdatableRecordTable instances, to be used as a writable stream.
 */
class UpdatableRecordTableStream extends Writable {
    constructor(private readonly table: UpdatableRecordTable, options?: WritableOptions) {
        super({ ...options, objectMode: true });

        this.table.init();
    }

    public _write(chunk: any, encoding: string, callback: (error?: Error) => void): void {
        this.table.append(UpdatableRecordTableStream.checkInstanceOfRecord(chunk));
        callback();
    }

    public _final(callback: (error?: Error) => void): void {
        this.table.seal();
        callback();
    }

    private static checkInstanceOfRecord(chunk: any): Record {
        if (chunk instanceof Record) {
            return chunk as Record;
        }
        throw new WrongTypeException("Record", chunk);
    }
}

// fixme dummy test, hard to make some unit tests :/
const stream = new UpdatableRecordTableStream(new ConsoleUpdatableRecordTable([100, 200, 400, 1000, 10000]));
for (let i = 0; i < 10; i ++) {
    setTimeout(
        () => stream.write(new Record(200, Math.random(), new Position(0, 0), 1000)),
        (i * 1000) + 400
    );
    setTimeout(
        () => stream.write(new Record(100, Math.random(), new Position(0, 0), 1000)),
        (i * 1000) + 200
    );
    setTimeout(
        () => stream.write(new Record(1000, Math.random(), new Position(0, 0), 1000)),
        (i * 1000) + 1000
    );
    setTimeout(
        () => stream.write(new Record(400, Math.random(), new Position(0, 0), 1000)),
        (i * 1000) + 500
    );
}
setTimeout(
    () => stream.end(),
    12000
);
