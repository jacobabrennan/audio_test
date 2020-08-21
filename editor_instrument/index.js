

//==============================================================================

//-- Dependencies --------------------------------
import {
    EDITOR_PANE_INSTRUMENT,
    CONTROL_GROUP_EDITOR_SWAP,
    CONTROL_GROUP_INSTRUMENT_SELECT,
    CONTROL_GROUP_PLAYBACK,
    CONTROL_GROUP_PATTERN,
    EDITOR_PANE_PATTERN,
} from '../utilities.js';
import { paneAdd, paneGet } from '../pane/pane_editor.js';
import { groupRegister } from '../pane/pane_control.js';
import { setupControlInstrumentSelect } from './controls.js';
import { setup as setupCanvas } from './canvas.js';
import { canvasHeightSet } from '../editor_pattern/canvas.js';

//-- Setup ---------------------------------------
export async function setup() {
    const paneInstrument = document.createElement('div');
    paneInstrument.append(await setupCanvas());
    //
    paneAdd(EDITOR_PANE_INSTRUMENT, paneInstrument, [
        CONTROL_GROUP_EDITOR_SWAP,
        CONTROL_GROUP_PLAYBACK,
        CONTROL_GROUP_PATTERN,
        CONTROL_GROUP_INSTRUMENT_SELECT,
    ]);
    //
    const groupInstrumentSelect = await setupControlInstrumentSelect();
    groupRegister(CONTROL_GROUP_INSTRUMENT_SELECT, groupInstrumentSelect);
    //
    return paneInstrument;
}
export function instrumentEditorShown() {
    let paneInstrument = paneGet(EDITOR_PANE_INSTRUMENT);
    let editorCanvas = paneGet(EDITOR_PANE_PATTERN);
    canvasHeightSet(16);
    paneInstrument.prepend(editorCanvas);
}
