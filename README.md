# Fretwork

A guitar practice companion in your browser - visualize scales on a fretboard, hear the notes, and keep time with a built-in metronome for practicing.

## Features
- Interactive fretboard - highlights any scale in any key across all 6 strings
- Click any fret to hear the note, or tab through them with keyboard (tab + enter)
- Toggle labels between note name, scale degree, and interval
- Chromatic root picker, 7 scale types
- Metronome with adjustable BPM, tap tempo

## Usage
No build step, no dependencies. Just open `index.html` in your local browser. 

```bash
git clone https://github.com/alphatyngg/fretwork.git
cd fretwork
open index.html 
```

## Tech
Plain HTML, CSS, vanilla JS. 
Fretboard drawn as inline SVG, audio runs on Web Audio API

## Status
Core functionality & visuals complete. 
Next: splitting into a multipage site + circle of fifths + chords reference

## Coming soon
- Circle of Fifths page
- Chord library page
- Karplus-Strong string synthesis for more realistic pluck sounds