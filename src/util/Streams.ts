import { Transform } from "stream";
import { TransformOptions } from "babel-core";

export function promiseStreamConsumption(stream: NodeJS.EventEmitter) {
    return new Promise((resolve, reject) => {
        stream
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
