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

const RINGS = {
    major: { inner: 90,  outer: 150 },
    minor: { inner: 150, outer: 205 },
    dim:   { inner: 205, outer: 250 }
};

let wedgeRefs = [];

function buildWheel() {
    const svg = document.getElementById("chordWheel");
    svg.innerHTML = "";
    svg.setAttribute("viewBox", `0 0 ${VIEW_SIZE} ${VIEW_SIZE}`);
    wedgeRefs = [];

    WHEEL_KEYS.forEach((keyData, slot) => {
        drawWedge(svg, slot, RINGS.major, "major", keyData.major, "var(--accent-root)");
        drawWedge(svg, slot, RINGS.minor, "minor", keyData.minor, "var(--accent-scale)");
        drawWedge(svg, slot, RINGS.dim,   "dim",   keyData.dim,   "var(--accent-dim)");
    });

    drawHub(svg);
    updateHighlight();
}

function updateHighlight() {
    const family = familyWedges(WHEEL_STATE.selectedSlot);

    wedgeRefs.forEach(ref => {
        const inFamily = family.has(`${ref.ringName}:${ref.slot}`);
        ref.path.setAttribute("opacity", inFamily ? "1" : "0.35");
        ref.nameText.setAttribute("opacity", inFamily ? "1" : "0.45");

        const roman = inFamily ? romanFor(ref.ringName, ref.slot, WHEEL_STATE.selectedSlot) : null;
        ref.romanText.textContent = roman || "";
        ref.romanText.setAttribute("opacity", roman ? "0.7" : "0");
    });

    const svg = document.getElementById("chordWheel");
    drawFamilyOutline(svg);
    drawHub(svg);
    drawKeyMarker(svg);
}

function drawWedge(svg, slot, ring, ringName, label, fill) {
    // wedge shape
    const path = document.createElementNS(SVG_NS, "path");

    path.setAttribute("d", wedgePath(slot, ring.inner, ring.outer));
    path.setAttribute("fill", fill);
    path.setAttribute("stroke", "var(--color-bg)");
    path.setAttribute("stroke-width", "2");
    path.style.cursor = "pointer";
    path.addEventListener("click", () => {
        WHEEL_STATE.selectedSlot = slot;
        updateHighlight();
    })
    svg.appendChild(path);

    // label text (centered)
    const midR = (ring.inner + ring.outer) / 2;
    const pos = pointAt(slot, midR);
    const nameText = document.createElementNS(SVG_NS, "text");

    nameText.setAttribute("x", pos.x);
    nameText.setAttribute("y", pos.y + 5);
    nameText.setAttribute("text-anchor", "middle");
    nameText.setAttribute("font-family", "var(--font-display)");
    nameText.setAttribute("font-size", "15");
    nameText.setAttribute("font-weight", "700");
    nameText.setAttribute("fill", "var(--color-bg)");
    nameText.style.pointerEvents = "none";
    nameText.textContent = label;
    svg.appendChild(nameText);

    // roman numeral
    const numOffset = ringName === "dim" ? 9 : 12;
    const romanText = document.createElementNS(SVG_NS, "text");

    romanText.setAttribute("x", pos.x);
    romanText.setAttribute("y", pos.y - numOffset);
    romanText.setAttribute("text-anchor", "middle");
    romanText.setAttribute("font-family", "var(--font-mono)");
    romanText.setAttribute("font-size", "10");
    romanText.setAttribute("font-weight", "700");
    romanText.setAttribute("fill", "var(--color-bg)");
    romanText.style.pointerEvents = "none";
    svg.appendChild(romanText);
    
    wedgeRefs.push({ path, nameText, romanText, slot, ringName });
}

