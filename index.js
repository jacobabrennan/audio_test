

//==============================================================================

//-- Dependencies --------------------------------
import {
    pattern,
    cell,
    ACTION_SONG,
    ACTION_PLAYBACK_PLAY,
    ACTION_PLAYBACK_STOP,
    CHANNELS_NUMBER,
} from './processor.js';
import {
    messageSend,
} from './worklet_interface.js';
import {
    setup as setupClient,
    patternDataGet,
    patternFromData,
    patternDisplay,
} from './pattern_editor/index.js';

//-- Constants -----------------------------------
const DOM_ID_CLIENT = 'client';
// const DOM_ID_PATTERN_EDITOR = 'pattern_editor';

//------------------------------------------------
(async function () {
    await setupClient(DOM_ID_CLIENT);
    test()
    const buttonPlay = document.getElementById('playTest');
    buttonPlay.addEventListener('click', async function () {
        await messageSend(ACTION_SONG, {
            patterns: [patternDataGet(0), patternDataGet(1)],
            instruments: [
                [100,200,0.5,8000, true],
                [25,25,1,500, false],
                [25,75,1,1000, false],
            ],
        });
        await messageSend(ACTION_PLAYBACK_PLAY, {derp: 'herp'});
    });
    const buttonStop = document.getElementById('stopTest');
    buttonStop.addEventListener('click', function () {
        messageSend(ACTION_PLAYBACK_STOP, {derp: 'herp'});
    });
})();
// Set up buttons

//------------------------------------------------
async function test() {
    //
    const rows = 8
    const testPattern = pattern(rows, CHANNELS_NUMBER);
    for(let I = 0; I < rows; I++) {
        const note = Math.floor(Math.random()*24)+24;
        testPattern[I*CHANNELS_NUMBER] = cell(note,0,32,0);
        if(!(I%2)) {
            testPattern[I*CHANNELS_NUMBER+1] = cell(note-7,0,32,0);
            testPattern[I*CHANNELS_NUMBER+4] = cell(1,1,63,0);
        } else {
            // testPattern[I*CHANNELS_NUMBER] = cell(MASK_CELL_NOTE_STOP,0,null,0);
        }
        if(!(I%4)) {
            testPattern[(I*CHANNELS_NUMBER)+4] = cell(5,2,63,0);
            testPattern[(I*CHANNELS_NUMBER)+3] = cell(28,2,63,0);
        }
    }
    let indexPattern = patternFromData(testPattern);
    const tp = pattern(rows, CHANNELS_NUMBER);
    for(let I = 0; I < rows; I++) {
        const note = Math.floor(Math.random()*24)+24;
        tp[I*CHANNELS_NUMBER] = cell(note,0,32,0);
        if(!(I%2)) {
            tp[I*CHANNELS_NUMBER+1] = cell(note-7,0,32,0);
            tp[I*CHANNELS_NUMBER+4] = cell(1,1,63,0);
        } else {
            // tp[I*CHANNELS_NUMBER] = cell(MASK_CELL_NOTE_STOP,0,null,0);
        }
        if(!(I%4)) {
            tp[(I*CHANNELS_NUMBER)+4] = cell(5,2,63,0);
            tp[(I*CHANNELS_NUMBER)+3] = cell(28,2,63,0);
        }
    }
    patternFromData(tp);
    patternDisplay(indexPattern);
}
