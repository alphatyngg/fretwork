const SVG_NS = "http://www.w3.org/2000/svg";

const CHORD_SHAPES = {
    C: {
        major: [
            {
                frets: [-1, 3, 2, 0, 1, 0],
                fingers: [0, 3, 2, 0, 1, 0],
                baseFret: 1,
                label: "C Open",
                note: "Open position"
            }
        ]
    }
};

const STRING_COUNT = 6;
const FRET_ROWS = 5;
const CELL_W = 22;
const CELL_H = 26;
const PAD_TOP = 26;
const PAD_LEFT = 22;
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

        label.setAttribute("x", x0 - 6);
        label.setAttribute("y", y0 + CELL_H / 2 + 4);
        label.setAttribute("text-anchor", "end");
        label.setAttribute("font-family", "var(--font-mono)");
        label.setAttribute("font-size", "10");
        label.setAttribute("fill", "var(--text-muted)");
        label.textContent = shape.baseFret + "fr";
        svg.appendChild(label);
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

function buildChords() {
    const grid = document.getElementById("chordGrid");
    grid.innerHTML = "";

    const shape = CHORD_SHAPES.C.major[0];
    grid.appendChild(drawChordCard(shape));
}

buildChords();