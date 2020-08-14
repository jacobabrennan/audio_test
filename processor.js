

//==============================================================================

//-- Main Processor ------------------------------
registerProcessor('processor', class extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
        const output = outputs[0];
        for(let channel of output) {
            let lengthChannel = channel.length;
            for(let indexSample = 0; indexSample < lengthChannel; indexSample++) {
                channel[indexSample] = 1-(Math.random()*2);
            }
        }
        return true;
    }
});
