const midi = require("midi-file");
const fs = require("fs");

const MAX_SECONDS = 35;

const clipMidi = (file) => {
    const midiFile = midi.parseMidi(fs.readFileSync(file));
    const tracks = midiFile.tracks;
    let newTracks = [];

    let ticksPerBeat = midiFile.header.ticksPerBeat;
    let millisecondsPerBeat = 0;

    // loop tracks
    for (let i = 0; i < tracks.length; i++) {
        let track = tracks[i];
        let newTrack = [];

        let lastTime = 0;

        let startCut = false;

        // loop track
        for (let j = 0; j < track.length; j++) {
            let event = track[j];

            if(event.type === "setTempo") {
                const microsecondsPerBeat = event.microsecondsPerBeat;
                millisecondsPerBeat = microsecondsPerBeat / 1000;
            }

            const deltaTime = event.deltaTime;

            lastTime = lastTime + deltaTime;
            // figure out how many seconds we are into the song based off deltaTime ticks
            let seconds = lastTime / ticksPerBeat * millisecondsPerBeat / 1000;
            

            if(seconds > MAX_SECONDS && event.type !== "endOfTrack") {
                if(!startCut) {
                    if(j < 50) {
                        console.log(track.slice(0, j));
                    }
                }
                startCut = true;
                
                // console.log(j);
            } else {
                newTrack.push(event);
            }
        }
        // add to newTracks
        newTracks.push(newTrack);
    }
    midiFile.tracks = newTracks;

    const output = midi.writeMidi(midiFile);
    const outputBuffer = Buffer.from(output);
    fs.writeFileSync(file.replace("raw", "samples"), outputBuffer);    
}

fs.readdirSync("./raw").forEach(file => {
    if (file.includes(".mid")) {
        clipMidi("./raw/" + file);
    }
});
