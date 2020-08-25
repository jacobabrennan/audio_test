

//==============================================================================

//-- Dependencies --------------------------------
import {
    EDITOR_PANE_INSTRUMENT,
    CONTROL_GROUP_EDITOR_SWAP,
    CONTROL_GROUP_INSTRUMENT_SELECT,
    CONTROL_GROUP_PLAYBACK,
    CONTROL_GROUP_PATTERN,
    EDITOR_PANE_PATTERN,
    CONTROL_GROUP_FILE_MANAGEMENT,
} from '../utilities.js';
import { paneAdd, paneGet } from '../pane/pane_editor.js';
import { groupRegister } from '../pane/pane_control.js';
import { setupControlInstrumentSelect } from './controls.js';
import { setup as setupCanvas, instrumentDraw } from './canvas.js';
import { canvasHeightSet } from '../editor_pattern/canvas.js';
import { setup as setupControlStrip } from './control_strip.js';

//-- Setup ---------------------------------------
export async function setup() {
    // Create Full instrument editor pane (both editor, plus controls)
    const paneInstrument = document.createElement('div');
    paneInstrument.id = 'pane_instrument';
    // Create control strip
    paneInstrument.append(await setupControlStrip());
    // Add instrument editor canvas to full pane
    paneInstrument.append(await setupCanvas());
    // Register pane
    paneAdd(EDITOR_PANE_INSTRUMENT, paneInstrument, [
        CONTROL_GROUP_PLAYBACK,
        CONTROL_GROUP_PATTERN,
        CONTROL_GROUP_EDITOR_SWAP,
        CONTROL_GROUP_INSTRUMENT_SELECT,
        CONTROL_GROUP_FILE_MANAGEMENT,
    ]);
    // Register instrument selector control group
    const groupInstrumentSelect = await setupControlInstrumentSelect();
    groupRegister(CONTROL_GROUP_INSTRUMENT_SELECT, groupInstrumentSelect);
    // Return full editor pane
    return paneInstrument;
}
export function instrumentEditorShown() {
    let paneInstrument = paneGet(EDITOR_PANE_INSTRUMENT);
    let editorCanvas = paneGet(EDITOR_PANE_PATTERN);
    canvasHeightSet(20);
    paneInstrument.prepend(editorCanvas);
}
