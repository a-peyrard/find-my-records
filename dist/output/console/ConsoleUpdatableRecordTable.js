"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const readline = require("readline");
class ConsoleUpdatableRecordTable {
    constructor(distances, out = process.stdout) {
        this.distances = distances;
        this.out = out;
        this.records = new Map();
        this.distances.forEach(distance => this.records.set(distance, undefined));
    }
    init() {
        this.printTable();
        readline.moveCursor(this.out, 0, -this.distances.length); // put back cursor at position (0, 0)
        return this;
    }
    printTable() {
        this.distances.forEach(distance => {
            this.printRecord(distance, this.records.get(distance));
            this.out.write("\n");
        });
    }
    printRecord(distance, record) {
        const buffer = ` -> ${distance} = ${record ? record.time : ""}`;
        this.out.write(buffer);
        readline.cursorTo(this.out, 0); // always keep cursor at x position 0
    }
    writeRecordToLine(line, record) {
        readline.moveCursor(this.out, 0, line);
        this.printRecord(record.distance, record);
        readline.moveCursor(this.out, 0, -line); // put back cursor at position (0, 0)
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
        this.printTable();
    }
}
exports.ConsoleUpdatableRecordTable = ConsoleUpdatableRecordTable;
//# sourceMappingURL=ConsoleUpdatableRecordTable.js.map