

//==============================================================================

//-- Dependencies --------------------------------
import {
    cursorHighlight,
} from './cursor.js';
import {
    setup as setupInput,
} from './input.js';
import {
    setup as setupCanvas,
    patternDisplay,
    DISPLAY_HEIGHT,
    canvasHeightSet,
} from './canvas.js';
import {
    patternSelect
} from './pattern.js';
import { setup as setupControlPattern, patternListUpdate } from './control_pattern.js';
import { setup as setupControlPlayback } from './control_playback.js';
import { paneAdd } from '../pane/pane_editor.js';
import {
    EDITOR_PANE_PATTERN,
    CONTROL_GROUP_PATTERN,
    CONTROL_GROUP_PLAYBACK,
    CONTROL_GROUP_EDITOR_SWAP,
    CONTROL_GROUP_INSTRUMENT_SELECT,
} from '../utilities.js';
import { groupRegister } from '../pane/pane_control.js';

//-- Setup ---------------------------------------
export async function setup() {
    const panePattern = await setupCanvas();
    await setupInput(panePattern);
    paneAdd(EDITOR_PANE_PATTERN, panePattern, [
        CONTROL_GROUP_EDITOR_SWAP,
        CONTROL_GROUP_PLAYBACK,
        CONTROL_GROUP_PATTERN,
        CONTROL_GROUP_INSTRUMENT_SELECT,
    ]);
    const groupPlayback = await setupControlPlayback();
    const groupPattern = await setupControlPattern();
    groupRegister(CONTROL_GROUP_PATTERN, groupPattern);
    groupRegister(CONTROL_GROUP_PLAYBACK, groupPlayback);
    return panePattern;
}
export function patternEditorShown() {
    canvasHeightSet(DISPLAY_HEIGHT);
}

//-- Pattern Display -----------------------------
export function highlightRow(indexRow, indexPattern, scroll) {
    if(indexPattern !== undefined) {
        patternSelect(indexPattern);
        patternListUpdate();
    }
    cursorHighlight(indexRow);
    patternDisplay();
    return true;
}
