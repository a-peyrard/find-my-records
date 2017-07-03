#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const PositionParserStream_1 = require("./gpx/PositionParserStream");
const Records_1 = require("./record/Records");
const UpdatableRecordTableStream_1 = require("./output/UpdatableRecordTableStream");
const ConsoleUpdatableRecordTable_1 = require("./output/console/ConsoleUpdatableRecordTable");
const immutable_1 = require("immutable");
if (process.argv.length < 3) {
    console.error("enter the path to a gpx file!");
    process.exit(1);
}
const filePath = process.argv[2];
const distances = immutable_1.List.of(100, 200, 400, 1000, 1609, 5000, 10000, 15000, 21097);
fs.createReadStream(filePath, { encoding: "utf8" })
    .pipe(new PositionParserStream_1.PositionParserStream())
    .pipe(new Records_1.FindRecordsStream(distances))
    .pipe(new UpdatableRecordTableStream_1.UpdatableRecordTableStream(new ConsoleUpdatableRecordTable_1.ConsoleUpdatableRecordTable(distances, process.stdout)));
//# sourceMappingURL=index.js.map