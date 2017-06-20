import {} from "jest";
import greeter from "../greeter";

describe("greeter", () => {
    it("should greet the person", () => {
        expect(greeter("Augustin")).toBe("Hello, Augustin");
    });
});
