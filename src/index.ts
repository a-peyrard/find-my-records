#!/usr/bin/env node

import * as fs from "fs";
import { PositionParserStream } from "./gpx/PositionParserStream";
import { FindRecordsStream } from "./record/Records";
import { UpdatableRecordTableStream } from "./output/UpdatableRecordTableStream";
import { ConsoleUpdatableRecordTable } from "./output/console/ConsoleUpdatableRecordTable";
import { List } from "immutable";
import { promiseStreamConsumption } from "./util/Streams";

if (process.argv.length < 3) {
    console.error("enter the path to a gpx file!");
    process.exit(1);
}

const filePath = process.argv[2];
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

fs.createReadStream(filePath, { encoding: "utf8" })
  .pipe(new PositionParserStream())
  .pipe(new FindRecordsStream(distances))
  .pipe(new UpdatableRecordTableStream(
      new ConsoleUpdatableRecordTable(distances, process.stdout)
  ));
