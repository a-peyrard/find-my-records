"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class WrongTypeException extends Error {
    constructor(expectedType, obj) {
        super(`The specified object does not have the expected type: ${expectedType} but ${typeof obj}`);
    }
}
exports.WrongTypeException = WrongTypeException;
//# sourceMappingURL=Types.js.map