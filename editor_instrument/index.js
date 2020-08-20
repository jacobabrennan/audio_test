

//==============================================================================

//-- Dependencies --------------------------------
import {
    EDITOR_PANE_INSTRUMENT,
    CONTROL_GROUP_EDITOR_SWAP,
} from '../utilities.js';
import { paneAdd } from '../pane_editor.js';

//-- Setup ---------------------------------------
export async function setup() {
    const paneInstrument = document.createElement('div');
    paneAdd(EDITOR_PANE_INSTRUMENT, paneInstrument, [
        CONTROL_GROUP_EDITOR_SWAP,
    ]);
    // const groupPlayback = await setupControlPlayback();
    // const groupPattern = await setupControlPattern();
    // groupRegister(CONTROL_GROUP_PATTERN, groupPattern);
    // groupRegister(CONTROL_GROUP_PLAYBACK, groupPlayback);
    return paneInstrument;
}
