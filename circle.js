const WHEEL_KEYS = [
    { major: "C", minor: "Am", dim: "Bº" },
    { major: "G", minor: "Em", dim: "F#º" },
    { major: "D", minor: "Bm", dim: "C#º" },
    { major: "A", minor: "F#m", dim: "G#º" },
    { major: "E", minor: "C#m", dim: "D#º" },
    { major: "B", minor: "G#m", dim: "A#º" },
    { major: "F#", minor: "D#m", dim: "E#º" },
    { major: "Db", minor: "Bbm", dim: "Cº" },
    { major: "Ab", minor: "Fm", dim: "Gº" },
    { major: "Eb", minor: "Cm", dim: "Dº" },
    { major: "Bb", minor: "Gm", dim: "Aº" },
    { major: "F", minor: "Dm", dim: "Eº" }
];

const WHEEL_STATE = {
    selectedSlot: 0
};

console.log(WHEEL_KEYS);
console.log(WHEEL_KEYS.length);

const SVG_NS = "http://www.w3.org/2000/svg";
const CX = 280;
const CY = 280;
const VIEW_SIZE = 560;

function pointAt(slot, radius) {
    const angleDeg = slot * 30 - 90;            // each slot is 1/12 of circle = 30degs, subtract 90 so slot 0 points up
    const angleRad = angleDeg * Math.PI / 180;
    return {
        x: CX + radius * Math.cos(angleRad),
        y: CY + radius * Math.sin(angleRad)
    };
}

function wedgePath(slot, innerR, outerR) {
    const half = 0.5;
    const startA = (slot - half) * 30 - 90;
    const endA = (slot + half) * 30 - 90;

    const sr = startA * Math.PI / 180;
    const er = endA * Math.PI / 180;

    const p1 = { x: CX + innerR * Math.cos(sr), y: CY + innerR * Math.sin(sr) };
    const p2 = { x: CX + outerR * Math.cos(sr), y: CY + outerR * Math.sin(sr) };
    const p3 = { x: CX + outerR * Math.cos(er), y: CY + outerR * Math.sin(er) };
    const p4 = { x: CX + innerR * Math.cos(er), y: CY + innerR * Math.sin(er) };

    return [
        `M ${p1.x} ${p1.y}`,
        `L ${p2.x} ${p2.y}`,
        `A ${outerR} ${outerR} 0 0 1 ${p3.x} ${p3.y}`,
        `L ${p4.x} ${p4.y}`,
        `A ${innerR} ${innerR} 0 0 0 ${p1.x} ${p1.y}`,
        "Z"
    ].join(" ");
}

console.log(wedgePath(0, 100, 160));

const RINGS = {
    major: { inner: 90,  outer: 150 },
    minor: { inner: 150, outer: 205 },
    dim:   { inner: 205, outer: 250 }
};

function buildWheel() {
    const svg = document.getElementById("chordWheel");
    svg.innerHTML = "";
    svg.setAttribute("viewBox", `0 0 ${VIEW_SIZE} ${VIEW_SIZE}`);

    WHEEL_KEYS.forEach((keyData, slot) => {
        drawWedge(svg, slot, RINGS.major, "major", keyData.major, "var(--accent-root)");
        drawWedge(svg, slot, RINGS.minor, "minor", keyData.minor, "var(--accent-scale)");
        drawWedge(svg, slot, RINGS.dim,   "dim",   keyData.dim,   "var(--accent-dim)");
    });

    drawHub(svg);
}

