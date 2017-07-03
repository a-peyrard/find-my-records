"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
function promiseStreamConsumption(stream) {
    return new Promise((resolve, reject) => {
        stream
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
//# sourceMappingURL=Streams.js.map