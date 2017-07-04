import { Readable, Transform, Writable } from "stream";
import { merge, promiseStreamConsumption } from "../Streams";

class Sink extends Writable {
    public readonly words: string[] = [];
    private finalized: boolean = false;

    public _write(chunk: any, encoding: string, done: (error?: Error) => void): void {
        if (!this.finalized) {
            this.words.push(chunk.toString("utf8"));
        }
        done();
    }

    public _final(done: (error?: Error) => void) {
        this.finalized = true;
        done();
    }
}

class AsyncStream extends Transform {
    public _transform(chunk: any, encoding: string, done: (error?: Error, chunk?: any) => void): void {
        setTimeout(() => done(null, chunk));
    }
}

describe("merge", () => {
    it("should merge stream", () => {
        // GIVEN
        const stream1 = new Readable();
        stream1.push("foo");
        stream1.push(null);
        const stream2 = new Readable();
        stream2.push("bar");
        stream2.push(null);

        const sink = new Sink();
        return promiseStreamConsumption(
            // WHEN
            merge([stream1, stream2]).into(sink)
        ).then(() => {
            // THEN
            expect(sink.words).toContain("foo");
            expect(sink.words).toContain("bar");
        });
    });

    it("should handle multiple sizes of stream", () => {
        // GIVEN
        const stream1 = new Readable();
        stream1.push(null);
        const stream2 = new Readable();
        stream2.push("foo");
        stream2.push("bar");
        stream2.push(null);

        const sink = new Sink();
        const sinkFailure = new Sink();

        return Promise.all([
            // WHEN
            promiseStreamConsumption(
                merge([stream1.pipe(new AsyncStream()), stream2.pipe(new AsyncStream())])
                    .into(sink)
            ),
            // dummy multiple stream piped into same output
            promiseStreamConsumption(stream1.pipe(new AsyncStream()).pipe(sinkFailure)),
            promiseStreamConsumption(stream2.pipe(new AsyncStream()).pipe(sinkFailure))
        ]).then(() => {
            // THEN
            expect(sink.words).toContain("foo");
            expect(sink.words).toContain("bar");

            expect(sinkFailure.words).toHaveLength(0);
        });
    });
});
