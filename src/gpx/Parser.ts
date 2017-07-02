import * as fs from "fs";
import * as moment from "moment";
import GpsPoint from "../domain/GpsPoint";
import * as pify from "pify";
import * as xml2js from "xml2js";
import { List } from "immutable";
import { Run } from "../domain/Run";
import { isNullOrUndefined } from "util";

export default function parse(filePath: string) {
    return pify(fs.readFile)(filePath, "utf8")
        .then(data => pify(new xml2js.Parser().parseString)(data))
        /*
         <gpx creator="StravaGPX" (...)>
         <metadata>
         <time>2017-06-19T01:21:45Z</time>
         </metadata>
         <trk>
         (...)
         </trk>
         </gpx>
         */
        .then((data: any) => {
            ensureTagExists(data, "gpx");
            return {
                date: moment(data.gpx.metadata[0].time[0]).toDate(),
                unparsedTrack: data.gpx.trk
            };
        })
        /*
         <trk>
         <name>Fractionné en montée #MyMile</name>
         <trkseg>
         (...)
         </trkseg>
         </trk>
         */
        .then((data: any) => {
            ensureTagExists(data, "unparsedTrack");
            return {
                runMeta: new Run.Meta(data.unparsedTrack[0].name[0], data.date),
                unparsedPoints: data.unparsedTrack[0].trkseg[0].trkpt
            };
        })
        /*
         <trkpt lat="37.7445970" lon="-122.4183430">
         <ele>55.6</ele>
         <time>2017-06-19T01:21:45Z</time>
         <extensions>
         <gpxtpx:TrackPointExtension>
         <gpxtpx:hr>105</gpxtpx:hr>
         <gpxtpx:cad>61</gpxtpx:cad>
         </gpxtpx:TrackPointExtension>
         </extensions>
         </trkpt>
         <trkpt lat="37.7444560" lon="-122.4184510">
         <ele>57.9</ele>
         <time>2017-06-19T01:21:54Z</time>
         (...)
         </trkpt>
         (...)
         (...)
         */
        .then((data: any) => new Run(
            data.runMeta,
            extractPositions(data)
        ));
}

function ensureTagExists(data: any, tag: string) {
    if (isNullOrUndefined(data[tag])) {
        throw new Error("unable to find the tag [" + tag + "]");
    }
}

/*
    extracts from an array of trkpt json objects, a list of positions
 */
function extractPositions(
    { runMeta, unparsedPoints }: { runMeta: Run.Meta, unparsedPoints: any[] }): List<Run.Position> {

    const stack: Run.Position[] = [];

    let currentDistance = 0;
    let lastPoint = trkptToGpsPoint(unparsedPoints[0]);
    const startTime = moment(unparsedPoints[0].time[0]);

    for (let i = 1; i < unparsedPoints.length; i++) {
        const unparsedPoint = unparsedPoints[i];
        const cur = trkptToGpsPoint(unparsedPoint);
        currentDistance += GpsPoint.distance(lastPoint, cur);

        stack.push(
            toPosition(runMeta, currentDistance, unparsedPoint.time[0], startTime)
        );

        lastPoint = cur;
    }
    return List(stack);
}

function trkptToGpsPoint(trkpt: any) {
    return new GpsPoint(trkpt.$.lat, trkpt.$.lon);
}

function toPosition(runMeta: Run.Meta, distanceFromStart: number, rawTime: string, startTime: moment.Moment) {
    return new Run.Position(
        runMeta,
        distanceFromStart,
        moment(rawTime).diff(startTime) / 1000
    );
}
