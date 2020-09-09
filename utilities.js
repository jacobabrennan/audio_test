

//== Client Global Constants ===================================================

//-- Canvas Display ------------------------------
export const COLOR_FG = 'white';
export const COLOR_BG = 'black';
export const COLOR_FG_HIGHLIGHT = 'white';
export const COLOR_BG_HIGHLIGHT = '#c0c';
export const COLOR_BG_HINT = '#0078d7';
export const DOM_STYLE_DYNAMIC = `
@font-face {
    font-family: 'press_start_k_regular';
    src: url(data:application/x-font-woff;charset=utf-8;base64,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);
    font-weight: normal;
    font-style: normal;
}`;
export const FONT_FAMILY = 'press_start_k_regular';
export const FONT_SIZE = 16;
export const CHAR_HEART = 'Œ';

//------------------------------------------------
export const DISPLAY_HEIGHT_DEFAULT = 40;


//== Canvas Utilities ==========================================================

//-- Module State --------------------------------
let tabIndex = 1;

//-- Configure -----------------------------------
export function contextConfigure(context) {
    context.canvas.tabIndex = tabIndex;
    tabIndex++;
    context.imageSmoothingEnabled = false;
    context.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
}


//== Note Name / Nubmer formatting =============================================

//-- Dependencies --------------------------------
import {
    MASK_CELL_NOTE_WIDTH,
    MASK_CELL_NOTE_STOP,
} from './libraries/audio_processor.js';

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
