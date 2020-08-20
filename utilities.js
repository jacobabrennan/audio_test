

//== Client Global Constants ===================================================

//-- Edit & Control Group IDs --------------------
export const EDITOR_PANE_PATTERN = 'editor_pane_pattern';
export const EDITOR_PANE_INSTRUMENT = 'editor_pane_instrument';
export const CONTROL_GROUP_PATTERN = 'control_group_pattern';
export const CONTROL_GROUP_PLAYBACK = 'control_group_playback';

//== Note Name / Nubmer formatting =============================================

//-- Dependencies --------------------------------
import {
    MASK_CELL_NOTE_WIDTH,
    MASK_CELL_NOTE_STOP,
} from './processor.js';

//-- Constants -----------------------------------
const noteLetters = ['A','Bb','B','C','C#','D','Eb','E','F','F#','G','Ab'];

//-- Utilities -----------------------------------
export function noteFormatName(note) {
    let letter = note[0].toUpperCase();
    let octave = 2;
    if(note.length === 1) { // 'b' => 'B 4'
        return letter+' '+octave;
    }
    if(note.length === 3) { // 'bb2' => 'Bb2'
        return letter+note[1]+note[2];
    }
    if(note[1] === '#' || note[1] === 'b') { // 'bb' => 'Bb4'
        return letter+note[1]+octave;
    }
    return letter+' '+note[1]; // 'b4' => 'B 4'
}
export function noteNameToNumber(note) {
    let letter = note[0];
    if(note[1] !== ' ') {
        letter = note[0]+note[1];
    }
    let noteOffset = noteLetters.indexOf(letter);
    let octave = parseInt(note[2]);
    if(noteOffset > 2) { octave--}
    if(noteOffset === -1) { return false;}
    noteOffset += octave*12;
    if(!Number.isFinite(noteOffset)) { return false;}
    if(noteOffset > (Math.pow(2, MASK_CELL_NOTE_WIDTH)-1)) { return false;}
    if(noteOffset < 0) { return false;}
    return noteOffset;
}
export function noteNumberToName(note) {
    if(note === MASK_CELL_NOTE_STOP) {
        return '###';
    }
    let letter = noteLetters[note%12];
    let octave = Math.floor(note/12);
    if(note%12 > 2) {
        octave++;
    }
    return letter.padEnd(2,' ') + octave.toString();
}
