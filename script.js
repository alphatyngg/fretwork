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

const SVG_NS = "http://www.w3.org/2000/svg";
const FRET_COUNT = 17;
const NUT_X = 54;
const TOP_Y = 42;
const ROW_GAP = 38;
const SCALE_LENGTH = 1000;

//distance from nut to fret n
function fdist(n) {
    return SCALE_LENGTH - SCALE_LENGTH / Math.pow(2, n / 12);
}

//scaling pixels
const PX_PER_UNIT = 690 / fdist(15);

function fretX(n) {
    return NUT_X + fdist(n) * PX_PER_UNIT;
}

const BOTTOM_Y = TOP_Y + ROW_GAP * (STRINGS.length - 1);
const VIEW_H = BOTTOM_Y + 46;
const VIEW_W = fretX(FRET_COUNT) + 24;

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
    svg.setAttribute("viewBox", `0 0 ${VIEW_W} ${VIEW_H}`);

    const scaleNotes = getScaleNotes(state.root, state.scaleId);
    const rowSpan = BOTTOM_Y - TOP_Y;

    const defs = document.createElementNS(SVG_NS, "defs");
    defs.innerHTML = `<linearGradient id="woodGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="var(--wood-1)"/>
                      <stop offset="100%" stop-color="var(--wood-2)"/>
                      </linearGradient>`;
    svg.appendChild(defs);

    //wood bgd
    const wood = document.createElementNS(SVG_NS, "rect");
    wood.setAttribute("x", NUT_X);
    wood.setAttribute("y", TOP_Y - 14);
    wood.setAttribute("width", VIEW_W - NUT_X - 20);
    wood.setAttribute("height", BOTTOM_Y - TOP_Y + 28);
    wood.setAttribute("rx", 6);
    wood.setAttribute("fill", "url(#woodGrad)");
    svg.appendChild(wood);

    //fret inlay markers (single)
    const singleMarkers = [3, 5, 7, 9, 15, 17];
    const midY = TOP_Y + rowSpan / 2;

    singleMarkers.forEach(i => {
        const cx = (fretX(i - 1) + fretX(i)) / 2;
        const dot = document.createElementNS(SVG_NS, "circle");
        dot.setAttribute("cx", cx);
        dot.setAttribute("cy", midY);
        dot.setAttribute("r", 5);
        dot.setAttribute("fill", "var(--inlay)");
        dot.setAttribute("opacity", "0.55");
        svg.appendChild(dot);
    });

    //fret inlay marker (double)
    const cx12 = (fretX(11) + fretX(12)) / 2;
    [midY - rowSpan / 4, midY + rowSpan / 4].forEach(cy => {
        const dot = document.createElementNS(SVG_NS, "circle");
        dot.setAttribute("cx", cx12);
        dot.setAttribute("cy", cy);
        dot.setAttribute("r", 5);
        dot.setAttribute("fill", "var(--inlay)");
        dot.setAttribute("opacity", "0.55");
        svg.appendChild(dot);
    });

    //frets
    for (let i = 0; i <= FRET_COUNT; i++) {
        const x = fretX(i);
        const line = document.createElementNS(SVG_NS, "line");
        line.setAttribute("x1", x);
        line.setAttribute("x2", x);
        line.setAttribute("y1", TOP_Y - 10);
        line.setAttribute("y2", BOTTOM_Y + 10);
        line.setAttribute("stroke", i === 0 ? "var(--nut)" : "var(--fret-wire)");
        line.setAttribute("stroke-width", i === 0 ? 6 : 2);
        svg.appendChild(line);

        if (i > 0) {
            const label = document.createElementNS(SVG_NS, "text");
            label.setAttribute("x", (fretX(i - 1) + fretX(i)) / 2);
            label.setAttribute("y", BOTTOM_Y + 26);
            label.setAttribute("text-anchor", "middle");
            label.setAttribute("font-family", "var(--font-mono)");
            label.setAttribute("font-size", "10");
            label.setAttribute("fill", "var(--text-muted)");
            label.textContent = i;
            svg.appendChild(label);
        }
    }

    ///strings
    STRINGS.forEach((stringName, i) => {
        const y = TOP_Y + ((BOTTOM_Y - TOP_Y) / (STRINGS.length - 1)) * i;
        const line = document.createElementNS(SVG_NS, "line");
        line.setAttribute("x1", NUT_X - 4);
        line.setAttribute("x2", VIEW_W - 20);
        line.setAttribute("y1", y);
        line.setAttribute("y2", y);
        line.setAttribute("stroke", "var(--string)");
        line.setAttribute("stroke-width", 1 + i * 0.35);
        svg.appendChild(line);

        const label = document.createElementNS(SVG_NS, "text");
        label.setAttribute("x", NUT_X - 16);
        label.setAttribute("y", y + 4);
        label.setAttribute("text-anchor", "end");
        label.setAttribute("font-family", "var(--font-mono)");
        label.setAttribute("font-size", "12");
        label.setAttribute("fill", "var(--text-muted)");
        label.textContent = stringName;
        svg.appendChild(label);
    });

    STRINGS.forEach((stringName, stringIndex) => {
        const y = TOP_Y + (rowSpan / (STRINGS.length - 1)) * stringIndex;

        for (let fret = 0; fret <= FRET_COUNT; fret++) {
            const x = fret === 0 ? NUT_X - 4 : (fretX(fret - 1) + fretX(fret)) / 2;

            const note = getNoteAt(stringIndex, fret);
            const isInScale = scaleNotes.includes(note);
            if (!isInScale) continue;

            const isRoot = note === state.root;

            const g = document.createElementNS(SVG_NS, "g");
            g.setAttribute("class", "note-dot");
            g.setAttribute("tabindex", "0");
            g.setAttribute("role", "button");
            g.setAttribute("aria-label", `${stringName} string, fret ${fret}, note ${NOTE_NAMES[note]}`);

            const glow = isRoot ? "var(--accent-root-glow)" : "var(--accent-scale-glow)";
            const circle = document.createElementNS(SVG_NS, "circle");
            circle.setAttribute("cx", x);
            circle.setAttribute("cy", y);
            circle.setAttribute("r", isRoot ? 15 : 14);
            circle.setAttribute("fill", isRoot ? "var(--accent-root)" : "var(--accent-scale)");
            circle.setAttribute("stroke", "var(--color-bg)");
            circle.setAttribute("stroke-width", "1.5");
            circle.setAttribute("style", `filter: drop-shadow(0 0 ${isRoot ? 7 : 4}px ${glow})`);

            g.appendChild(circle);

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

            const text = document.createElementNS(SVG_NS, "text");
            text.setAttribute("x", x);
            text.setAttribute("y", y + 4.5);
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("font-family", "var(--font-mono)");
            text.setAttribute("font-size", "12");
            text.setAttribute("font-weight", "700");
            text.setAttribute("fill", isRoot ? "#2a1808" : "#152622");
            text.style.pointerEvents = "none";
            text.textContent = labelText;

            g.appendChild(text);
            
            const pluck = () => {
                playStringFret(stringIndex, fret);
                g.classList.remove("plucked");
                void g.getBoundingClientRect();
                g.classList.add("plucked");
            };

            g.addEventListener("click", pluck);
            g.addEventListener("keydown", e => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    pluck();
                }
            });

            svg.appendChild(g);
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
    beatsPerMeasure: 4,
    currentBeat: 0,
    isPlaying: false
};

