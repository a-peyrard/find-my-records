#!/usr/bin/env node

import * as fs from "fs";
import { PositionParserStream } from "./gpx/PositionParserStream";
import { FindRecordsStream, RecordsAggregatorStream } from "./record/Records";
import { UpdatableRecordTableStream } from "./output/UpdatableRecordTableStream";
import { ConsoleUpdatableRecordTable } from "./output/console/ConsoleUpdatableRecordTable";
import { List } from "immutable";
import * as program from "commander";
import { merge, peek } from "./util/Streams";
import * as moment from "moment";

program
    .version("0.1.3")
    .description("find run records in a gpx file")
    .usage("<gpx-file...>")
    .arguments("<gpx-file...>")
    .action((gpxFiles: string[]) => {
        const start = moment();

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
        const recordTable = new ConsoleUpdatableRecordTable(distances, process.stdout);
        merge(gpxFiles.map(
            gpxFile => fs.createReadStream(gpxFile, { encoding: "utf8" })
                         .pipe(new PositionParserStream())
                         .pipe(peek(() => recordTable.tick()))
                         .pipe(new FindRecordsStream(distances))
        ))
            .into(new RecordsAggregatorStream())
            .pipe(new UpdatableRecordTableStream(recordTable))
            .on("finish", () => {
                process.stdout.write(`🚀  in ${moment().diff(start)}ms\n`);
            });
    })
    .parse(process.argv);
