import { Transform, TransformOptions } from "stream";
import * as sax from "sax";
import { arraysEquals } from "../util/Arrays";
import * as moment from "moment";
import GpsPoint from "../domain/GpsPoint";
import { Run } from "../domain/Run";

interface Node {
    attributes: any;
    isSelfClosing: boolean;
    name: string;
}

interface TextMatcher<T> {
    path: string[];
    consumer: (val: T) => void;
}

const HAILE_BEST_KM_IN_SEC = 140;

export class PositionParserStream extends Transform {

    private saxStream: sax.SAXStream;
    private currentPath: string[] = [];

    private readonly runMeta: any = {};
    private currentPosition: any;
    private lastPoint: GpsPoint;
    private lastSavedPosition: Run.Position;
    private totalDistance = 0;
    private startTime: moment.Moment;

    constructor(options?: TransformOptions) {
        super({ ...options, objectMode: true });

        this.saxStream = sax.createStream(false, { lowercase: true });

        this.saxStream.on("opentag", this.onOpenTag.bind(this));
        this.saxStream.on("closetag", this.onCloseTag.bind(this));
        this.saxStream.on("text", this.onText.bind(this));
    }

    private onOpenTag(node: Node) {
        if (!node.isSelfClosing) {
            this.currentPath.push(node.name);
        }
        this.pathMatcher(
            node,
            {
                path: ["gpx", "trk", "trkseg", "trkpt"],
                consumer: n => {
                    const cur = new GpsPoint(n.attributes.lat, n.attributes.lon);
                    const distanceFromLast = GpsPoint.distance(this.lastPoint, cur);
                    this.currentPosition = {
                        runMeta: this.runMeta,
                        distanceFromLast
                    };
                    this.lastPoint = cur;
                }
            }
        );
    }

    private isNotBetterThanHaile() {
        if (!this.lastSavedPosition) {
            return true;
        }
        const metersRun = this.currentPosition.distanceFromLast;
        const time = this.currentPosition.elapsedTime - this.lastSavedPosition.elapsedTime;
        return time * (1000 / metersRun) > HAILE_BEST_KM_IN_SEC;
    }

    private onCloseTag(tagName: string) {
        this.pathMatcher(
            tagName,
            {
                path: ["gpx", "trk", "trkseg", "trkpt"],
                consumer: () => {
                    if (this.isNotBetterThanHaile()) {
                        this.totalDistance += this.currentPosition.distanceFromLast;
                        this.push(
                            new Run.Position(
                                new Run.Meta(
                                    this.runMeta.label,
                                    this.runMeta.date
                                ),
                                this.totalDistance,
                                this.currentPosition.elapsedTime
                            )
                        );
                        this.lastSavedPosition = this.currentPosition;
                    }
                    delete this.currentPosition;
                }
            }
        );
        this.currentPath.pop();
    }

    private onText(text: string) {
        this.pathMatcher(
            text,
            {
                path: ["gpx", "metadata", "time"],
                consumer: t => this.runMeta.date = moment(t).toDate()
            },
            {
                path: ["gpx", "trk", "name"],
                consumer: t => this.runMeta.label = t
            },
            {
                path: ["gpx", "trk", "trkseg", "trkpt", "time"],
                consumer: rawTime => {
                    const time = moment(rawTime);
                    if (!this.startTime) {
                        this.startTime = time;
                    }
                    this.currentPosition.elapsedTime = time.diff(this.startTime) / 1000;
                }
            }
        );
    }

    private pathMatcher<T>(val: T, ...matchers: Array<TextMatcher<T>>) {
        for (const matcher of matchers) {
            if (this.checkPath(matcher.path)) {
                matcher.consumer(val);
                break;
            }
        }
    }

    private checkPath(expectedPath: string[]) {
        return arraysEquals(
            this.currentPath,
            expectedPath
        );
    }

    public _transform(chunk: any, encoding: string, callback: (error?: Error, chunk?: any) => void): void {
        this.saxStream.write(chunk);
        callback();
    }
}
