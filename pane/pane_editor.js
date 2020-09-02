

//==============================================================================

//-- Dependencies --------------------------------
// import {
//     groupHideAll,
//     groupShow,
//     groupRegister,
// } from './pane_control.js';
// import {
//     EDITOR_PANE_PATTERN,
//     EDITOR_PANE_INSTRUMENT,
//     CONTROL_GROUP_EDITOR_SWAP,
// } from '../utilities.js';
// // import Button, { ButtonBar } from '../controls/button.js';
// import { patternEditorShown } from '../editor_pattern/index.js';
// import { instrumentEditorShown } from '../editor_instrument/index.js';
// import { instrumentListUpdate } from '../editor_instrument/controls.js';
// import { instrumentGet, instrumentSelect } from '../editor_instrument/instrument.js';
// import { controlStripUpdate } from '../editor_instrument/control_strip.js';
// import { instrumentDraw } from '../editor_instrument/canvas.js';




//== Controls ==================================================================

//-- Module State --------------------------------
let instrumenteditorVisible = false;
let instToggle;

//-- Setup ---------------------------------------
export async function setupControls() {
    const controlGroup = document.createElement('div');
    controlGroup.className = 'control_group';
    instToggle = new Button(controlGroup, 'EditInstrument', () => {
        if(instrumenteditorVisible) {
            closeInstrumentEditor();
        }
        else {
            instrumentListUpdate();
            controlStripUpdate();
            instrumentDraw();
            instrumenteditorVisible = true;
            instToggle.element.classList.add('selected');
            paneSelect(EDITOR_PANE_INSTRUMENT);
            instrumentEditorShown();
        }
    });
    return controlGroup;
}

//------------------------------------------------
export function closeInstrumentEditor() {
    if(instrumenteditorVisible) {
        instrumenteditorVisible = false;
        instToggle.element.classList.remove('selected');
        paneSelect(EDITOR_PANE_PATTERN);
        patternEditorShown();
        instrumentListUpdate()
    }
}
