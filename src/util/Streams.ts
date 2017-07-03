export function promiseStreamConsumption(stream: NodeJS.EventEmitter) {
    return new Promise((resolve, reject) => {
        stream
            .on("finish", () => resolve())
            .on("error", error => reject(error));
    });
}
