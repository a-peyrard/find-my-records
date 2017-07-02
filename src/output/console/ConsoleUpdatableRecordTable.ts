import { UpdatableRecordTable } from "../UpdatableRecordTable";
import { Record } from "../../record/Records";
import * as readline from "readline";
import { sprintf } from "sprintf-js";
import Socket = NodeJS.Socket;
import * as moment from "moment";
import { secondToHuman } from "../../util/Time";

export class ConsoleUpdatableRecordTable implements UpdatableRecordTable {

    private readonly lastLineIndex: number;
    private readonly records: Map<number, Record | undefined> = new Map();

    constructor(readonly distances: number[], readonly out: Socket = process.stdout) {
        this.distances.forEach(distance => this.records.set(distance, undefined));
        this.lastLineIndex = this.distances.length;
    }

    public init() {
        this.printTable();

        return this;
    }

    private printTable() {
        this.distances.forEach(distance => {
            this.printRecord(distance, this.records.get(distance));
            this.out.write("\n");
        });
    }

    private printRecord(distance: number, record?: Record) {
        this.out.write(sprintf(
            " %s %-6s = %s",
            record ? "🎉" : "-",
            distance,
            this.formatRecord(record)
        ));
        readline.clearLine(this.out, 1);
        readline.cursorTo(this.out, 0); // always keep cursor at x position 0
    }

    private formatRecord(record?: Record) {
        if (record) {
            return sprintf(
                "%-15s 🏃  %-20s - %s",
                secondToHuman(record!.time),
                moment(record!.runMeta.date).format("dddd, MMMM Do YYYY @ HH:mm:ss"),
                record!.runMeta.label,
            );
        }
        return "(no record)";
    }

    private writeRecordToLine(line: number, record: Record) {
        const lineDistance = this.lastLineIndex - line;
        readline.moveCursor(this.out, 0, -lineDistance);
        this.printRecord(record.distance, record);
        readline.moveCursor(this.out, 0, lineDistance); // put back cursor at position (0, 0)
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
        readline.moveCursor(this.out, 0, -this.lastLineIndex);
        this.printTable();
    }
}
