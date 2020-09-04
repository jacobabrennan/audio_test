

//==============================================================================

//-- Dependencies --------------------------------
import {
    RATE_SAMPLE,
} from './processor.js';

//------------------------------------------------
export default class AudioProcessor {
    constructor(handleMessage) {
        this.handleMessage = handleMessage;
    }
    async setup() { // Cannot be a constructor. Must be initiated by user action.
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
        this.processor = new AudioWorkletNode(context, 'processor', optionsProcessor);
        // Connect audio graph
        this.processor.connect(context.destination);
        // Listen for messages
        this.processor.port.onmessage = (eventMessage) => {
            this.handleMessage(eventMessage.data.action, eventMessage.data.data);
        }
    }
    async messageSend(action, data) {
        if(!this.processor) {
            await this.setup();
        }
        this.processor.port.postMessage({
            action: action,
            data: data,
        });
    }
}
