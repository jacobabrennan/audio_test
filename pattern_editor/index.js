

//==============================================================================

//-- Dependencies --------------------------------
import Pattern from './pattern.js';
import { PATTERNS_MAX } from '../processor.js';

//-- Module State --------------------------------
let tableBody = null;
let indexPatternCurrent = -1;
const patterns = [];

//------------------------------------------------
export async function setup(containerId) {
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
        channel.innerHTML = channelName;
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
        // channel.innerHTML = channelName;
        superfluousRowElement2.append(channel);
    }
    footer.append(superfluousRowElement2);
    patternTable.append(footer);
    // Add to client
    editor.append(patternTable);
    const container = document.getElementById(containerId);
    container.prepend(editor);
}
export function patternNew() {
    const indexPattern = patterns.length;
    if(indexPattern >= PATTERNS_MAX) { return -1;}
    patterns[indexPattern] = new Pattern();
    return indexPattern;
}
export function patternDisplay(indexPattern) {
    const pattern = patterns[indexPattern];
    if(!pattern) { return false;}
    indexPatternCurrent = indexPattern;
    tableBody.replaceWith(pattern.element);
    return true;
}
export function highlightRow(indexRow, indexPattern, scroll) {
    if(indexPattern !== undefined && indexPatternCurrent !== indexPattern) {
        let success = patternDisplay(indexPattern);
        if(!success) { return false;}
    }
    let patternCurrent = patterns[indexPatternCurrent];
    patternCurrent.highlightRow(indexRow, scroll);
}
export function patternGet(indexPattern) {
    const pattern = patterns[indexPattern];
    if(!pattern) { return false;}
    return pattern.data;
}
export function patternFromData(patternData) {
    let indexPattern = patternNew();
    const pattern = patterns[indexPattern];
    pattern.fillData(patternData);
    return indexPattern;
}
export function patternDataGet(indexPattern) {
    const pattern = patterns[indexPattern];
    if(!pattern) { return null;}
    return pattern.data;
}
