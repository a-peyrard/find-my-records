import { Record } from "../record/Records";

export interface UpdatableRecordTable {
    init(): void;
    append(record: Record): UpdatableRecordTable;
    tick(): void;
    seal(): void;
}
