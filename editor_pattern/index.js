

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
} from './canvas.js';
import {
    patternSelect
} from './pattern.js';

//-- Setup ---------------------------------------
export async function setup() {
    const panePattern = await setupCanvas();
    await setupInput(panePattern);
    return panePattern;
}

//-- Pattern Display -----------------------------
export function highlightRow(indexRow, indexPattern, scroll) {
    if(indexPattern !== undefined) {
        patternSelect(indexPattern);
    }
    cursorHighlight(indexRow);
    patternDisplay();
    return true;
}
