#!/usr/bin/env node

import * as fs from "fs";
import { PositionParserStream } from "./gpx/PositionParserStream";
import { FindRecordsStream } from "./record/Records";
import { UpdatableRecordTableStream } from "./output/UpdatableRecordTableStream";
import { ConsoleUpdatableRecordTable } from "./output/console/ConsoleUpdatableRecordTable";
import { List } from "immutable";
import { randomDelay } from "./util/Streams";
import * as program  from "commander";

program
    .version("0.1.3")
    .description("find run records in a gpx file")
    .usage("<gpx-file>")
    .arguments("<gpx-file>")
    .action(gpxFile => {
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

        fs.createReadStream(gpxFile, { encoding: "utf8" })
          .pipe(new PositionParserStream())
          .pipe(new FindRecordsStream(distances))
          .pipe(randomDelay(10, 50))
          .pipe(new UpdatableRecordTableStream(
              new ConsoleUpdatableRecordTable(distances, process.stdout)
          ));
    })
    .parse(process.argv);

