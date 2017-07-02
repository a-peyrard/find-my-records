"use strict";
exports.__esModule = true;
// tslint:disable-next-line:no-var-requires
var geolib = require("geolib");
var GpsPoint = (function () {
    function GpsPoint(latitude, longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }
    GpsPoint.distance = function (p1, p2) {
        return geolib.getDistance(p1, p2);
    };
    return GpsPoint;
}());
exports["default"] = GpsPoint;
//# sourceMappingURL=GpsPoint.js.map