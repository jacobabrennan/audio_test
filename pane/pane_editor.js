

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
import { ButtonBar } from '../controls/button.js';

//-- Module State --------------------------------
let editor;
const panes = {};
const paneControlGroups = {};
const panesOnfocus = {};
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
    // Inform pane of gaining focus
    const onFocus = panesOnfocus[idPane];
    if(onFocus) {
        onfocus();
    }
}
export function paneAdd(idPane, elementPane, controlGroups, onFocus) {
    panes[idPane] = elementPane;
    paneControlGroups[idPane] = controlGroups;
    panesOnfocus[idPane] = onFocus;
}
export function paneGet(idPane) {
    return panes[idPane];
}


//== Controls ==================================================================

//-- Setup ---------------------------------------
export async function setupControls() {
    const controlGroup = document.createElement('div');
    controlGroup.className = 'control_group';
    const labelP = 'Pttrn.';
    const labelI = 'Inst.';
    const switchBar = new ButtonBar(controlGroup, {
        [labelP]: () => {
            switchBar.buttonGet(labelI).element.classList.remove('selected');
            switchBar.buttonGet(labelP).element.classList.add('selected');
            paneSelect(EDITOR_PANE_PATTERN);
        },
        [labelI]: () => {
            switchBar.buttonGet(labelP).element.classList.remove('selected');
            switchBar.buttonGet(labelI).element.classList.add('selected');
            paneSelect(EDITOR_PANE_INSTRUMENT);
        }
    });
    switchBar.buttonGet(labelP).element.classList.add('selected');
    return controlGroup;
}
