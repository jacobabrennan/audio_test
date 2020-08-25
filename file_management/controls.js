

//==============================================================================

import {
    instrumentDataCompile,
    populateFromData as populateInstruments,
} from '../editor_instrument/instrument.js';
import {
    patternDataCompile,
    populateFromData as populatePatterns,
    lengthGet,
} from '../editor_pattern/pattern.js';
import {
    volumeGet,
    bpsGet,
    tpbGet,
    loadFromData,
} from '../editor_pattern/control_playback.js';
import { instrumentListUpdate } from '../editor_instrument/controls.js';
import {
    patternListUpdate,
    loadFromData as setLength,
} from '../editor_pattern/control_pattern.js';
import { closeInstrumentEditor } from '../pane/pane_editor.js';

//------------------------------------------------
export function songSave() {
    //
    const patterns = patternDataCompile().map(
        pattern => Array.from(pattern)
    );
    let songData = {
        volume: volumeGet(),
        bps: bpsGet(),
        tpb: tpbGet(),
        patterns: patterns,
        instruments: instrumentDataCompile(),
    };
    //
    songData = JSON.stringify(songData);
    console.log(songData)
}
export function songLoad(songData) {
    //
    songData = JSON.parse(songData);
    //
    const patterns = songData.patterns.map(
        pattern => Uint32Array.from(pattern)
    );
    populatePatterns(patterns);
    loadFromData(songData);
    populateInstruments(songData.instruments);
    //
    setLength(lengthGet());
    instrumentListUpdate();
    patternListUpdate();
    closeInstrumentEditor();
}
document.songLoad = songLoad;
document.songSave = songSave;
