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