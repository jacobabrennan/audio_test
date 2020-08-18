

//==============================================================================

//-- Dependencies --------------------------------
import Pattern from './pattern.js';
import {
    PATTERNS_MAX,
    CHANNELS_NUMBER,
    cellParse,
} from '../processor.js';
import {
    patternListUpdate,
} from '../controls/pattern.js';
import {
    handleMouseDown,
    handleMouseUp,
    handleKeyDown,
    cursorHighlight,
} from './cursor.js';
import {
    noteNumberToName,
} from '../utilities.js';
import {
    setup as setupCanvas,
    drawPatternGrid,
    placeString,
} from './canvas.js';

//-- Constants -----------------------------------
export const CELL_WIDTH = 9;

//-- Module State --------------------------------
let context;
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
    //
    editor.addEventListener('mousedown', (eventMouse) => {
        let coordDown = handleMouseDown(eventMouse);
        drawPatternGrid();
    });
    editor.addEventListener('mouseup', (eventMouse) => {
        let coordUp = handleMouseUp(eventMouse);
        drawPatternGrid();
    });
    editor.addEventListener('keydown', (eventKeyboard) => {
        handleKeyDown(eventKeyboard);
        drawPatternGrid();
    });
    return editor;
}

//-- Pattern Management --------------------------
export function patternSelect(indexPattern) {
    const pattern = patterns[indexPattern];
    if(!pattern) { return false;}
    indexPatternCurrent = indexPattern;
    patternDisplay();
}

//-- Pattern Display -----------------------------
function heightSet(lines) {
    context.canvas.height = lines*FONT_SIZE;
    context.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
}
export function patternDisplay() {
    const pattern = patterns[indexPatternCurrent];
    patternGrid = new Array(pattern.data.length*CELL_WIDTH)
    //
    const rows = pattern.data.length / CHANNELS_NUMBER;
    heightSet(rows);
    for(let row = 0; row < rows; row++) {
        const offsetRow = row*CHANNELS_NUMBER;
        for(let channel = 0; channel < CHANNELS_NUMBER; channel++) {
            drawCell(row, channel, pattern.data[offsetRow+channel]);
        }
    }
    //
    patternListUpdate();
    drawPatternGrid();
    return true;
}
function drawCell(row, channel, dataCell) {
    const offsetX = channel*CELL_WIDTH;
    const offsetY = row;
    const [note, instrument, volume, effects] = cellParse(dataCell);
    if(note === undefined) {
        placeString('···', offsetX, offsetY);
    } else {
        const noteName = noteNumberToName(note);
        placeString(noteName, offsetX, offsetY);
    }
    if(instrument === undefined) {
        placeString('·', offsetX+3, offsetY);
    } else {
        placeString(instrument.toString(16), offsetX+3, offsetY);
    }
    if(volume === undefined) {
        placeString('··', offsetX+4, offsetY);
    } else {
        placeString(volume.toString(16).padStart(2,'0'), offsetX+4, offsetY);
    }
    if(effects === undefined) {
        placeString('···', offsetX+6, offsetY);
    } else {
        placeString(effects.toString(16).padStart(3,'0'), offsetX+6, offsetY);
    }
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
