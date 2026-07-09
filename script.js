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

let audioCtx = null;

function ensureAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } 
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }
    return audioCtx;
}

function midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
}

const OPEN_MIDI = [64, 59, 55, 50, 45, 40];         // midi matching [e B G D A E]

function playStringFret(stringIndex, fret){
    const midi = OPEN_MIDI[stringIndex] + fret;
    const ctx = ensureAudio();
    const freq = midiToFreq(midi);
    const now = ctx.currentTime;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);

    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.05);
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
            circle.setAttribute("r", isInScale ? 9 : 4);
            circle.setAttribute("fill", isRoot ? "orange" : isInScale ? "teal" : "lightgray");

            svg.appendChild(circle);

            circle.style.cursor = "pointer";
            circle.addEventListener("click", () => playStringFret(stringIndex, fret));

            if (isInScale) {
                const degreeIndex = scaleNotes.indexOf(note);
                const interval = (note - state.root + 12) % 12;

                let labelText;
                if (state.labelMode === "name") {
                    labelText = NOTE_NAMES[note];
                } else if (state.labelMode === "degree") {
                    labelText = String(degreeIndex + 1);
                } else {
                    labelText = String(interval);
                }

                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("x", x);
                text.setAttribute("y", y + 3);
                text.setAttribute("text-anchor", "middle");
                text.setAttribute("font-size", "8");
                text.setAttribute("fill", "white");
                text.textContent = labelText;
                svg.appendChild(text);
            }
        }
    });
}

buildFretboard();

function wireRootButtons() {
    const buttons = document.querySelectorAll("#rootPicker button");
    buttons.forEach((btn, index) => {
        btn.addEventListener("click", () => {
            state.root = index;
            buttons.forEach(b => b.setAttribute("aria-pressed", "false"));
            btn.setAttribute("aria-pressed", "true");
            buildFretboard();
        });
    });
}

function wireScaleSelect() {
    const select = document.getElementById("scaleSelect");
    select.addEventListener("change", () => {
        state.scaleId = select.value;
        buildFretboard();
    });
}

function wireLabelMode() {
    const buttons = document.querySelectorAll("#labelMode button");
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            buttons.forEach(b => b.setAttribute("aria-pressed", "false"));
            btn.setAttribute("aria-pressed", "true");
            state.labelMode = btn.dataset.mode;
            buildFretboard();
        });
    });
}

const metro = {
    bpm: 100,
    isPlaying: false
};

function setBpm(newBpm) {
    metro.bpm = Math.min(240, Math.max(30, newBpm));
    document.getElementById("bpmValue").textContent = metro.bpm;
    document.getElementById("bpmSlider").value = metro.bpm;
}

function wireBpmControls() {
    const slider = document.getElementById("bpmSlider");
    const downBtn = document.getElementById("bpmDown");
    const upBtn = document.getElementById("bpmUp");

    slider.addEventListener("input", () => {
        setBpm(parseInt(slider.value, 10));
    });

    downBtn.addEventListener("click", () => setBpm(metro.bpm - 1));
    upBtn.addEventListener("click", () => setBpm(metro.bpm + 1));
}

let nextNoteTime = 0;
let timerId = null;
const LOOKAHEAD_MS = 25;                // checking time (ms)
const SCHEDULE_AHEAD_S = 0.1;           // schedule audio ahead (s)

function scheduleClick(time) {
    const ctx = ensureAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.value = 1000;
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.03);

    osc.connect(gain).connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.04);
}

function scheduler() {
    const ctx = ensureAudio();
    while (nextNoteTime < ctx.currentTime + SCHEDULE_AHEAD_S) {
        scheduleClick(nextNoteTime);
        nextNoteTime += 60.0 / metro.bpm;           // secs per beat
    }
}

function startMetronome() {
    const ctx = ensureAudio();
    metro.isPlaying = true;
    nextNoteTime = ctx.currentTime + 0.05;
    timerId = setInterval(scheduler, LOOKAHEAD_MS);
}

function stopMetronome() {
    metro.isPlaying = false;
    clearInterval(timerId);
    timerId = null;
}

function wirePlayToggle() {
    const btn = document.getElementById("playToggle");
    btn.addEventListener("click", () => {
        if (metro.isPlaying) {
            stopMetronome();
            btn.textContent = "Start";
        } else {
            startMetronome();
            btn.textContent = "Stop";
        }
    });
}

wireRootButtons();
wireScaleSelect();
wireLabelMode();
wireBpmControls();
wirePlayToggle();
setBpm(metro.bpm);