

//==============================================================================

//-- Dependencies --------------------------------
import Pattern from './pattern.js';
import {
    PATTERNS_MAX,
    CHANNELS_NUMBER,
} from '../processor.js';
import {
    setup as setupCursor,
    cursorHighlight,
} from './cursor.js';
import {
    setup as setupCanvas,
    patternDisplay,
} from './canvas.js';

//-- Module State --------------------------------
const patterns = []
let patternNameCount = 0;
let indexPatternCurrent = -1;

//-- Setup ---------------------------------------
export async function setup() {
    // Construct editor DOM
    const editor = document.createElement('div');
    editor.id = 'editor';
    //
    editor.append(await setupCanvas());
    await setupCursor(editor);
    //
    return editor;
}

//-- Pattern Management --------------------------
export function patternSelect(indexPattern) {
    const pattern = patterns[indexPattern];
    if(!pattern) { return false;}
    indexPatternCurrent = indexPattern;
    patternDisplay();
}

//-- Pattern Management --------------------------
export function patternNew() {
    const indexPattern = patterns.length;
    if(indexPattern >= PATTERNS_MAX) { return -1;}
    patterns[indexPattern] = new Pattern();
    patterns[indexPattern].name = `Pattern ${patternNameCount++}`;
    return indexPattern;
}
export function patternFromData(patternData) {
    let indexPattern = patternNew();
    const pattern = patterns[indexPattern];
    pattern.fillData(patternData);
    return indexPattern;
}
export function patternDelete() {
    patterns.splice(indexPatternCurrent, 1);
    // Handle index still valid for pattern list
    if(indexPatternCurrent < patterns.length) {
        patternDisplay();
        return true;
    }
    // Handle valid list, invalid index
    indexPatternCurrent--;
    if(patterns.length) {
        patternDisplay();
        return true;
    }
    // Handle empty list
    indexPatternCurrent = 0;
    patternNew();
    patternDisplay();
    return true;
}

//-- Pattern Display -----------------------------
export function highlightRow(indexRow, indexPattern, scroll) {
    if(indexPattern !== undefined) {
        indexPatternCurrent = indexPattern;
    }
    cursorHighlight(indexRow);
    patternDisplay();
    return true;
}

//-- Pattern Querying ----------------------------
export function patternGet() {
    return patterns[indexPatternCurrent];
}
export function patternDataCompile() {
    return patterns.map(pattern => pattern.data);
}
export function patternDataGet(indexPattern) {
    const pattern = patterns[indexPattern];
    if(!pattern) { return null;}
    return pattern.data;
}
export function patternListGet() {
    const patternData = {
        indexCurrent: indexPatternCurrent,
        length: patterns.length,
        names: patterns.map(pattern => pattern.name),
    };
    return patternData;
}
export function patternCellGet(indexRow, indexChannel) {
    const pattern = patterns[indexPatternCurrent];
    const compoundIndex = indexRow*CHANNELS_NUMBER+indexChannel;
    return pattern.data[compoundIndex];
}

//-- Pattern configuring --------------------------
export function patternLengthGet(indexPattern) {
    if(indexPattern === undefined) {
        indexPattern = indexPatternCurrent;
    }
    const pattern = patterns[indexPattern];
    if(!pattern) { return false;}
    return pattern.data.length / CHANNELS_NUMBER;
}
export function patternLengthAdjust(lengthDelta) {
    const pattern = patterns[indexPatternCurrent];
    const lengthNew = (pattern.data.length / CHANNELS_NUMBER) + lengthDelta;
    patternDisplay();
    return patternLengthSet(lengthNew);
}
export function patternLengthSet(lengthNew) {
    lengthNew = Math.max(1, lengthNew);
    const pattern = patterns[indexPatternCurrent];
    const dataOld = pattern.data;
    const dataNew = new Uint32Array(lengthNew*CHANNELS_NUMBER);
    for(let indexData = 0; indexData < dataOld.length; indexData++) {
        dataNew[indexData] = dataOld[indexData];
    }
    pattern.fillData(dataNew);
    patternDisplay();
    return pattern.data.length / CHANNELS_NUMBER;
}

//-- Pattern Editing -----------------------------
export function editCell(indexRow, indexChannel, value) {
    let pattern = patterns[indexPatternCurrent];
    pattern.editCell(indexRow, indexChannel, value);
    patternDisplay();
}
export function editCellNote(indexRow, indexChannel, value) {
    let pattern = patterns[indexPatternCurrent];
    pattern.editCellNote(indexRow, indexChannel, value);
    patternDisplay();
}
export function editCellInstrument(indexRow, indexChannel, value) {
    let pattern = patterns[indexPatternCurrent];
    pattern.editCellInstrument(indexRow, indexChannel, value);
    patternDisplay();
}
export function editCellVolume(indexRow, indexChannel, value) {
    let pattern = patterns[indexPatternCurrent];
    pattern.editCellVolume(indexRow, indexChannel, value);
    patternDisplay();
}
export function editCellEffects(indexRow, indexChannel, value) {
    let pattern = patterns[indexPatternCurrent];
    pattern.editCellEffects(indexRow, indexChannel, value);
    patternDisplay();
}
