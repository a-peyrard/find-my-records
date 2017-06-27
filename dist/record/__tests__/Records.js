"use strict";
exports.__esModule = true;
var immutable_1 = require("immutable");
var Position_1 = require("../../domain/Position");
var Records_1 = require("../Records");
describe("Records", function () {
    it("should not extract anything if there is no record", function () {
        // GIVEN
        var positions = immutable_1.List([
            new Position_1.Position(0, 0),
            new Position_1.Position(10, 10),
            new Position_1.Position(50, 20),
            new Position_1.Position(550, 30)
        ]);
        // WHEN
        var records = Records_1.Records.from(positions)
            .distance(1000)
            .extract();
        // THEN
        expect(records.has(1000)).toBe(false);
    });
    it("should extract record", function () {
        // GIVEN
        var positions = immutable_1.List([
            new Position_1.Position(0, 0),
            new Position_1.Position(10, 10),
            new Position_1.Position(50, 20),
            new Position_1.Position(500, 30),
            new Position_1.Position(1000, 140)
        ]);
        // WHEN
        var records = Records_1.Records.from(positions)
            .distance(1000)
            .extract();
        // THEN
        expect(records.has(1000)).toBe(true);
        var kmRecord = records.get(1000);
        expect(kmRecord.time).toBe(140);
    });
    it("should extract starting position in record", function () {
        // GIVEN
        var initialPosition = new Position_1.Position(0, 0);
        var positions = immutable_1.List([
            initialPosition,
            new Position_1.Position(10, 10),
            new Position_1.Position(50, 20),
            new Position_1.Position(500, 30),
            new Position_1.Position(1000, 140)
        ]);
        // WHEN
        var records = Records_1.Records.from(positions)
            .distance(1000)
            .extract();
        // THEN
        expect(records.has(1000)).toBe(true);
        var halfKmRecord = records.get(1000);
        expect(halfKmRecord.startingPosition).toBe(initialPosition);
    });
    it("should extract multiple record", function () {
        // GIVEN
        var positions = immutable_1.List([
            new Position_1.Position(0, 0),
            new Position_1.Position(10, 10),
            new Position_1.Position(50, 20),
            new Position_1.Position(500, 30),
            new Position_1.Position(1000, 140)
        ]);
        // WHEN
        var records = Records_1.Records.from(positions)
            .distance(500)
            .distance(1000)
            .extract();
        // THEN
        expect(records.has(500)).toBe(true);
        var halfKmRecord = records.get(500);
        expect(halfKmRecord.time).toBe(30);
        expect(records.has(1000)).toBe(true);
        var kmRecord = records.get(1000);
        expect(kmRecord.time).toBe(140);
    });
    it("should find best match for record", function () {
        // GIVEN
        var pivot = new Position_1.Position(1050, 140);
        var positions = immutable_1.List([
            new Position_1.Position(0, 0),
            new Position_1.Position(10, 10),
            new Position_1.Position(50, 20),
            new Position_1.Position(500, 30),
            pivot,
            new Position_1.Position(1090, 141),
            new Position_1.Position(1190, 142),
            new Position_1.Position(1290, 143),
            new Position_1.Position(1390, 144),
            new Position_1.Position(1590, 145),
            new Position_1.Position(1890, 146),
            new Position_1.Position(2070, 147),
            new Position_1.Position(2090, 167),
            new Position_1.Position(2200, 200),
        ]);
        // WHEN
        var records = Records_1.Records.from(positions)
            .distance(1000)
            .extract();
        // THEN
        expect(records.has(1000)).toBe(true);
        var kmRecord = records.get(1000);
        expect(kmRecord.time).toBe(7);
        expect(kmRecord.startingPosition).toBe(pivot);
    });
    it("should find best match for by removing from tail", function () {
        // GIVEN
        var startRecord;
        var positions = immutable_1.List([
            new Position_1.Position(0, 0),
            new Position_1.Position(10, 10),
            new Position_1.Position(11, 11),
            new Position_1.Position(12, 12),
            new Position_1.Position(13, 13),
            new Position_1.Position(14, 14),
            startRecord = new Position_1.Position(15, 15),
            new Position_1.Position(115, 45),
            new Position_1.Position(118, 234),
            new Position_1.Position(120, 800),
        ]);
        // WHEN
        var records = Records_1.Records.from(positions)
            .distance(100)
            .extract();
        // THEN
        var record = records.get(100);
        expect(record.time).toBe(30);
        expect(record.startingPosition).toBe(startRecord);
    });
    it("should get real record measured distance", function () {
        // GIVEN
        var positions = immutable_1.List([
            new Position_1.Position(0, 0),
            new Position_1.Position(10, 10),
            new Position_1.Position(50, 20),
            new Position_1.Position(500, 30),
            new Position_1.Position(1090, 141),
            new Position_1.Position(2200, 200),
            new Position_1.Position(2500, 300),
        ]);
        // WHEN
        var records = Records_1.Records.from(positions)
            .distance(2000)
            .extract();
        // THEN
        expect(records.has(2000)).toBe(true);
        var kmRecord = records.get(2000);
        expect(kmRecord.time).toBe(180);
        expect(kmRecord.measuredDistance).toBe(2150);
    });
});
//# sourceMappingURL=Records.js.map