function drawWedge(svg, slot, ring, ringName, label, fill) {
    const family = familyWedges(WHEEL_STATE.selectedSlot);
    const inFamily = family.has(`${ringName}:${slot}`);

    // wedge shape
    const path = document.createElementNS(SVG_NS, "path");

    path.setAttribute("d", wedgePath(slot, ring.inner, ring.outer));
    path.setAttribute("fill", fill);
    path.setAttribute("stroke", "var(--color-bg)");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("opacity", inFamily ? "1" : "0.35");
    path.style.cursor = "pointer";
    path.addEventListener("click", () => {
        WHEEL_STATE.selectedSlot = slot;
        buildWheel();
    })
    svg.appendChild(path);

    // label text (centered)
    const midR = (ring.inner + ring.outer) / 2;
    const pos = pointAt(slot, midR);
    const text = document.createElementNS(SVG_NS, "text");

    text.setAttribute("x", pos.x);
    text.setAttribute("y", pos.y + 5);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("font-family", "var(--font-display)");
    text.setAttribute("font-size", "15");
    text.setAttribute("font-weight", "700");
    text.setAttribute("fill", "var(--color-bg)");
    text.setAttribute("opacity", inFamily ? "1" : "0.45");
    text.style.pointerEvents = "none";
    text.textContent = label;
    svg.appendChild(text);

    // roman numeral
    const roman = romanFor(ringName, slot, WHEEL_STATE.selectedSlot);

    if (roman) {
        const numOffset = ringName === "dim" ? 9 : 12;
        const numPos = pointAt(slot, midR);
        const num = document.createElementNS(SVG_NS, "text");

        num.setAttribute("x", numPos.x);
        num.setAttribute("y", numPos.y - numOffset);
        num.setAttribute("text-anchor", "middle");
        num.setAttribute("font-family", "var(--font-mono)");
        num.setAttribute("font-size", "10");
        num.setAttribute("font-weight", "700");
        num.setAttribute("fill", "var(--color-bg)");
        num.setAttribute("opacity", "0.7");
        num.style.pointerEvents = "none";
        num.textContent = roman;
        svg.appendChild(num);
    }
}

function drawHub(svg) {
    const keyData = WHEEL_KEYS[WHEEL_STATE.selectedSlot];

    // hub bgd circle
    const circle = document.createElementNS(SVG_NS, "circle");
    circle.setAttribute("cx", CX);
    circle.setAttribute("cy", CY);
    circle.setAttribute("r", 82);
    circle.setAttribute("fill", "var(--color-surface)");
    circle.setAttribute("stroke", "var(--border)");
    circle.setAttribute("stroke-width", "1.5");
    svg.appendChild(circle);

    // "key" caption
    const caption = document.createElementNS(SVG_NS, "text");
    caption.setAttribute("x", CX);
    caption.setAttribute("y", CY - 22);
    caption.setAttribute("text-anchor", "middle");
    caption.setAttribute("font-family", "var(--font-mono)");
    caption.setAttribute("font-size", "11");
    caption.setAttribute("letter-spacing", "2");
    caption.setAttribute("fill", "var(--text-muted)");
    caption.textContent = "KEY";
    svg.appendChild(caption);

    // key name
    const keyName = document.createElementNS(SVG_NS, "text");
    keyName.setAttribute("x", CX);
    keyName.setAttribute("y", CY + 12);
    keyName.setAttribute("text-anchor", "middle");
    keyName.setAttribute("font-family", "var(--font-display)");
    keyName.setAttribute("font-size", "36");
    keyName.setAttribute("font-weight", "900");
    keyName.setAttribute("fill", "var(--accent-root)");
    keyName.textContent = keyData.major;
    svg.appendChild(keyName);

    // relative minor (smaller)
    const relMinor = document.createElementNS(SVG_NS, "text");
    relMinor.setAttribute("x", CX);
    relMinor.setAttribute("y", CY + 34);
    relMinor.setAttribute("text-anchor", "middle");
    relMinor.setAttribute("font-family", "var(--font-mono)");
    relMinor.setAttribute("font-size", "13");
    relMinor.setAttribute("fill", "var(--text-muted)");
    relMinor.textContent = "rel. " + keyData.minor;
    svg.appendChild(relMinor);
}

function familyWedges(slot) {
    const wrap = n => (n + 12) % 12;
    const set = new Set();

    // major
    set.add(`major:${wrap(slot - 1)}`);
    set.add(`major:${slot}`);
    set.add(`major:${wrap(slot + 1)}`);

    // minor
    set.add(`minor:${wrap(slot - 1)}`);
    set.add(`minor:${slot}`);
    set.add(`minor:${wrap(slot + 1)}`);

    // dim
    set.add(`dim:${wrap(slot + 1)}`);

    return set;
}

function romanFor(ringName, slot, selectedSlot) {
    const wrap = n => (n + 12) % 12;
    const rel = wrap(slot - selectedSlot);

    if (ringName === "major") {
        if (rel === 0) return "I";
        if (rel === 1) return "V";
        if (rel === 11) return "IV";
    } else if (ringName === "minor") {
        if (rel === 0) return "vi";
        if (rel === 1) return "iii";
        if (rel === 11) return "ii";
    } else if (ringName === "dim") {
        if (rel === 1) return "viiº";
    }

    return null;
}

buildWheel();