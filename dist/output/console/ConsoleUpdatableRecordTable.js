"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const readline = require("readline");
const sprintf_js_1 = require("sprintf-js");
const moment = require("moment");
const Time_1 = require("../../util/Time");
class ConsoleUpdatableRecordTable {
    constructor(distances, out = process.stdout) {
        this.distances = distances;
        this.out = out;
        this.records = new Map();
        this.distances.forEach(distance => this.records.set(distance, undefined));
        this.lastLineIndex = this.distances.length;
    }
    init() {
        this.printTable();
        return this;
    }
    printTable() {
        this.distances.forEach(distance => {
            this.printRecord(distance, this.records.get(distance));
            this.out.write("\n");
        });
    }
    printRecord(distance, record) {
        this.out.write(sprintf_js_1.sprintf(" %s %-6s = %s", record ? "🎉" : "-", distance, this.formatRecord(record)));
        readline.clearLine(this.out, 1);
        readline.cursorTo(this.out, 0); // always keep cursor at x position 0
    }
    formatRecord(record) {
        if (record) {
            return sprintf_js_1.sprintf("%-15s 🏃  %-20s - %s", Time_1.secondToHuman(record.time), moment(record.runMeta.date).format("dddd, MMMM Do YYYY @ HH:mm:ss"), record.runMeta.label);
        }
        return "(no record)";
    }
    writeRecordToLine(line, record) {
        const lineDistance = this.lastLineIndex - line;
        readline.moveCursor(this.out, 0, -lineDistance);
        this.printRecord(record.distance, record);
        readline.moveCursor(this.out, 0, lineDistance); // put back cursor at position (0, 0)
    }
    append(record) {
        const index = this.distances.indexOf(record.distance);
        if (index > -1) {
            this.writeRecordToLine(index, record);
            this.records.set(record.distance, record);
        }
        return this;
    }
    seal() {
        readline.moveCursor(this.out, 0, -this.lastLineIndex);
        this.printTable();
    }
}
exports.ConsoleUpdatableRecordTable = ConsoleUpdatableRecordTable;
//# sourceMappingURL=ConsoleUpdatableRecordTable.js.map