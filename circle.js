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
        drawWedge(svg, slot, RINGS.major, keyData.major, "var(--accent-root)");
        drawWedge(svg, slot, RINGS.minor, keyData.minor, "var(--accent-scale)");
        drawWedge(svg, slot, RINGS.dim,   keyData.dim,   "var(--color-surface-2)");
    });
}

function drawWedge(svg, slot, ring, label, fill) {
    // wedge shape
    const path = document.createElementNS(SVG_NS, "path");

    path.setAttribute("d", wedgePath(slot, ring.inner, ring.outer));
    path.setAttribute("fill", fill);
    path.setAttribute("stroke", "var(--color-bg)");
    path.setAttribute("stroke-width", "2");
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
    text.textContent = label;
    svg.appendChild(text);
}

buildWheel();