const SVG_NS = "http://www.w3.org/2000/svg";

const CHORD_SHAPES = {
    C: {
        major: [
            {
                frets: [-1, 3, 2, 0, 1, 0],
                fingers: [0, 3, 2, 0, 1, 0],
                baseFret: 1,
                label: "C Open",
                note: "Open Position"
            },
        ],
        seventh: [
            {
                frets: [-1, 3, 2, 3, 1, 0],
                fingers: [0, 3, 2, 4, 1, 0],
                baseFret: 1,
                label: "C7 Open",
                note: "Open Position"
            }
        ]
    },
    D: {
        major: [
            { 
                frets: [-1, -1, 0, 2, 3, 2],
                fingers: [0, 0, 0, 1, 3, 2],
                baseFret: 1,
                label: "D Open",
                note: "Open Position"
            }
        ],
        minor: [
            { 
                frets: [-1, -1, 0, 2, 3, 1],
                fingers: [0, 0, 0, 2, 3, 1],
                baseFret: 1,
                label: "Dm Open",
                note: "Open Position" }
        ],
        seventh: [
            { 
                frets: [-1, -1, 0, 2, 1, 2],
                fingers: [0, 0, 0, 2, 1, 3],
                baseFret: 1,
                label: "D7 Open",
                note: "Open Position" }
        ]
    },
    E: {
        major: [
            { 
                frets: [0, 2, 2, 1, 0, 0],
                fingers: [0, 2, 3, 1, 0, 0],
                baseFret: 1,
                label: "E Open",
                note: "Open Position" }
        ],
        minor: [
            { 
                frets: [0, 2, 2, 0, 0, 0],
                fingers: [0, 2, 3, 0, 0, 0],
                baseFret: 1,
                label: "Em Open",
                note: "Open Position" }
        ],
        seventh: [
            { 
                frets: [0, 2, 0, 1, 0, 0],
                fingers: [0, 2, 0, 1, 0, 0],
                baseFret: 1,
                label: "E7 Open",
                note: "Open Position" }
        ]
    },
    G: {
        major: [
            { 
                frets: [3, 2, 0, 0, 0, 3],
                fingers: [2, 1, 0, 0, 0, 3],
                baseFret: 1,
                label: "G Open",
                note: "Open Position" }
        ],
        seventh: [
            { 
                frets: [3, 2, 0, 0, 0, 1],
                fingers: [3, 2, 0, 0, 0, 1],
                baseFret: 1,
                label: "G7 Open",
                note: "Open Position" }
        ]
    },
    A: {
        major: [
            { 
                frets: [-1, 0, 2, 2, 2, 0],
                fingers: [0, 0, 1, 2, 3, 0],
                baseFret: 1,
                label: "A Open",
                note: "Open Position" }
        ],
        minor: [
            { 
                frets: [-1, 0, 2, 2, 1, 0],
                fingers: [0, 0, 2, 3, 1, 0],
                baseFret: 1,
                label: "Am Open",
                note: "Open Position" }
        ],
        seventh: [
            { 
                frets: [-1, 0, 2, 0, 2, 0],
                fingers: [0, 0, 2, 0, 3, 0],
                baseFret: 1,
                label: "A7 Open",
                note: "Open Position" }
        ]
    }
};

const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", 
                    "F#", "G", "G#", "A", "A#", "B"];

const STRING_OPEN = ["E", "A", "D", "G", "B", "E"];

const CHORD_TYPE_NAMES = {
    major: "Major",
    minor: "Minor", 
    seventh: "7th"
};

const CHORD_TYPE_SUFFIX = {
    major: "",
    minor: "m",
    seventh: "7"
};

const CHORD_STATE = {
    root: "C"
};

function fretForNote(note, stringIndex) {
    const openNote = STRING_OPEN[stringIndex];
    const openIdx = CHROMATIC.indexOf(openNote);
    const targetIdx = CHROMATIC.indexOf(note);

    let fret = (targetIdx - openIdx + 12) % 12;

    return fret === 0 ? 12 : fret;
}

