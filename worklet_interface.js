

//==============================================================================

//-- Dependencies --------------------------------
import {
    RATE_SAMPLE,
} from './processor.js';

//-- Module State --------------------------------
let processor;

//-- Setup Audio Context -------------------------
export async function setup() {
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
}

//------------------------------------------------
export function messageSend(action, data) {
    processor.port.postMessage({
        action: action,
        data: data,
    });
}
export function messageReceive(action, data) {}
