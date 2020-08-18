

//==============================================================================

//-- Dependencies --------------------------------
import {
    setup as setupCursor,
    cursorHighlight,
} from './cursor.js';
import {
    setup as setupCanvas,
    patternDisplay,
} from './canvas.js';
import {
    patternSelect
} from './pattern.js';

//-- Setup ---------------------------------------
export async function setup() {
    // Construct editor DOM
    const editor = document.createElement('div');
    editor.id = 'editor';
    //
    editor.append(await setupCanvas());
    await setupCursor(editor);
    //
    return editor;
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
