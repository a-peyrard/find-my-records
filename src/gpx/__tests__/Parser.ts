import parse from "..//Parser";
import * as moment from "moment";

const GPX_FILES_PREFIX = "src/gpx/__tests__";

describe("parse", () => {
    it("should manage non gpx file", () => {
        expect.assertions(1);
        return parse(GPX_FILES_PREFIX + "/gpx-files/empty.gpx")
            .then(() => {
                fail("the parsing should not succeed!");
            })
            .catch(error => {
                expect(error.message).toBeDefined();
            });
    });

    it("should extract 'basic' run", () => {
        expect.assertions(9);
        return parse(GPX_FILES_PREFIX + "/gpx-files/basic.gpx")
            .then(run => {
                expect(run.meta.label).toBe("San Francisco Running");
                expect(run.meta.date.getTime()).toBe(moment("2017-06-19T01:21:45.000Z").valueOf());
                expect(run.positions.size).toBe(3);

                const first = run.positions.get(0);
                expect(first.distance).toBe(18);
                expect(first.elapsedTime).toBe(9);

                const second = run.positions.get(1);
                expect(second.distance).toBe(21);
                expect(second.elapsedTime).toBe(11);

                const third = run.positions.get(2);
                expect(third.distance).toBe(23);
                expect(third.elapsedTime).toBe(12);
            });
    });
});
