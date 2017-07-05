import * as moment from "moment";

export function secondToHuman(rawSeconds: number): string {
    const duration = moment.duration(rawSeconds, "second");

    let res = "";
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();

    let display = false;
    if (hours > 0) {
        res += hours + "h";
        display = true;
    }
    if (display || minutes > 0) {
        res += pad2(minutes) + "m";
    }
    return res + pad2(seconds) + "s";
}

function pad2(n: number) {
    if (n < 10) {
        return "0" + n;
    }
    return n;
}
