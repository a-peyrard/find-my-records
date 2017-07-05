import { Transform, TransformOptions } from "stream";

export function promiseStreamConsumption(stream: NodeJS.EventEmitter) {
    return new Promise((resolve, reject) => {
        stream
            .setMaxListeners(stream.getMaxListeners() + 1)
            .on("finish", () => resolve())
            .on("error", error => reject(error));
    });
}

export function randomDelay(min: number, max: number) {
    return new RandomDelay(min, max);
}

class RandomDelay extends Transform {

    constructor(private readonly minDelay: number, private readonly maxDelay: number, options?: TransformOptions) {
        super({ ...options, objectMode: true });
    }

    private generateNewDelay() {
        return Math.floor(
            this.minDelay + (this.maxDelay - this.minDelay) * Math.random()
        );
    }

    public _transform(chunk: any, encoding: string, done: (error?: Error, data?: any) => void): void {
        setTimeout(
            () => {
                this.push(chunk);
                done();
            },
            this.generateNewDelay()
        );
    }
}

/**
 * Merges the specified inputs, and return the merger.
 *
 * Note that this operation is lazy, and `into` has to be called, to provide the destination.
 * This is intended to be used like this:
 * ```
 * merge(inputs).into(output)
 * ```
 * The output stream will then be returned, so fluent piping could be added:
 * ```
 * merge(inputs).into(output).pipe(...).pipe(...)
 * ```
 *
 * @param {Iterable<NodeJS.ReadableStream>} streams The input streams
 * @returns {Merger} The merger object, where `into` has to be called.
 */
export function merge(streams: Iterable<NodeJS.ReadableStream>) {
    return new Merger(streams);
}

/*
    This simple class permits to merge some input streams, into the same output.

    It avoid the verbosity and potential pitfall of declaring the right option
    on pipe: `{ end: false }`, and also to manage the max listener option.
    Last but not least it permits to send the right `end` to the output stream as
    soon as all the inputs are done.
 */
class Merger {
    constructor(readonly inputs: Iterable<NodeJS.ReadableStream>) {}

    public into<T extends NodeJS.WritableStream>(output: T): T {
        let count = 0;
        let end = 0;
        for (const input of this.inputs) {
            input.on("end", () => {
                if (++end >= count) {
                    output.end();
                }
            });
            input.pipe(
                output.setMaxListeners(++count),
                { end: false }
            );
        }
        return output.setMaxListeners(output.getMaxListeners() + 10);
    }
}

export function peek(consumer: (chunk: any) => void) {
    return new PeekerStream(consumer);
}

class PeekerStream extends Transform {
    constructor(private readonly consumer: (chunk: any) => void, opts?: TransformOptions) {
        super({ ...opts, objectMode: true });
    }

    public _transform(chunk: any, encoding: string, done: (error?: Error | null, chunk?: any) => void): void {
        this.consumer(chunk);
        done(null, chunk);
    }
}
