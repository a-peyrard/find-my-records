import { UpdatableRecordTable } from "../UpdatableRecordTable";
import { Record } from "../../record/Records";
import * as readline from "readline";
import { sprintf } from "sprintf-js";
import Socket = NodeJS.Socket;
import * as moment from "moment";
import { secondToHuman } from "../../util/Time";
import { List } from "immutable";

export class ConsoleUpdatableRecordTable implements UpdatableRecordTable {

    private static readonly TICK_SHOW_INTERVAL = 100;
    private static readonly STATUS_BAR_HEIGHT = 2;

    private readonly lastLineIndex: number;
    private readonly records: Map<number, Record | undefined> = new Map();
    private tickCount: number = 0;

    constructor(readonly distances: List<number>, readonly out: Socket = process.stdout) {
        this.distances.forEach(distance => this.records.set(distance!, undefined));
        this.lastLineIndex = this.distances.size;
    }

    public init() {
        this.printTable();

        return this;
    }

    private printTable() {
        this.distances.forEach(distance => {
            this.printRecord(distance!, this.records.get(distance!));
            this.out.write("\n");
        });
        this.out.write(`\n${this.generateParsedPositions()}\n`);
    }

    private printRecord(distance: number, record?: Record) {
        this.out.write(sprintf(
            " %s %-6s = %s",
            record ? "+" : "-",
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
        readline.moveCursor(this.out, 0, -lineDistance - ConsoleUpdatableRecordTable.STATUS_BAR_HEIGHT);
        this.printRecord(record.distance, record);
        // put back cursor at position (0, lineDistance + tickLine)
        readline.moveCursor(this.out, 0, lineDistance + ConsoleUpdatableRecordTable.STATUS_BAR_HEIGHT);
    }

    public append(record: Record): ConsoleUpdatableRecordTable {
        const index = this.distances.indexOf(record.distance);
        if (index > -1) {
            this.writeRecordToLine(index, record);
            this.records.set(record.distance, record);
        }

        return this;
    }

    public tick(): void {
        if ((this.tickCount % ConsoleUpdatableRecordTable.TICK_SHOW_INTERVAL) === 0) {
            readline.moveCursor(this.out, 0, -1);
            this.out.write(this.generateParsedPositions());
            readline.clearLine(this.out, 1);
            readline.cursorTo(this.out, 0);
            readline.moveCursor(this.out, 0, 1); // put back cursor at position (0, lineDistance + tickLine)
        }
        this.tickCount++;
    }

    private generateParsedPositions() {
        return `🍿  parsed positions: ` + this.tickCount;
    }

    public seal() {
        readline.moveCursor(this.out, 0, -this.lastLineIndex - ConsoleUpdatableRecordTable.STATUS_BAR_HEIGHT);
        this.printTable();
    }
}
