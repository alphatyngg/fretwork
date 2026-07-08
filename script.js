const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const SCALES = [
    { id: "major",            label: "Major",            intervals: [0, 2, 4, 5, 7, 9, 11]},
    { id: "minor",            label: "Minor",            intervals: [0, 2, 3, 5, 7, 8, 10]},
    { id: "major_pentatonic", label: "Major Pentatonic", intervals: [0, 2, 4, 7, 9]},
    { id: "minor_pentatonic", label: "Minor Pentatonic", intervals: [0, 3, 5, 7, 10]},
    { id: "blues",            label: "Blues",            intervals: [0, 3, 5, 6, 7, 10]},
    { id: "dorian",           label: "Dorian",           intervals: [0, 2, 3, 5, 7, 9, 10]},
    { id: "mixolydian",       label: "Mixolydian",       intervals: [0, 2, 4, 5, 7, 9, 10]}
];

const STRINGS = ["e", "B", "G", "D", "A", "E"];          // high to low, standard tuning

const state = {
    root: 0,                // index into NOTE_NAMES - 0 = C
    scaleId: "major",
    labelMode: "name"       // "name" | "degree" | "interval"
};

console.log(NOTE_NAMES);
console.log(SCALES);
console.log(state);

function getScale(scaleId) {
    return SCALES.find(s => s.id === scaleId);
}

function getScaleNotes(root, scaleId) {
    const scale = getScale(scaleId);
    return scale.intervals.map(interval => (root + interval) % 12);
}

console.log(getScaleNotes(state.root, state.scaleId));

const NUM_FRETS = 15;
const FRET_WIDTH = 50;
const STRING_SPACING = 30;
const SVG_PADDING = 30;

// open string pitch classes, matching STRINGS order
const OPEN_NOTE = [4, 11, 7, 2, 9, 4]          // index into NOTE_NAMES for each open string

function getNoteAt(stringIndex, fret) {
    return (OPEN_NOTE[stringIndex] + fret) % 12;
}

function buildFretboard() {
    const svg = document.getElementById("fretboard");
    svg.innerHTML = "";             // clears anything already drawn

    const scaleNotes = getScaleNotes(state.root, state.scaleId);

    STRINGS.forEach((stringName, stringIndex) => {
        for (let fret = 0; fret <= NUM_FRETS; fret++) {
            const x = SVG_PADDING + fret * FRET_WIDTH;
            const y = SVG_PADDING + stringIndex * STRING_SPACING;

            const note = getNoteAt(stringIndex, fret);
            const isInScale = scaleNotes.includes(note);
            const isRoot = note === state.root;

            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", x);
            circle.setAttribute("cy", y);
            circle.setAttribute("r", 4);
            circle.setAttribute("fill", isRoot ? "orange" : isInScale ? "teal" : "lightgray");

            svg.appendChild(circle);
        }
    });
}

buildFretboard();