const MOVABLE_SHAPES = {
    major: [
        {
            anchorString: 0,
            frets: [1, 3, 3, 2, 1, 1],
            fingers: [1, 3, 4, 2, 1, 1],
            barre: { fret: 1, from: 0, to: 5 },
            label: "E-shape",
            note: "Barre"
        },
        {
            anchorString: 1,
            frets: [-1, 1, 3, 3, 3, 1],
            fingers: [ 0, 1, 3, 4, 2, 1],
            barre: { fret: 1, from: 1, to: 5 },
            label: "A-shape",
            note: "Barre"
        },
        {
            anchorString: 1,
            templateFret: 5,        // root at fret 5 (D example)
            frets:   [-1, 5, 4, 2, 3, -1],
            fingers: [ 0, 4, 3, 1, 2, 0],
            label: "C-shape",
            note: "Advanced Voicing"
        }
    ],
    minor: [
        {
            anchorString: 0,
            frets:   [1, 3, 3, 1, 1, 1],
            fingers: [1, 3, 4, 1, 1, 1],
            barre:   { fret: 1, from: 0, to: 5 },
            label: "Em-shape",
            note: "Barre"
        },
        {
            anchorString: 1,
            frets:   [-1, 1, 3, 3, 2, 1],
            fingers: [ 0, 1, 3, 4, 2, 1],
            barre:   { fret: 1, from: 1, to: 5 },
            label: "Am-shape",
            note: "Barre"
        }
    ],
    seventh: [
        {
            anchorString: 0,
            frets:   [1, 3, 1, 2, 1, 1],
            fingers: [1, 3, 1, 2, 1, 1],
            barre:   { fret: 1, from: 0, to: 5 },
            label: "E7-shape",
            note: "Barre"
        },
        {
            anchorString: 1,
            frets:   [-1, 1, 3, 1, 3, 1],
            fingers: [ 0, 1, 3, 1, 4, 1],
            barre:   { fret: 1, from: 1, to: 5 },
            label: "A7-shape",
            note: "Barre"
        }
    ]
};

function generateShape(template, root) {
    const rootFret = fretForNote(root, template.anchorString);
    const base = template.templateFret || 1;            // default to 1 for E/A shapes
    const shift = rootFret - base;

    let frets = template.frets.map(f => (f === -1 ? null : f + shift));
    if (frets.some(f => f !== null && f < 1)) {
        frets = frets.map(f => (f === null ? null : f + 12));
    }
    frets = frets.map(f => (f === null ? -1 : f));

    const fingers = template.fingers.slice();
    const fretted = frets.filter(f => f > 0);
    const baseFret = fretted.length ? Math.min(...fretted) : 1;

    const shape = {
        frets,
        fingers,
        baseFret,
        label: `${root} ${template.label}`,
        note: template.note
    };

    if (template.barre) {
        shape.barre = {
            fret: template.barre.fret + shift,
            from: template.barre.from,
            to: template.barre.to
        };
    }

    return shape;
}

const STRING_COUNT = 6;
const FRET_ROWS = 5;
const CELL_W = 22;
const CELL_H = 26;
const PAD_TOP = 26;
const PAD_LEFT = 40;
const DOT_R = 8.5;

