
//-- Temporary -----------------------------------
window.test = setupAudioContext;


//==============================================================================

//-- Dependencies --------------------------------
import {
    RATE_SAMPLE,
} from './constants.js';

//------------------------------------------------
const buttonStart = document.getElementById('startTest');
buttonStart.addEventListener('click', setupAudioContext);

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
    const processor = new AudioWorkletNode(context, 'processor', optionsProcessor);
    // Connect audio graph
    processor.connect(context.destination);
}
