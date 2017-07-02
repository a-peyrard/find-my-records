import {} from "jest";
import { List } from "immutable";
import { Run } from "../../domain/Run";
import { Records } from "../Records";

const dummy: Run.Meta = new Run.Meta("dummy", new Date());

describe("Records", () => {
    it("should not extract anything if there is no record", () => {
        // GIVEN
        const positions = List([
            new Run.Position(dummy, 0, 0),
            new Run.Position(dummy, 10, 10),
            new Run.Position(dummy, 50, 20),
            new Run.Position(dummy, 550, 30)
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
            new Run.Position(dummy, 0, 0),
            new Run.Position(dummy, 10, 10),
            new Run.Position(dummy, 50, 20),
            new Run.Position(dummy, 500, 30),
            new Run.Position(dummy, 1000, 140)
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
        const initialPosition = new Run.Position(dummy, 0, 0);

        const positions = List([
            initialPosition,
            new Run.Position(dummy, 10, 10),
            new Run.Position(dummy, 50, 20),
            new Run.Position(dummy, 500, 30),
            new Run.Position(dummy, 1000, 140)
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
            new Run.Position(dummy, 0, 0),
            new Run.Position(dummy, 10, 10),
            new Run.Position(dummy, 50, 20),
            new Run.Position(dummy, 500, 30),
            new Run.Position(dummy, 1000, 140)
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
        const pivot = new Run.Position(dummy, 1050, 140);
        const positions = List([
            new Run.Position(dummy, 0, 0),
            new Run.Position(dummy, 10, 10),
            new Run.Position(dummy, 50, 20),
            new Run.Position(dummy, 500, 30),
            pivot,
            new Run.Position(dummy, 1090, 141),
            new Run.Position(dummy, 1190, 142),
            new Run.Position(dummy, 1290, 143),
            new Run.Position(dummy, 1390, 144),
            new Run.Position(dummy, 1590, 145),
            new Run.Position(dummy, 1890, 146),
            new Run.Position(dummy, 2070, 147),
            new Run.Position(dummy, 2090, 167),
            new Run.Position(dummy, 2200, 200),
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
            new Run.Position(dummy, 0, 0),
            new Run.Position(dummy, 10, 10),
            new Run.Position(dummy, 11, 11),
            new Run.Position(dummy, 12, 12),
            new Run.Position(dummy, 13, 13),
            new Run.Position(dummy, 14, 14),
            startRecord = new Run.Position(dummy, 15, 15),
            new Run.Position(dummy, 115, 45),
            new Run.Position(dummy, 118, 234),
            new Run.Position(dummy, 120, 800),
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
            new Run.Position(dummy, 0, 0),
            new Run.Position(dummy, 10, 10),
            new Run.Position(dummy, 50, 20),
            new Run.Position(dummy, 500, 30),
            new Run.Position(dummy, 1090, 141),
            new Run.Position(dummy, 2200, 200),
            new Run.Position(dummy, 2500, 300),
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

    it("should contains run's metadata", () => {
        // GIVEN
        const positions = List([
            new Run.Position(dummy, 0, 0),
            new Run.Position(dummy, 10, 10),
            new Run.Position(dummy, 50, 20),
            new Run.Position(dummy, 500, 30),
            new Run.Position(dummy, 1090, 141),
            new Run.Position(dummy, 2200, 200),
            new Run.Position(dummy, 2500, 300),
        ]);

        // WHEN
        const records = Records.from(positions)
                               .distance(1000)
                               .extract();

        // THEN
        expect(records.has(1000)).toBe(true);
        expect(records.get(1000).runMeta.label).toBe(dummy.label);
        expect(records.get(1000).runMeta.date).toBe(dummy.date);
    });
});
