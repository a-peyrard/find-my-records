"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const Records_1 = require("../record/Records");
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
exports.UpdatableRecordTableStream = UpdatableRecordTableStream;
//# sourceMappingURL=UpdatableRecordTableStream.js.map