#!/usr/bin/env node

import * as fs from "fs";
import { PositionParserStream } from "./gpx/PositionParserStream";
import { FindRecordsStream, RecordsAggregatorStream } from "./record/Records";
import { UpdatableRecordTableStream } from "./output/UpdatableRecordTableStream";
import { ConsoleUpdatableRecordTable } from "./output/console/ConsoleUpdatableRecordTable";
import { List } from "immutable";
import * as program from "commander";

program
    .version("0.1.3")
    .description("find run records in a gpx file")
    .usage("<gpx-file...>")
    .arguments("<gpx-file...>")
    .action((gpxFiles: string[]) => {
        const distances: List<number> = List.of(
            100,
            200,
            400,
            1000,
            1609,
            5000,
            10000,
            15000,
            21097
        );

        const aggregatorStream = new RecordsAggregatorStream().setMaxListeners(0);
        const updatableRecordTableStream = new UpdatableRecordTableStream(
            new ConsoleUpdatableRecordTable(distances, process.stdout)
        );
        aggregatorStream.pipe(updatableRecordTableStream);
        gpxFiles.forEach(gpxFile =>
            fs.createReadStream(gpxFile, { encoding: "utf8" })
              .pipe(new PositionParserStream())
              .pipe(new FindRecordsStream(distances))
              .pipe(aggregatorStream, { end: false })
        );
    })
    .parse(process.argv);
