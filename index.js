

//==============================================================================

//-- Dependencies --------------------------------
import { setup as setupClient } from './client.js';

//------------------------------------------------
(async function () {
    await setupClient();
})();


//== Scaffolding / testing =====================================================

//-- Dependencies --------------------------------
import {
    cell,
    pattern,
    CHANNELS_NUMBER,
    CHANNEL_NOISE,
} from './processor.js';

//------------------------------------------------
export function randomPattern(rows) {
    const patternRandom = pattern(rows, CHANNELS_NUMBER);
    for(let I = 0; I < rows; I++) {
        const note = Math.floor(Math.random()*24)+24;
        patternRandom[I*CHANNELS_NUMBER] = cell(note,0,32,0);
        if(!(I%2)) {
            patternRandom[I*CHANNELS_NUMBER+1] = cell(note-7,0,32,0);
            patternRandom[I*CHANNELS_NUMBER+CHANNEL_NOISE] = cell(1,1,63,0);
        } else {
            // patternRandom[I*CHANNELS_NUMBER] = cell(MASK_CELL_NOTE_STOP,0,null,0);
        }
        if(!(I%4)) {
            patternRandom[(I*CHANNELS_NUMBER)+CHANNEL_NOISE] = cell(5,2,63,0);
            patternRandom[(I*CHANNELS_NUMBER)+3] = cell(28,2,63,0);
        }
    }
    return patternRandom;
}
