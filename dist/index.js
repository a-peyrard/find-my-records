#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Parser_1 = require("./gpx/Parser");
const Records_1 = require("./record/Records");
const moment = require("moment");
if (process.argv.length < 3) {
    console.error("enter the path to a gpx file!");
    process.exit(1);
}
const filePath = process.argv[2];
Parser_1.default(filePath)
    .catch(error => {
    throw new Error("[ERROR]: Unable to parse the gpx file: " + filePath + ", check that file is a regular gpx file!\n" +
        error.message || error);
})
    .then(printRunRecords)
    .catch(error => console.log(error.message || error));
function printRunRecords(run) {
    console.log("=> RUN: '" + run.label + "' (" + run.date + ")");
    console.log(" * measured positions: " + run.positions.size);
    console.log(" * mean distance between position: " + (run.positions.last().distance / run.positions.size) + "m");
    const records = Records_1.Records.from(run.positions)
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
function printRecord(record) {
    console.log("\t- 🎉 record for " + record.distance + "m in " +
        secondToHuman(record.time) +
        " (real measured distance: " + record.measuredDistance +
        ", measured after " + record.startingPosition.distance + "m)");
}
function secondToHuman(rawSeconds) {
    const duration = moment.duration(rawSeconds, "second");
    let res = "";
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();
    let display = false;
    if (hours > 0) {
        res += hours + "h";
        display = true;
    }
    if (display || minutes > 0) {
        res += pad2(minutes) + "m";
    }
    return res + pad2(seconds) + "s";
}
function pad2(n) {
    if (n < 10) {
        return "0" + n;
    }
    return n;
}
//# sourceMappingURL=index.js.map