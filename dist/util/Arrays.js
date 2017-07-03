"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function arraysEquals(a, b) {
    if (a === b) {
        return true;
    }
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}
exports.arraysEquals = arraysEquals;
//# sourceMappingURL=Arrays.js.map