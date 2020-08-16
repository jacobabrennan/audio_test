
//-- Temporary -----------------------------------
const buttonStart = document.getElementById('startTest');
buttonStart.addEventListener('click', setupAudioContext);
const buttonPlay = document.getElementById('playTest');
buttonPlay.addEventListener('click', function () {
    messageSend(ACTION_PLAYBACK_PLAY, {derp: 'herp'});
});
const buttonStop = document.getElementById('stopTest');
buttonStop.addEventListener('click', function () {
    messageSend(ACTION_PLAYBACK_STOP, {derp: 'herp'});
});


//==============================================================================

//-- Dependencies --------------------------------
import {
    pattern,
    cell,
    RATE_SAMPLE,
    ACTION_PATTERN,
    ACTION_PLAYBACK_PLAY,
    ACTION_PLAYBACK_STOP,
    CHANNELS_NUMBER,
} from './processor.js';

//-- Module State --------------------------------
let processor;

//-- Setup Audio Context -------------------------
export async function setupAudioContext() {
    // Create audio context
    const optionsAudio = {
        sampleRate: RATE_SAMPLE,
    };
    const context = new AudioContext(optionsAudio);
    // Create audio processing worklet
    await context.audioWorklet.addModule('./processor.js');
    const optionsProcessor = {
        outputChannelCount: [1], // mono sound
        // outputChannelCount: [2], // Stereo sound
    };
    processor = new AudioWorkletNode(context, 'processor', optionsProcessor);
    // Connect audio graph
    processor.connect(context.destination);
    // Listen for messages
    processor.port.onmessage = function (message) {
        messageReceive(message.action, message.data);
    }
    // Derp
    {
        buttonStart.disabled = true;
        const testPattern = pattern(256, CHANNELS_NUMBER);
        for(let I = 0; I < 256; I++) {
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
        messageSend(ACTION_PATTERN, testPattern);
    }
}

//------------------------------------------------
export function messageSend(action, data) {
    processor.port.postMessage({
        action: action,
        data: data,
    });
}
export function messageReceive(action, data) {}
