#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const PositionParserStream_1 = require("./gpx/PositionParserStream");
const Records_1 = require("./record/Records");
const UpdatableRecordTableStream_1 = require("./output/UpdatableRecordTableStream");
const ConsoleUpdatableRecordTable_1 = require("./output/console/ConsoleUpdatableRecordTable");
const immutable_1 = require("immutable");
const Streams_1 = require("./util/Streams");
const program = require("commander");
program
    .version("0.1.3")
    .description("find run records in a gpx file")
    .usage("<gpx-file>")
    .arguments("<gpx-file>")
    .action(gpxFile => {
    const distances = immutable_1.List.of(100, 200, 400, 1000, 1609, 5000, 10000, 15000, 21097);
    fs.createReadStream(gpxFile, { encoding: "utf8" })
        .pipe(new PositionParserStream_1.PositionParserStream())
        .pipe(new Records_1.FindRecordsStream(distances))
        .pipe(Streams_1.randomDelay(10, 50))
        .pipe(new UpdatableRecordTableStream_1.UpdatableRecordTableStream(new ConsoleUpdatableRecordTable_1.ConsoleUpdatableRecordTable(distances, process.stdout)));
})
    .parse(process.argv);
//# sourceMappingURL=index.js.map