# Fretwork

A guitar practice companion in your browser - visualize scales on a fretboard, explore key relationships on an interactive chord wheel, hear the notes, and keep time with a built-in metronome for practicing.

**[Live site → fretworkapp.com](https://fretworkapp.com)**

## Features

### Fretboard
- Interactive fretboard with real (logarithmic) fret spacing across all 6 strings
- Highlights any scale in any key
- Click any fret to hear the note, or tab through them with keyboard
- Toggle labels between note name, scale degree, and interval
- Chromatic root picker, 7 scale types

### Circle of Fifths
- Interactive chord wheel showing all 12 keys
- Click any key to highlight its diatonic chord family
- Roman numeral labels & rotating key indicator
- Major, minor, and diminished chords across 3 rings

### Metronome
- Adjustable BPM with tempo names and tap tempo
- Time signature with visual beat indicators
- Accurate lookahead scheduling via Web Audio API

## Usage
No build step, no dependencies. Visit [fretworkapp.com](https://fretworkapp.com), or run it locally: 

```bash
git clone https://github.com/alphatyngg/fretwork.git
cd fretwork
open index.html 
```

## Tech
Plain HTML, CSS, vanilla JS. 
Fretboard & chord wheel drawn as inline SVG, audio runs on Web Audio API

## Status 🟠
Fretboard, chord wheel, and metronome complete.
Currently working: Chords Library

## Coming soon
- Chord library page (fretboard shape diagrams)
- Karplus-Strong string synthesis for more realistic pluck sounds