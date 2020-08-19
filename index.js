

//==============================================================================

//-- Dependencies --------------------------------
import {
    setup as setupPatternEditor,
} from './pattern_editor/index.js';
import { setup as setupControls } from './controls/index.js';
import { patternAdd } from './controls/pattern.js';
import {
    cell,
    pattern,
    CHANNELS_NUMBER,
} from './processor.js';

//-- Constants -----------------------------------
const DOM_ID_CLIENT = 'client';
// const DOM_ID_PATTERN_EDITOR = 'pattern_editor';

//------------------------------------------------
(async function () {
    const container = document.getElementById(DOM_ID_CLIENT);
    const patternEditor = await setupPatternEditor();
    const controls = await setupControls();
    container.append(patternEditor, controls);
})();
// Set up buttons

//------------------------------------------------
export function randomPattern(rows) {
    const patternRandom = pattern(rows, CHANNELS_NUMBER);
    for(let I = 0; I < rows; I++) {
        const note = Math.floor(Math.random()*24)+24;
        patternRandom[I*CHANNELS_NUMBER] = cell(note,0,32,0);
        if(!(I%2)) {
            patternRandom[I*CHANNELS_NUMBER+1] = cell(note-7,0,32,0);
            patternRandom[I*CHANNELS_NUMBER+4] = cell(1,1,63,0);
        } else {
            // patternRandom[I*CHANNELS_NUMBER] = cell(MASK_CELL_NOTE_STOP,0,null,0);
        }
        if(!(I%4)) {
            patternRandom[(I*CHANNELS_NUMBER)+4] = cell(5,2,63,0);
            patternRandom[(I*CHANNELS_NUMBER)+3] = cell(28,2,63,0);
        }
    }
    return patternRandom;
}
