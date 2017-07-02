#!/usr/bin/env node
import parse from "./gpx/Parser";
import { Record, Records } from "./record/Records";
import { Run } from "./domain/Run";
import { secondToHuman } from "./util/Time";

if (process.argv.length < 3) {
    console.error("enter the path to a gpx file!");
    process.exit(1);
}

const filePath = process.argv[2];
parse(filePath)
    .catch(error => {
        throw new Error(
            "[ERROR]: Unable to parse the gpx file: " + filePath + ", check that file is a regular gpx file!\n" +
            error.message || error
        );
    })
    .then(printRunRecords)
    .catch(error => console.log(error.message || error));

function printRunRecords(run: Run) {
    console.log("=> RUN: '" + run.meta.label + "' (" + run.meta.date + ")");

    console.log(" * measured positions: " + run.positions.size);
    console.log(" * mean distance between position: " + (run.positions.last().distance / run.positions.size) + "m");

    const records = Records.from(run.positions)
                           .distance(100)
                           .distance(200)
                           .distance(400)
                           .distance(1000)
                           .distance(1609) // miles (crazy unit)
                           .distance(5000)
                           .distance(10000)
                           .distance(15000)
                           .distance(21097) // half
                           .extract();
    if (records.isEmpty()) {
        console.log("no records found 😢");
    }
    records.sort((r1, r2) => r1.distance - r2.distance)
           .forEach(printRecord);
}

function printRecord(record: Record) {
    console.log("\t- 🎉 record for " + record.distance + "m in " +
        secondToHuman(record.time) +
        " (real measured distance: " + record.measuredDistance +
        ", measured after " + record.startingPosition.distance + "m)");
}
