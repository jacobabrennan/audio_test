

//==============================================================================

//-- Dependencies --------------------------------
import Pattern from './pattern.js';
import { PATTERNS_MAX, CHANNELS_NUMBER } from '../processor.js';
import { patternListUpdate } from '../controls/pattern.js';

//-- Module State --------------------------------
let tableBody = null;
let indexPatternCurrent = -1;
const patterns = [];
let patternNameCount = 0;

//------------------------------------------------
export async function setup() {
    // Create Editor
    const editor = document.createElement('div');
    editor.id = 'pattern_editor';
    // Create table
    const patternTable = document.createElement('table');
    // Create table header
    const channelHeader = document.createElement('thead');
    const superfluousRowElement = document.createElement('tr');
    for(let channelName of [' ', 'Pulse1', 'Pulse2', 'Saw', 'Triangle', 'Noise']) {
        const channel = document.createElement('td');
        channel.className = 'pattern_header_channel';
        channel.innerText = channelName;
        superfluousRowElement.append(channel);
    }
    channelHeader.append(superfluousRowElement);
    patternTable.append(channelHeader);
    // Create table body (for swapping later)
    tableBody = document.createElement('tbody');
    patternTable.append(tableBody);
    // Create table footer
    const footer = document.createElement('tfoot');
    const superfluousRowElement2 = document.createElement('tr');
    for(let channelName of [' ', 'Pulse1', 'Pulse2', 'Saw', 'Triangle', 'Noise']) {
        const channel = document.createElement('td');
        channel.className = 'pattern_footer_channel';
        // channel.innerText = channelName;
        superfluousRowElement2.append(channel);
    }
    footer.append(superfluousRowElement2);
    patternTable.append(footer);
    // Add to client
    editor.append(patternTable);
    return editor;
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
export function patternDelete(indexPattern) {
    // Default to removing the current pattern
    if(indexPattern === undefined) {
        indexPattern = indexPatternCurrent;
    }
    // Retreive indexed pattern
    const pattern = patterns[indexPattern];
    if(!pattern) { return false;}
    // Replace display pattern
    if(tableBody === pattern.element) {
        for(let indexPatternNew = 0; indexPatternNew < patterns.length; indexPatternNew++) {
            if(indexPatternNew !== indexPattern) {
                patternDisplay(indexPatternNew);
                break;
            }
        }
    }
    // Create new pattern if necessary (a pattern must always be displayed)
    if(tableBody === pattern.element) {
        patternDisplay(patternNew());
    }
    // Ensure indexPatternCurrent is correct
    if(indexPatternCurrent >= indexPattern) {
        indexPatternCurrent--;
    }
    // Remove old pattern
    patterns.splice(indexPattern, 1);
    return true;
}

//-- Pattern Display -----------------------------
export function patternDisplay(indexPattern) {
    const pattern = patterns[indexPattern];
    if(!pattern) { return false;}
    indexPatternCurrent = indexPattern;
    tableBody.replaceWith(pattern.element);
    tableBody = pattern.element;
    patternListUpdate();
    return true;
}
export function highlightRow(indexRow, indexPattern, scroll) {
    if(indexPattern !== undefined && indexPatternCurrent !== indexPattern) {
        let success = patternDisplay(indexPattern);
        if(!success) {return false;}
    }
    let patternCurrent = patterns[indexPatternCurrent];
    patternCurrent.highlightRow(indexRow, scroll);
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

//-- Pattern configuring --------------------------
export function patternLengthGet(indexPattern) {
    if(indexPattern === undefined) {
        indexPattern = indexPatternCurrent;
    }
    const pattern = patterns[indexPattern];
    if(!pattern) { return false;}
    return pattern.data.length / CHANNELS_NUMBER;
}
export function patternLengthAdjust(indexPattern, lengthDelta) {
    if(indexPattern === undefined) {
        indexPattern = indexPatternCurrent;
    }
    const pattern = patterns[indexPattern];
    if(!pattern) { return false;}
    const lengthNew = pattern.rows.length + lengthDelta;
    return patternLengthSet(indexPattern, lengthNew);
}
export function patternLengthSet(indexPattern, lengthNew) {
    lengthNew = Math.max(1, lengthNew);
    if(indexPattern === undefined) {
        indexPattern = indexPatternCurrent;
    }
    const pattern = patterns[indexPattern];
    if(!pattern) { return false;}
    const dataOld = pattern.data;
    const dataNew = new Uint32Array(lengthNew*CHANNELS_NUMBER);
    for(let indexData = 0; indexData < dataOld.length; indexData++) {
        dataNew[indexData] = dataOld[indexData];
    }
    pattern.fillData(dataNew);
    return pattern.data.length / CHANNELS_NUMBER;
}

//-- Pattern Editing -----------------------------
export function editCellNote(indexPattern, indexRow, indexChannel, value) {
    if(indexPattern === undefined) {
        indexPattern = indexPatternCurrent;
    }
    let pattern = patterns[indexPattern];
    pattern.editCellNote(indexRow, indexChannel, value);
}
export function editCellInstrument(indexPattern, indexRow, indexChannel, value) {
    if(indexPattern === undefined) {
        indexPattern = indexPatternCurrent;
    }
    let pattern = patterns[indexPattern];
    pattern.editCellInstrument(indexRow, indexChannel, value);
}
export function editCellVolume(indexPattern, indexRow, indexChannel, value) {
    if(indexPattern === undefined) {
        indexPattern = indexPatternCurrent;
    }
    let pattern = patterns[indexPattern];
    pattern.editCellVolume(indexRow, indexChannel, value);
}
export function editCellEffects(indexPattern, indexRow, indexChannel, value) {
    if(indexPattern === undefined) {
        indexPattern = indexPatternCurrent;
    }
    let pattern = patterns[indexPattern];
    pattern.editCellEffects(indexRow, indexChannel, value);
}
