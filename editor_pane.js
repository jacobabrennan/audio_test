

//==============================================================================

//-- Dependencies --------------------------------
import { setup as setupEditorPattern } from './editor_pattern/index.js';
import { setup as setupEditorInstrument } from './editor_instrument/index.js';

//-- Constants -----------------------------------
export const EDITOR_PANE_PATTERN = 'editor_pane_pattern';
export const EDITOR_PANE_INSTRUMENT = 'editor_pane_instrument';

//-- Module State --------------------------------
let editor;
const panes = {};
let idPaneCurrent;

//-- Setup ---------------------------------------
export async function setup() {
    // Create DOM container
    editor = document.createElement('div');
    // Generate Panes
    const panePattern = await setupEditorPattern();
    paneAdd(EDITOR_PANE_PATTERN, panePattern);
    const paneInstrument = await setupEditorInstrument();
    paneAdd(EDITOR_PANE_INSTRUMENT, paneInstrument);
    // Return DOM container
    return editor;
}

//-- Controls ------------------------------------
export async function setupControls() {
    const controlGroup = document.createElement('div');
    controlGroup.className = 'control_group';
    const switchPattern = document.createElement('button');
    const switchInstrument = document.createElement('button');
    switchPattern.innerText = 'Pattern Editor';
    switchInstrument.innerText = 'Instrument Editor';
    controlGroup.append(switchPattern, switchInstrument);
    return controlGroup;
}

//------------------------------------------------
export function paneSelect(idPane) {
    // Hide old pane
    const paneOld = panes[idPaneCurrent];
    if(paneOld) {
        paneOld.remove();
    }
    // Show new pane
    const paneNew = panes[idPane];
    if(paneNew) {
        editor.append(paneNew);
        idPaneCurrent = idPane;
    }
}
export function paneAdd(idPane, elementPane) {
    panes[idPane] = elementPane;
    editor.append(elementPane);
}
