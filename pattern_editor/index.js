

//==============================================================================

//-- Dependencies --------------------------------
import Pattern from './pattern.js';

//-- Module State --------------------------------
let tableBody = null;
let patternCurrent = null;

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
export function patternLoad(patternData) {
    patternCurrent = new Pattern();
    patternCurrent.fillData(patternData);
    patternDisplay(patternCurrent);
    return patternCurrent;
}
export function patternDisplay(pattern) {
    tableBody.replaceWith(pattern.element);
}
export function highlightRow(indexRow, scroll) {
    patternCurrent.highlightRow(indexRow, scroll);
}
// export function fillData(patternData) {
//     pattern.fillData(patternData);
// }
export function patternGet() {
    return patternCurrent.data;
}
