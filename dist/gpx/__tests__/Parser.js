"use strict";
exports.__esModule = true;
var Parser_1 = require("..//Parser");
var moment = require("moment");
var GPX_FILES_PREFIX = "src/gpx/__tests__";
describe("parse", function () {
    it("should manage non gpx file", function () {
        expect.assertions(1);
        return Parser_1["default"](GPX_FILES_PREFIX + "/gpx-files/empty.gpx")
            .then(function () {
            fail("the parsing should not succeed!");
        })["catch"](function (error) {
            expect(error.message).toBeDefined();
        });
    });
    it("should extract 'basic' run", function () {
        expect.assertions(9);
        return Parser_1["default"](GPX_FILES_PREFIX + "/gpx-files/basic.gpx")
            .then(function (run) {
            expect(run.label).toBe("San Francisco Running");
            expect(run.date.getTime()).toBe(moment("2017-06-19T01:21:45.000Z").valueOf());
            expect(run.positions.size).toBe(3);
            var first = run.positions.get(0);
            expect(first.distance).toBe(18);
            expect(first.elapsedTime).toBe(9);
            var second = run.positions.get(1);
            expect(second.distance).toBe(21);
            expect(second.elapsedTime).toBe(11);
            var third = run.positions.get(2);
            expect(third.distance).toBe(23);
            expect(third.elapsedTime).toBe(12);
        });
    });
});
//# sourceMappingURL=Parser.js.map