import parse from "./gpx/Parser";

if (process.argv.length < 3) {
    console.error("enter the path to a gpx file!");
    process.exit(1);
}

console.time("foo");
parse(process.argv[2])
    .then(run => {
        console.timeEnd("foo");
        console.log(run);
    })
    .catch(error => {
        console.log(error.stack || error);
    });
