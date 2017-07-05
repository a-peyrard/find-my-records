"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line:no-var-requires
const geolib = require("geolib");
class GpsPoint {
    constructor(latitude, longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }
    static distance(p1, p2) {
        if (!p1) {
            return 0;
        }
        return geolib.getDistance(p1, p2);
    }
}
exports.default = GpsPoint;
//# sourceMappingURL=GpsPoint.js.map