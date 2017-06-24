import {} from "jest";
import { List } from "immutable";
import { Position } from "../../domain/Position";
import { Records } from "../Records";

describe("Records", () => {
    it("should not extract anything if there is no record", () => {
        // GIVEN
        const positions = List([
            new Position(0, 0),
            new Position(10, 10),
            new Position(50, 20),
            new Position(550, 30)
        ]);

        // WHEN
        const records = Records.from(positions)
                               .distance(1000)
                               .extract();

        // THEN
        expect(records.has(1000)).toBe(false);
    });

    it("should extract record", () => {
        // GIVEN
        const positions = List([
            new Position(0, 0),
            new Position(10, 10),
            new Position(50, 20),
            new Position(500, 30),
            new Position(1000, 140)
        ]);

        // WHEN
        const records = Records.from(positions)
                               .distance(1000)
                               .extract();

        // THEN
        expect(records.has(1000)).toBe(true);
        const kmRecord = records.get(1000);
        expect(kmRecord.time).toBe(140);
    });

    it("should extract starting position in record", () => {
        // GIVEN
        const initialPosition = new Position(0, 0);

        const positions = List([
            initialPosition,
            new Position(10, 10),
            new Position(50, 20),
            new Position(500, 30),
            new Position(1000, 140)
        ]);

        // WHEN
        const records = Records.from(positions)
                               .distance(1000)
                               .extract();

        // THEN
        expect(records.has(1000)).toBe(true);
        const halfKmRecord = records.get(1000);
        expect(halfKmRecord.startingPosition).toBe(initialPosition);
    });

    it("should extract multiple record", () => {
        // GIVEN
        const positions = List([
            new Position(0, 0),
            new Position(10, 10),
            new Position(50, 20),
            new Position(500, 30),
            new Position(1000, 140)
        ]);

        // WHEN
        const records = Records.from(positions)
                               .distance(500)
                               .distance(1000)
                               .extract();

        // THEN
        expect(records.has(500)).toBe(true);
        const halfKmRecord = records.get(500);
        expect(halfKmRecord.time).toBe(30);

        expect(records.has(1000)).toBe(true);
        const kmRecord = records.get(1000);
        expect(kmRecord.time).toBe(140);
    });

    it("should find best match for record", () => {
        // GIVEN
        const pivot = new Position(1050, 140);
        const positions = List([
            new Position(0, 0),
            new Position(10, 10),
            new Position(50, 20),
            new Position(500, 30),
            pivot,
            new Position(1090, 141),
            new Position(1190, 142),
            new Position(1290, 143),
            new Position(1390, 144),
            new Position(1590, 145),
            new Position(1890, 146),
            new Position(2070, 147),
            new Position(2090, 167),
            new Position(2200, 200),
        ]);

        // WHEN
        const records = Records.from(positions)
                               .distance(1000)
                               .extract();

        // THEN
        expect(records.has(1000)).toBe(true);
        const kmRecord = records.get(1000);
        expect(kmRecord.time).toBe(7);
        expect(kmRecord.startingPosition).toBe(pivot);
    });

    it("should find best match for by removing from tail", () => {
        // GIVEN
        let startRecord;
        const positions = List([
            new Position(0, 0),
            new Position(10, 10),
            new Position(11, 11),
            new Position(12, 12),
            new Position(13, 13),
            new Position(14, 14),
            startRecord = new Position(15, 15),
            new Position(115, 45),
            new Position(118, 234),
            new Position(120, 800),
        ]);

        // WHEN
        const records = Records.from(positions)
                               .distance(100)
                               .extract();

        // THEN
        const record = records.get(100);
        expect(record.time).toBe(30);
        expect(record.startingPosition).toBe(startRecord);
    });

    it("should get real record measured distance", () => {
        // GIVEN
        const positions = List([
            new Position(0, 0),
            new Position(10, 10),
            new Position(50, 20),
            new Position(500, 30),
            new Position(1090, 141),
            new Position(2200, 200),
            new Position(2500, 300),
        ]);

        // WHEN
        const records = Records.from(positions)
                               .distance(2000)
                               .extract();

        // THEN
        expect(records.has(2000)).toBe(true);
        const kmRecord = records.get(2000);
        expect(kmRecord.time).toBe(180);
        expect(kmRecord.measuredDistance).toBe(2150);
    });
});
