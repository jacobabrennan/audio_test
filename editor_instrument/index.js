

//==============================================================================

//-- Dependencies --------------------------------
import {
    EDITOR_PANE_INSTRUMENT,
    CONTROL_GROUP_EDITOR_SWAP,
    CONTROL_GROUP_INSTRUMENT_SELECT,
} from '../utilities.js';
import { paneAdd } from '../pane/pane_editor.js';
import { groupRegister } from '../pane/pane_control.js';
import { setupControlInstrumentSelect } from './controls.js';

//-- Setup ---------------------------------------
export async function setup() {
    const paneInstrument = document.createElement('div');
    paneAdd(EDITOR_PANE_INSTRUMENT, paneInstrument, [
        CONTROL_GROUP_EDITOR_SWAP,
        CONTROL_GROUP_INSTRUMENT_SELECT,
    ]);
    const groupInstrumentSelect = await setupControlInstrumentSelect();
    // const groupPattern = await setupControlPattern();
    groupRegister(CONTROL_GROUP_INSTRUMENT_SELECT, groupInstrumentSelect);
    // groupRegister(CONTROL_GROUP_PLAYBACK, groupPlayback);
    return paneInstrument;
}
