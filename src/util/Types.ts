export class WrongTypeException extends Error {
    constructor(expectedType: string, obj: any) {
        super(`The specified object does not have the expected type: ${expectedType} but ${typeof obj}`);
    }
}
