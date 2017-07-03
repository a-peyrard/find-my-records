// tslint:disable-next-line:no-var-requires
const geolib = require("geolib");
import PositionAsDecimal = geolib.PositionAsDecimal;

export default class GpsPoint {
    constructor(public readonly latitude: number,
                public readonly longitude: number) { }

    public static distance(p1: GpsPoint, p2: GpsPoint) {
        if (!p1) {
            return 0;
        }
        return geolib.getDistance(p1, p2);
    }
}