const TEMPO_NAMES = [
    { max: 45, name: "Larghissimo" },
    { max: 60, name: "Largo" },
    { max: 66, name: "Larghetto" },
    { max: 76, name: "Adagio" },
    { max: 108, name: "Andante" },
    { max: 120, name: "Moderato" },
    { max: 156, name: "Allegro" },
    { max: 176, name: "Vivace" },
    { max: 200, name: "Presto" },
    { max: Infinity, name: "Prestissimo" }
];

function tempoNameFor(bpm) {
    return TEMPO_NAMES.find(t => bpm <= t.max).name;
}

function setBpm(newBpm) {
    metro.bpm = Math.min(240, Math.max(30, newBpm));
    document.getElementById("bpmValue").textContent = metro.bpm;
    document.getElementById("bpmSlider").value = metro.bpm;
    document.getElementById("tempoName").textContent = tempoNameFor(metro.bpm);
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

function wireTapTempo() {
    const btn = document.getElementById("tapTempo");
    let tapTimes = [];

    btn.addEventListener("click", () => {
        const now = Date.now();
        if (tapTimes.length && now - tapTimes[tapTimes.length - 1] > 2000) {
            tapTimes = [];              // resets if long pause
        }
        tapTimes.push(now);
        if (tapTimes.length > 5) {
            tapTimes.shift();
        }
        if (tapTimes.length >= 2) {
            const gaps = [];
            for (let i = 1; i < tapTimes.length; i++) {
                gaps.push(tapTimes[i] - tapTimes[i - 1]);
            }
            const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
            setBpm(Math.round(60000 / avgGap));
        }
    });
}

function buildBeatLeds() {
    const wrap = document.getElementById("beatLeds");
    wrap.innerHTML = "";
    for (let i = 0; i < metro.beatsPerMeasure; i++) {
        const led = document.createElement("div");
        led.className = "led";
        wrap.appendChild(led);
    }
}

function lightBeat(beatIndex) {
    const leds = document.querySelectorAll(".led");
    leds.forEach((led, i) => {
        led.classList.toggle("on", i === beatIndex);
    });
}

function wireMeterSelect() {
    const select = document.getElementById("meterSelect");
    select.addEventListener("change", () => {
        metro.beatsPerMeasure = parseInt(select.value, 10);
        buildBeatLeds();
    });
}

let nextNoteTime = 0;
let timerId = null;
const LOOKAHEAD_MS = 25;                // checking time (ms)
const SCHEDULE_AHEAD_S = 0.1;           // schedule audio ahead (s)

function scheduleClick(beatIndex, time) {
    const ctx = ensureAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const isAccent = beatIndex === 0;

    osc.type = "square";
    osc.frequency.value = isAccent ? 1400 : 1000;
    gain.gain.setValueAtTime(isAccent ? 0.4 : 0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.03);

    osc.connect(gain).connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.04);

    const delayMs = Math.max(0, (time - ctx.currentTime) * 1000);
    setTimeout(() => lightBeat(beatIndex), delayMs);
}