function drawHub(svg) {
    // removing old hub
    const old = svg.querySelector("#hubGroup");
    if (old) old.remove();

    const g = document.createElementNS(SVG_NS, "g");
    g.setAttribute("id", "hubGroup");

    const keyData = WHEEL_KEYS[WHEEL_STATE.selectedSlot];

    // hub bgd circle
    const circle = document.createElementNS(SVG_NS, "circle");
    circle.setAttribute("cx", CX);
    circle.setAttribute("cy", CY);
    circle.setAttribute("r", 84);
    circle.setAttribute("fill", "var(--color-surface)");
    circle.setAttribute("stroke", "var(--text)");
    circle.setAttribute("stroke-width", "0.5");
    g.appendChild(circle);

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
    g.appendChild(caption);

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
    g.appendChild(keyName);

    // relative minor (smaller)
    const relMinor = document.createElementNS(SVG_NS, "text");
    relMinor.setAttribute("x", CX);
    relMinor.setAttribute("y", CY + 34);
    relMinor.setAttribute("text-anchor", "middle");
    relMinor.setAttribute("font-family", "var(--font-mono)");
    relMinor.setAttribute("font-size", "13");
    relMinor.setAttribute("fill", "var(--text-muted)");
    relMinor.textContent = "rel. " + keyData.minor;
    g.appendChild(relMinor);

    svg.appendChild(g);
}

function drawFamilyOutline(svg) {
    // remove old outline
    const old = svg.querySelector("#familyOutline");
    if (old) old.remove();

    const slot = WHEEL_STATE.selectedSlot;
    const wrap = n => (n + 12) % 12;

    const majInner = RINGS.major.inner;
    const minOuter = RINGS.minor.outer;
    const dimOuter = RINGS.dim.outer;

    const pt = (slotEdge, r) => {
        const a = (slotEdge * 30 - 90) * Math.PI / 180;
        return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
    };

    // edges
    const leftEdge = slot - 1 - 0.5;
    const midEdge = slot + 1 - 0.5;
    const rightEdge = slot + 1 + 0.5;

    // corners
    const p1 = pt(leftEdge, majInner);
    const p2 = pt(leftEdge, minOuter);
    const p3 = pt(midEdge, minOuter);
    const p4 = pt(midEdge, dimOuter);
    const p5 = pt(rightEdge, dimOuter);
    const p6 = pt(rightEdge, majInner);

    const d = [
        `M ${p1.x} ${p1.y}`,
        `L ${p2.x} ${p2.y}`,
        `A ${minOuter} ${minOuter} 0 0 1 ${p3.x} ${p3.y}`,
        `L ${p4.x} ${p4.y}`,
        `A ${dimOuter} ${dimOuter} 0 0 1 ${p5.x} ${p5.y}`,
        `L ${p6.x} ${p6.y}`,
        `A ${majInner} ${majInner} 0 0 0 ${p1.x} ${p1.y}`,
        "Z"
    ].join(" ");

    const outline = document.createElementNS(SVG_NS, "path");
    outline.setAttribute("id", "familyOutline");
    outline.setAttribute("d", d);
    outline.setAttribute("fill", "none");
    outline.setAttribute("stroke", "var(--text)");
    outline.setAttribute("stroke-width", "3");
    outline.style.pointerEvents = "none";
    svg.appendChild(outline);
}

function drawKeyMarker(svg) {
    const old = svg.querySelector("#keyMarker");
    if (old) old.remove();

    const slot = WHEEL_STATE.selectedSlot;

    const g = document.createElementNS(SVG_NS, "g");
    g.setAttribute("id", "keyMarker");
    g.style.pointerEvents = "none";

    g.setAttribute("transform", `rotate(${slot * 30}, ${CX}, ${CY})`);

    const pos = pointAt(0, RINGS.major.inner);
    const w = 38, h = 15;

    const tab = document.createElementNS(SVG_NS, "rect");
    tab.setAttribute("x", pos.x - w / 2);
    tab.setAttribute("y", pos.y - h / 2);
    tab.setAttribute("width", w);
    tab.setAttribute("height", h);
    tab.setAttribute("rx", 4);
    tab.setAttribute("fill", "var(--text)");
    tab.setAttribute("stroke", "var(--text)");
    tab.setAttribute("stroke-width", "2.5");
    g.appendChild(tab);

    const label = document.createElementNS(SVG_NS, "text");
    label.setAttribute("x", pos.x);
    label.setAttribute("y", pos.y + 3.5);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("font-family", "var(--font-mono)");
    label.setAttribute("font-size", "9");
    label.setAttribute("font-weight", "700");
    label.setAttribute("letter-spacing", "1");
    label.setAttribute("fill", "var(--color-bg)");
    label.textContent = "KEY";
    g.appendChild(label);

    svg.appendChild(g);
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