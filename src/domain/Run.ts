import { List } from "immutable";
import { Position } from "./Position";

export class Run {
    public constructor(public readonly label: string,
                       public readonly date: Date,
                       public readonly positions: List<Position>) { }
}
