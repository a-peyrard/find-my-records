"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
function secondToHuman(rawSeconds) {
    const duration = moment.duration(rawSeconds, "second");
    let res = "";
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();
    let display = false;
    if (hours > 0) {
        res += hours + "h";
        display = true;
    }
    if (display || minutes > 0) {
        res += pad2(minutes) + "m";
    }
    return res + pad2(seconds) + "s";
}
exports.secondToHuman = secondToHuman;
function pad2(n) {
    if (n < 10) {
        return "0" + n;
    }
    return n;
}
//# sourceMappingURL=Time.js.map