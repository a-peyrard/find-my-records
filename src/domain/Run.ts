import { List } from "immutable";
import * as uuid from "uuid/v4";
import { WrongTypeException } from "../util/Types";

export class Run {
    public constructor(public readonly meta: Run.Meta,
                       public readonly positions: List<Run.Position>) { }
}

export namespace Run {
    export class Meta {
        public readonly id: string;

        public constructor(public readonly label: string,
                           public readonly date: Date) {
            this.id = uuid();
        }
    }

    export class Position {
        public static checkInstanceOf(chunk: any): Position {
            if (chunk instanceof Position) {
                return chunk as Position;
            }
            throw new WrongTypeException("Position", chunk);
        }

        public constructor(public readonly runMeta: Run.Meta,
                           public readonly distance: number,
                           public readonly elapsedTime: number) { }
    }

}
