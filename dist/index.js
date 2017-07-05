#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const PositionParserStream_1 = require("./gpx/PositionParserStream");
const Records_1 = require("./record/Records");
const UpdatableRecordTableStream_1 = require("./output/UpdatableRecordTableStream");
const ConsoleUpdatableRecordTable_1 = require("./output/console/ConsoleUpdatableRecordTable");
const immutable_1 = require("immutable");
const program = require("commander");
const Streams_1 = require("./util/Streams");
const moment = require("moment");
const stream_1 = require("stream");
const DEFAULT_DISTANCES = immutable_1.List.of(100, 200, 400, 1000, 1609, 5000, 10000, 15000, 21097);
program
    .version("0.1.3")
    .description("find run records in a gpx file")
    .usage("[options] <gpx-file...>")
    .option('--distances <distance,...>', 'distances for records (in meter), list of distances comma separated without spaces', false)
    .option('-s, --slow [flag]', 'slow down the broadcasting of records to the table (just for demo), default false', false)
    .arguments("<gpx-file...>")
    .action((gpxFiles, options) => {
    const start = moment();
    const distances = options.distances && immutable_1.List(options.distances.split(",")) || DEFAULT_DISTANCES;
    const recordTable = new ConsoleUpdatableRecordTable_1.ConsoleUpdatableRecordTable(distances, process.stdout);
    Streams_1.merge(gpxFiles.map(gpxFile => fs.createReadStream(gpxFile, { encoding: "utf8" })
        .pipe(new PositionParserStream_1.PositionParserStream())
        .pipe(Streams_1.peek(() => recordTable.tick()))
        .pipe(new Records_1.FindRecordsStream(distances))
        .pipe(options.slow ? Streams_1.randomDelay(10, 50) : new stream_1.PassThrough({ objectMode: true }))))
        .into(new Records_1.RecordsAggregatorStream())
        .pipe(new UpdatableRecordTableStream_1.UpdatableRecordTableStream(recordTable))
        .on("finish", () => {
        process.stdout.write(`🚀  in ${moment().diff(start)}ms\n`);
    });
})
    .parse(process.argv);
//# sourceMappingURL=index.js.map