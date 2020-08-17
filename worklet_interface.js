

//==============================================================================

//-- Dependencies --------------------------------
import {
    RATE_SAMPLE,
    RESPONSE_PATTERN_ROW,
} from './processor.js';
import { highlightRow } from './pattern_editor/index.js';

//-- Module State --------------------------------
let processor;

//-- Setup Audio Context -------------------------
async function setup() {
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
    processor.port.onmessage = function (eventMessage) {
        messageReceive(eventMessage.data.action, eventMessage.data.data);
    }
}

//------------------------------------------------
export async function messageSend(action, data) {
    if(!processor) {
        console.log('loading')
        await setup();
    }
    processor.port.postMessage({
        action: action,
        data: data,
    });
}
export async function messageReceive(action, data) {
    switch(action) {
        case RESPONSE_PATTERN_ROW: {
            highlightRow(data, true);
            break;
        }
    }
}