function drawChordDiagram(shape) {
    const gridW = CELL_W * (STRING_COUNT - 1);
    const gridH = CELL_H * FRET_ROWS;
    const viewW = gridW + PAD_LEFT * 2;
    const viewH = gridH + PAD_TOP + 16;

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${viewW} ${viewH}`);
    svg.setAttribute("class", "chord-diagram");

    const x0 = PAD_LEFT;
    const y0 = PAD_TOP;

    // vertical lines
    for (let i = 0; i < STRING_COUNT; i++) {
        const x = x0 + i * CELL_W;
        const line = document.createElementNS(SVG_NS, "line");
        
        line.setAttribute("x1", x);
        line.setAttribute("y1", y0);
        line.setAttribute("x2", x);
        line.setAttribute("y2", y0 + gridH);
        line.setAttribute("stroke", "var(--text-muted)");
        line.setAttribute("stroke-width", "1");
        svg.appendChild(line);
    }

    // horizontal lines
    for (let i = 0; i <= FRET_ROWS; i++) {
        const y = y0 + i * CELL_H;
        const line = document.createElementNS(SVG_NS, "line");

        line.setAttribute("x1", x0);
        line.setAttribute("y1", y);
        line.setAttribute("x2", x0 + gridW);
        line.setAttribute("y2", y);
        line.setAttribute("stroke", "var(--text-muted)");

        const isNut = i === 0 && shape.baseFret === 1;

        line.setAttribute("stroke-width", isNut ? "4" : "1");
        if (isNut) line.setAttribute("stroke", "var(--text)");
        svg.appendChild(line);
    }

    // base fret label
    if (shape.baseFret > 1) {
        const label = document.createElementNS(SVG_NS, "text");

        label.setAttribute("x", x0 - 12);
        label.setAttribute("y", y0 + CELL_H / 2 + 4);
        label.setAttribute("text-anchor", "end");
        label.setAttribute("font-family", "var(--font-mono)");
        label.setAttribute("font-size", "10");
        label.setAttribute("fill", "var(--text-muted)");
        label.textContent = shape.baseFret + "fr";
        svg.appendChild(label);
    }

    if (shape.barre) {
        const bRow = shape.barre.fret - shape.baseFret;
        const bY = y0 + bRow * CELL_H + CELL_H / 2;
        const bX1 = x0 + shape.barre.from * CELL_W;
        const bX2 = x0 + shape.barre.to * CELL_W;
        const bar = document.createElementNS(SVG_NS, "line");

        bar.setAttribute("x1", bX1);
        bar.setAttribute("y1", bY);
        bar.setAttribute("x2", bX2);
        bar.setAttribute("y2", bY);
        bar.setAttribute("stroke", "var(--accent-root)");
        bar.setAttribute("stroke-width", DOT_R * 2);
        bar.setAttribute("stroke-linecap", "round");
        svg.appendChild(bar);
    }

    // markers
    shape.frets.forEach((fret, stringIndex) => {
        const x = x0 + stringIndex * CELL_W;

        if (fret === -1 || fret === 0) {
            const mark = document.createElementNS(SVG_NS, "text");

            mark.setAttribute("x", x);
            mark.setAttribute("y", y0 - 8);
            mark.setAttribute("text-anchor", "middle");
            mark.setAttribute("font-family", "var(--font-mono)");
            mark.setAttribute("font-size", "12");
            mark.setAttribute("fill", "var(--text-muted)");
            mark.textContent = fret === -1 ? "×" : "○";
            svg.appendChild(mark);
            return;
        }

        // pressed fret
        const row = fret - shape.baseFret;
        const y = y0 + row * CELL_H + CELL_H / 2;
        const dot = document.createElementNS(SVG_NS, "circle");

        dot.setAttribute("cx", x);
        dot.setAttribute("cy", y);
        dot.setAttribute("r", DOT_R);
        dot.setAttribute("fill", "var(--accent-root)");
        svg.appendChild(dot);

        // finger number 
        const finger = shape.fingers[stringIndex];
        
        if (finger > 0) {
            const num = document.createElementNS(SVG_NS, "text");

            num.setAttribute("x", x);
            num.setAttribute("y", y + 3.5);
            num.setAttribute("text-anchor", "middle");
            num.setAttribute("font-family", "var(--font-mono)");
            num.setAttribute("font-size", "10");
            num.setAttribute("font-weight", "700");
            num.setAttribute("fill", "var(--color-bg)");
            num.textContent = finger;
            svg.appendChild(num);
        }
    });

    return svg;
}

function drawChordCard(shape) {
    const card = document.createElement("div");
    card.className = "chord-card";

    // label above
    const label = document.createElement("div");
    label.className = "chord-card-label";
    label.textContent = shape.label;
    card.appendChild(label);

    card.appendChild(drawChordDiagram(shape));

    // description below
    if (shape.note) {
        const note = document.createElement("div");
        note.className = "chord-card-note";
        note.textContent = shape.note;
        card.appendChild(note);
    }

    return card;
}

function shapesFor(root, typeKey) {
    const shapes = [];
    const openShapes = CHORD_SHAPES[root] && CHORD_SHAPES[root][typeKey];

    if (openShapes) {
        shapes.push(...openShapes);
    }

    const templates = MOVABLE_SHAPES[typeKey];

    if (templates) {
        templates.forEach(t => shapes.push(generateShape(t, root)));
    }

    return shapes;
}

function buildChords() {
    const grid = document.getElementById("chordGrid");
    grid.innerHTML = "";

    const root = CHORD_STATE.root;
    const typeKeys = Object.keys(CHORD_TYPE_NAMES);

    typeKeys.forEach(typeKey => {
        const shapes = shapesFor(root, typeKey);
        if (shapes.length === 0) return;

        const row = document.createElement("div");

        row.className = "chord-row";

        const heading = document.createElement("h3");

        heading.className = "chord-row-title";
        heading.textContent = `${root}${CHORD_TYPE_SUFFIX[typeKey]} - ${CHORD_TYPE_NAMES[typeKey]}`;
        row.appendChild(heading);

        const cards = document.createElement("div");

        cards.className = "chord-cards";
        shapes.forEach(shape => cards.appendChild(drawChordCard(shape)));
        row.appendChild(cards);

        grid.appendChild(row);
    });
}

function wireChordRootPicker() {
    const buttons = document.querySelectorAll("#chordRootPicker button");
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            CHORD_STATE.root = btn.textContent;
            buttons.forEach(b => b.setAttribute("aria-pressed", "false"));
            btn.setAttribute("aria-pressed", "true");
            buildChords();
        });
    });
}

wireChordRootPicker();
buildChords();