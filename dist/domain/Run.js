"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid = require("uuid/v4");
const Types_1 = require("../util/Types");
class Run {
    constructor(meta, positions) {
        this.meta = meta;
        this.positions = positions;
    }
}
exports.Run = Run;
(function (Run) {
    class Meta {
        constructor(label, date) {
            this.label = label;
            this.date = date;
            this.id = uuid();
        }
    }
    Run.Meta = Meta;
    class Position {
        constructor(runMeta, distance, elapsedTime) {
            this.runMeta = runMeta;
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
    Run.Position = Position;
})(Run = exports.Run || (exports.Run = {}));
//# sourceMappingURL=Run.js.map