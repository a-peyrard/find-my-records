# Find my records

> Small project to find records in `gpx` file.

## Why?
I love to run, and to analyze my data after,
I'm very frustrated by the lack of options available in strava or garmin-connect apps.
So I had a small need few weeks ago, to know what was my best miles on a run, and as
I didn't manage to find an app to extract this kind of statistics, I just made one.

This is my first time playing with `typescript`, so it's also some sort of kata.
So I will enjoy some reviewing! I have a long `java` background, so I guess I'm influenced by it. 

## How to run
It requires `npm` and `node`.
```
$ npm install -g find-my-records
$ find-my-records [a gpx file]
```

## From source

### Run locally
```
$ yarn install
$ ts-node src/index.ts [a gpx file]
```

### Launch the tests
```
$ yarn test
```

## TODO

As it is a kata, I guess I will go for technical improvements, before functional ones.

### Functional
- Specify the distances, currently they are hardcoded
- Take multiple gpx file, find individual records and global ones
- Display some graphs (GUI, console?) to show records evolution over the time
...

### Technical
- Use some stream (node?)
- Parallelize gpx file analysis
- Display records evolution as long as files are parsed (could be a cool stuff 😀)
- Play with electron for the GUI
- Find some place where I could use some rxjs, just for fun
...

## License
MIT © Augustin Peyrard
