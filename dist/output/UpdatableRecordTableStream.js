"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const Records_1 = require("../record/Records");
const Run_1 = require("../domain/Run");
const ConsoleUpdatableRecordTable_1 = require("./console/ConsoleUpdatableRecordTable");
/**
 * Wrapper for UpdatableRecordTable instances, to be used as a writable stream.
 */
class UpdatableRecordTableStream extends stream_1.Writable {
    constructor(table, options) {
        super(Object.assign({}, options, { objectMode: true }));
        this.table = table;
        this.table.init();
    }
    _write(chunk, encoding, callback) {
        this.table.append(Records_1.Record.checkInstanceOf(chunk));
        callback();
    }
    _final(callback) {
        this.table.seal();
        callback();
    }
}
// fixme dummy test, hard to make some unit tests :/
const meta = new Run_1.Run.Meta("dummy", new Date());
const stream = new UpdatableRecordTableStream(new ConsoleUpdatableRecordTable_1.ConsoleUpdatableRecordTable([100, 200, 400, 1000, 10000]));
for (let i = 0; i < 10; i++) {
    setTimeout(() => stream.write(new Records_1.Record(200, Math.random(), new Run_1.Run.Position(meta, 0, 0), 1000)), (i * 1000) + 400);
    setTimeout(() => stream.write(new Records_1.Record(100, Math.random(), new Run_1.Run.Position(meta, 0, 0), 1000)), (i * 1000) + 200);
    setTimeout(() => stream.write(new Records_1.Record(1000, Math.random(), new Run_1.Run.Position(meta, 0, 0), 1000)), (i * 1000) + 1000);
    setTimeout(() => stream.write(new Records_1.Record(400, Math.random(), new Run_1.Run.Position(meta, 0, 0), 1000)), (i * 1000) + 500);
}
setTimeout(() => stream.end(), 12000);
//# sourceMappingURL=UpdatableRecordTableStream.js.map