function scheduler() {
    const ctx = ensureAudio();
    while (nextNoteTime < ctx.currentTime + SCHEDULE_AHEAD_S) {
        scheduleClick(metro.currentBeat, nextNoteTime);
        nextNoteTime += 60.0 / metro.bpm;           // secs per beat
        metro.currentBeat = (metro.currentBeat + 1) % metro.beatsPerMeasure;
    }
}

function startMetronome() {
    const ctx = ensureAudio();
    metro.isPlaying = true;
    metro.currentBeat = 0;
    nextNoteTime = ctx.currentTime + 0.05;
    timerId = setInterval(scheduler, LOOKAHEAD_MS);
}

function stopMetronome() {
    metro.isPlaying = false;
    clearInterval(timerId);
    timerId = null;
    document.querySelectorAll(".led").forEach(l => l.classList.remove("on"));
}

function wirePlayToggle() {
    const btn = document.getElementById("playToggle");
    btn.addEventListener("click", () => {
        if (metro.isPlaying) {
            stopMetronome();
            btn.textContent = "Start";
            btn.setAttribute("aria-pressed", "false");
        } else {
            startMetronome();
            btn.textContent = "Stop";
            btn.setAttribute("aria-pressed", "true");
        }
    });
}

wireRootButtons();
wireScaleSelect();
wireLabelMode();
wireBpmControls();
wirePlayToggle();
wireMeterSelect();
wireTapTempo();
buildBeatLeds();
setBpm(metro.bpm);