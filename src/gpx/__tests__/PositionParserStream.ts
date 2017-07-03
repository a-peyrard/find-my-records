import * as moment from "moment";
import * as fs from "fs";
import { PositionParserStream } from "../PositionParserStream";
import { Writable, WritableOptions } from "stream";
import { Run } from "../../domain/Run";
import { promiseStreamConsumption } from "../../util/Streams";

const GPX_FILES_PREFIX = "src/gpx/__tests__";

class PositionsSink extends Writable {
    public positions: Run.Position[] = [];

    constructor(options?: WritableOptions) {
        super({ ...options, objectMode: true });
    }

    public _write(chunk: any, encoding: string, done: (error?: Error) => void): void {
        this.positions.push(Run.Position.checkInstanceOf(chunk));
        done();
    }
}

describe("PositionParseStream", () => {
    it("should manage non gpx file", () => {
        const sink = new PositionsSink();
        return promiseStreamConsumption(
            fs.createReadStream(GPX_FILES_PREFIX + "/gpx-files/empty.gpx")
              .pipe(new PositionParserStream())
              .pipe(sink)
        ).then(() => {
            expect(sink.positions).toHaveLength(0);
        });
    });

    it("should extract 'basic' run", () => {
        const sink = new PositionsSink();

        expect.assertions(17);
        return promiseStreamConsumption(
            fs.createReadStream(GPX_FILES_PREFIX + "/gpx-files/basic.gpx")
              .pipe(new PositionParserStream())
              .pipe(sink)
        ).then(() => {
            expect(sink.positions.length).toBe(4);

            const first = sink.positions[0];
            expect(first.distance).toBe(0);
            expect(first.elapsedTime).toBe(0);
            expect(first.runMeta.label).toBe("San Francisco Running");
            expect(first.runMeta.date.getTime()).toBe(moment("2017-06-19T01:21:45.000Z").valueOf());

            const second = sink.positions[1];
            expect(second.distance).toBe(18);
            expect(second.elapsedTime).toBe(9);
            expect(second.runMeta.label).toBe("San Francisco Running");
            expect(second.runMeta.date.getTime()).toBe(moment("2017-06-19T01:21:45.000Z").valueOf());

            const third = sink.positions[2];
            expect(third.distance).toBe(21);
            expect(third.elapsedTime).toBe(11);
            expect(third.runMeta.label).toBe("San Francisco Running");
            expect(third.runMeta.date.getTime()).toBe(moment("2017-06-19T01:21:45.000Z").valueOf());

            const fourth = sink.positions[3];
            expect(fourth.distance).toBe(23);
            expect(fourth.elapsedTime).toBe(12);
            expect(fourth.runMeta.label).toBe("San Francisco Running");
            expect(fourth.runMeta.date.getTime()).toBe(moment("2017-06-19T01:21:45.000Z").valueOf());
        });
    });
});
