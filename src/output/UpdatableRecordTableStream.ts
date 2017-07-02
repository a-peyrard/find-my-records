import { Writable, WritableOptions } from "stream";
import { Record } from "../record/Records";
import { Run } from "../domain/Run";
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
        this.table.append(Record.checkInstanceOf(chunk));
        callback();
    }

    public _final(callback: (error?: Error) => void): void {
        this.table.seal();
        callback();
    }
}

// fixme dummy test, hard to make some unit tests :/
const meta = new Run.Meta("dummy", new Date());
const stream = new UpdatableRecordTableStream(new ConsoleUpdatableRecordTable([100, 200, 400, 1000, 10000]));
for (let i = 0; i < 10; i ++) {
    setTimeout(
        () => stream.write(new Record(200, Math.random(), new Run.Position(meta, 0, 0), 1000)),
        (i * 1000) + 400
    );
    setTimeout(
        () => stream.write(new Record(100, Math.random(), new Run.Position(meta, 0, 0), 1000)),
        (i * 1000) + 200
    );
    setTimeout(
        () => stream.write(new Record(1000, Math.random(), new Run.Position(meta, 0, 0), 1000)),
        (i * 1000) + 1000
    );
    setTimeout(
        () => stream.write(new Record(400, Math.random(), new Run.Position(meta, 0, 0), 1000)),
        (i * 1000) + 500
    );
}
setTimeout(
    () => stream.end(),
    12000
);
