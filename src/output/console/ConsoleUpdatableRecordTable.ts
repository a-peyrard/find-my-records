import { UpdatableRecordTable } from "../UpdatableRecordTable";
import { Record } from "../../record/Records";
import * as readline from "readline";
import Socket = NodeJS.Socket;

export class ConsoleUpdatableRecordTable implements UpdatableRecordTable {

    private readonly records: Map<number, Record | undefined> = new Map();

    constructor(readonly distances: number[], readonly out: Socket = process.stdout) {
        this.distances.forEach(distance => this.records.set(distance, undefined));
    }

    public init() {
        this.printTable();
        readline.moveCursor(this.out, 0, -this.distances.length); // put back cursor at position (0, 0)

        return this;
    }

    private printTable() {
        this.distances.forEach(distance => {
            this.printRecord(distance, this.records.get(distance));
            this.out.write("\n");
        });
    }

    private printRecord(distance: number, record?: Record) {
        const buffer = ` -> ${distance} = ${record ? record!.time : ""}`;
        this.out.write(buffer);
        readline.cursorTo(this.out, 0); // always keep cursor at x position 0
    }

    private writeRecordToLine(line: number, record: Record) {
        readline.moveCursor(this.out, 0, line);
        this.printRecord(record.distance, record);
        readline.moveCursor(this.out, 0, -line); // put back cursor at position (0, 0)
    }

    public append(record: Record): ConsoleUpdatableRecordTable {
        const index = this.distances.indexOf(record.distance);
        if (index > -1) {
            this.writeRecordToLine(index, record);
            this.records.set(record.distance, record);
        }

        return this;
    }

    public seal() {
        this.printTable();
    }
}
