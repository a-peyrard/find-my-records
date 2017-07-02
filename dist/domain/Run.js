"use strict";
exports.__esModule = true;
var uuid = require("uuid/v4");
var Types_1 = require("../util/Types");
var Run = (function () {
    function Run(meta, positions) {
        this.meta = meta;
        this.positions = positions;
    }
    return Run;
}());
exports.Run = Run;
(function (Run) {
    var Meta = (function () {
        function Meta(label, date) {
            this.label = label;
            this.date = date;
            this.id = uuid();
        }
        return Meta;
    }());
    Run.Meta = Meta;
    var Position = (function () {
        function Position(runMeta, distance, elapsedTime) {
            this.runMeta = runMeta;
            this.distance = distance;
            this.elapsedTime = elapsedTime;
        }
        Position.checkInstanceOf = function (chunk) {
            if (chunk instanceof Position) {
                return chunk;
            }
            throw new Types_1.WrongTypeException("Position", chunk);
        };
        return Position;
    }());
    Run.Position = Position;
})(Run = exports.Run || (exports.Run = {}));
exports.Run = Run;
//# sourceMappingURL=Run.js.map