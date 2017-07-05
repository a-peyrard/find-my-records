"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
function promiseStreamConsumption(stream) {
    return new Promise((resolve, reject) => {
        stream
            .setMaxListeners(stream.getMaxListeners() + 1)
            .on("finish", () => resolve())
            .on("error", error => reject(error));
    });
}
exports.promiseStreamConsumption = promiseStreamConsumption;
function randomDelay(min, max) {
    return new RandomDelay(min, max);
}
exports.randomDelay = randomDelay;
class RandomDelay extends stream_1.Transform {
    constructor(minDelay, maxDelay, options) {
        super(Object.assign({}, options, { objectMode: true }));
        this.minDelay = minDelay;
        this.maxDelay = maxDelay;
    }
    generateNewDelay() {
        return Math.floor(this.minDelay + (this.maxDelay - this.minDelay) * Math.random());
    }
    _transform(chunk, encoding, done) {
        setTimeout(() => {
            this.push(chunk);
            done();
        }, this.generateNewDelay());
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
function merge(streams) {
    return new Merger(streams);
}
exports.merge = merge;
/*
    This simple class permits to merge some input streams, into the same output.

    It avoid the verbosity and potential pitfall of declaring the right option
    on pipe: `{ end: false }`, and also to manage the max listener option.
    Last but not least it permits to send the right `end` to the output stream as
    soon as all the inputs are done.
 */
class Merger {
    constructor(inputs) {
        this.inputs = inputs;
    }
    into(output) {
        let count = 0;
        let end = 0;
        for (const input of this.inputs) {
            input.on("end", () => {
                if (++end >= count) {
                    output.end();
                }
            });
            input.pipe(output.setMaxListeners(++count), { end: false });
        }
        return output.setMaxListeners(output.getMaxListeners() + 10);
    }
}
function peek(consumer) {
    return new PeekerStream(consumer);
}
exports.peek = peek;
class PeekerStream extends stream_1.Transform {
    constructor(consumer, opts) {
        super(Object.assign({}, opts, { objectMode: true }));
        this.consumer = consumer;
    }
    _transform(chunk, encoding, done) {
        this.consumer(chunk);
        done(null, chunk);
    }
}
//# sourceMappingURL=Streams.js.map