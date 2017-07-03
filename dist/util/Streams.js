"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function promiseStreamConsumption(stream) {
    return new Promise((resolve, reject) => {
        stream
            .on("finish", () => resolve())
            .on("error", error => reject(error));
    });
}
exports.promiseStreamConsumption = promiseStreamConsumption;
//# sourceMappingURL=Streams.js.map