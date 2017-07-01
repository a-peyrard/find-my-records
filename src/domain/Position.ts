import { WrongTypeException } from "../util/Types";
export class Position {
    public static checkInstanceOf(chunk: any): Position {
        if (chunk instanceof Position) {
            return chunk as Position;
        }
        throw new WrongTypeException("Position", chunk);
    }

    public constructor(public readonly distance: number,
                       public readonly elapsedTime: number) { }
}
