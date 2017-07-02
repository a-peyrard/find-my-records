import { Writable, WritableOptions } from "stream";
import { Record } from "../record/Records";
import { UpdatableRecordTable } from "./UpdatableRecordTable";

/**
 * Wrapper for UpdatableRecordTable instances, to be used as a writable stream.
 */
export class UpdatableRecordTableStream extends Writable {
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
