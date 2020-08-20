

//==============================================================================

//-- Dependencies --------------------------------
import { DISPLAY_PIXEL_WIDTH } from './editor_pattern/canvas.js';
import { groupHideAll, groupShow } from './pane_control.js';

//-- Module State --------------------------------
let editor;
const panes = {};
const paneControlGroups = {};
let idPaneCurrent;

//-- Setup ---------------------------------------
export async function setup() {
    // Create DOM container
    editor = document.createElement('div');
    editor.style.width = `${DISPLAY_PIXEL_WIDTH}px`;
    // Return DOM container
    return editor;
}

//------------------------------------------------
export function paneSelect(idPane) {
    // Hide old pane
    const paneOld = panes[idPaneCurrent];
    if(paneOld) {
        paneOld.remove();
        idPaneCurrent = undefined;
    }
    groupHideAll();
    // Show new pane
    const paneNew = panes[idPane];
    if(!paneNew) { return;}
    idPaneCurrent = idPane;
    editor.append(paneNew);
    // Show associated control groups
    const controlGroupsNew = paneControlGroups[idPane];
    for(let idGroup of controlGroupsNew) {
        groupShow(idGroup);
    }
}
export function paneAdd(idPane, elementPane, controlGroups) {
    panes[idPane] = elementPane;
    paneControlGroups[idPane] = controlGroups;
}


//== Controls ==================================================================

//-- Setup ---------------------------------------
export async function setupControls() {
    const controlGroup = document.createElement('div');
    controlGroup.className = 'control_group';
    const switchPattern = document.createElement('button');
    const switchInstrument = document.createElement('button');
    switchPattern.innerText = 'Pattern Editor';
    switchInstrument.innerText = 'Instrument Editor';
    switchPattern.addEventListener('click', handleSelectPattern);
    switchInstrument.addEventListener('click', handleSelectInstrument);
    controlGroup.append(switchPattern, switchInstrument);
    return controlGroup;
}

//-- Interaction Handlers ------------------------
function handleSelectPattern() {
    paneSelect(EDITOR_PANE_PATTERN);
}
function handleSelectInstrument() {
    paneSelect(EDITOR_PANE_INSTRUMENT);
}
