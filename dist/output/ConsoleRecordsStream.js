"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const Records_1 = require("../record/Records");
const Types_1 = require("../util/Types");
class ConsoleRecordsStream extends stream_1.Writable {
    constructor(options) {
        super(options);
    }
    _write(chunk, encoding, callback) {
        const record = this.checkInstanceOfRecord(chunk);
        super._write(chunk, encoding, callback);
    }
    checkInstanceOfRecord(chunk) {
        if (chunk instanceof Records_1.Record) {
            return chunk;
        }
        throw new Types_1.WrongTypeException('Record', chunk);
    }
}
//# sourceMappingURL=UpdatableRecordTableStream.js.map