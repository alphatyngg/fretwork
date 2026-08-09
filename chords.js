const SVG_NS = "http://www.w3.org/2000/svg";

const CHORD_SHAPES = {
    C: {
        major: [
            {
                frets: [-1, 3, 2, 0, 1, 0],
                fingers: [0, 3, 2, 0, 1, 0],
                baseFret: 1,
                label: "C open",
                note: "Open position"
            }
        ]
    }
};

console.log(CHORD_SHAPES);