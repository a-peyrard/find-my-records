"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Types_1 = require("../util/Types");
class Position {
    constructor(distance, elapsedTime) {
        this.distance = distance;
        this.elapsedTime = elapsedTime;
    }
    static checkInstanceOf(chunk) {
        if (chunk instanceof Position) {
            return chunk;
        }
        throw new Types_1.WrongTypeException("Position", chunk);
    }
}
exports.Position = Position;
//# sourceMappingURL=Position.js.map