

//==============================================================================

//-- Dependencies --------------------------------
import { DISPLAY_PIXEL_WIDTH } from '../editor_pattern/canvas.js';
import {
    groupHideAll,
    groupShow,
    groupRegister,
} from './pane_control.js';
import {
    EDITOR_PANE_PATTERN,
    EDITOR_PANE_INSTRUMENT,
    CONTROL_GROUP_EDITOR_SWAP,
} from '../utilities.js';

//-- Module State --------------------------------
let editor;
const panes = {};
const paneControlGroups = {};
let idPaneCurrent;

//-- Setup ---------------------------------------
export async function setup() {
    // Create DOM container
    editor = document.createElement('div');
    editor.id = 'editor';
    editor.style.width = `${DISPLAY_PIXEL_WIDTH}px`;
    // Register pane controls
    const controls = await setupControls();
    groupRegister(CONTROL_GROUP_EDITOR_SWAP, controls);
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
    switchInstrument.innerText = 'Ins. Editor';
    switchPattern.addEventListener('click', () => {
        switchInstrument.classList.remove('selected');
        switchPattern.classList.add('selected');
        paneSelect(EDITOR_PANE_PATTERN);
    });
    switchInstrument.addEventListener('click', () => {
        switchPattern.classList.remove('selected');
        switchInstrument.classList.add('selected');
        paneSelect(EDITOR_PANE_INSTRUMENT);
    });
    switchPattern.classList.add('selected');
    controlGroup.append(switchPattern, switchInstrument);
    return controlGroup;
}
