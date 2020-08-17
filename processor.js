

//==============================================================================

//-- Constants -----------------------------------
// Generic geometric and physical constants
export const TAU = Math.PI*2;
// Audio parameters
export const RATE_SAMPLE = 8000;
export const BPM_DEFAULT = 500;
export const CHANNELS_NUMBER = 5;
// Pattern cell data masking
// 0b DVU NNNNNN IIIII VVVVVV EEEEEEEEEEEE 
export const MASK_CELL_FLAG_DATA   = 0b10000000000000000000000000000000;
export const MASK_CELL_FLAG_VOLUME = 0b01000000000000000000000000000000;
export const MASK_CELL_FLAG_UNUSED = 0b00100000000000000000000000000000;
export const MASK_CELL_NOTE_WIDTH = 6;
export const MASK_CELL_NOTE_OFFSET = 23;
export const MASK_CELL_NOTE_STOP = Math.pow(2, MASK_CELL_NOTE_WIDTH)-1
export const MASK_CELL_INSTRUMENT_WIDTH = 5;
export const MASK_CELL_INSTRUMENT_OFFSET = 18;
export const MASK_CELL_VOLUME_WIDTH = 6;
export const MASK_CELL_VOLUME_OFFSET = 12;
export const MASK_CELL_EFFECT_WIDTH = 12;
export const MASK_CELL_EFFECT_OFFSET = 0;
// Client Actions
let INDEX = 1;
export const ACTION_READY = INDEX++;
export const ACTION_PATTERN = INDEX++;
export const ACTION_PLAYBACK_PLAY = INDEX++;
export const ACTION_PLAYBACK_STOP = INDEX++;
// Processor Feedback
export const RESPONSE_PATTERN_ROW = INDEX++;

//-- Module State --------------------------------
let worklet;
const channel = [];
let songCurrent;


//-- Setup ---------------------------------------
function setup() {
    channel[0] = new Channel(waveSquare);
    channel[1] = new Channel(waveSquare);
    channel[2] = new Channel(waveSaw);
    channel[3] = new Channel(waveTriangle);
    channel[4] = new Channel(waveNoise);
}


//== Worklet Interface =========================================================

//-- Connection ----------------------------------
if(typeof registerProcessor !== 'undefined') {
    registerProcessor('processor', class extends AudioWorkletProcessor {
        constructor() {
            super();
            worklet = this;
            this.port.onmessage = function (eventMessage) {
                messageReceive(eventMessage.data.action, eventMessage.data.data);
            }
            setup();
            messageSend(ACTION_READY, {});
        }
        process(inputs, outputs, parameters) {
            if(!songCurrent) { return true;}
            const output = outputs[0][0];
            let bufferLength = output.length;
            for(let index=0; index < bufferLength; index++) {
                output[index] = songCurrent.sample();
            }
            return true;
        }
    });
}

//-- Messaging -----------------------------------
function messageSend(action, data) {
    worklet.port.postMessage({
        action: action,
        data: data,
    });
}
function messageReceive(action, data) {
    switch(action) {
        case ACTION_PLAYBACK_PLAY:
            if(!songCurrent) { break;}
            songCurrent.play();
            break;
        case ACTION_PLAYBACK_STOP:
            if(!songCurrent) { break;}
            songCurrent.pause();
            break;
        case ACTION_PATTERN:
            songCurrent = new Song(
                [
                    [100,200,0.5,8000, true],
                    [25,25,1,500, false],
                    [25,75,1,1000, false],
                ],
                [data],
            );
            break;
    }
}

//== Audio Processors ==========================================================

//-- Abstract Audio Processor --------------------
class AudioProcessor {
    sample() { return 0;}
}

//-- Song Playing --------------------------------
class Song extends AudioProcessor {
    samplesPerRow = (RATE_SAMPLE*60)/BPM_DEFAULT
    playing = false
    constructor(instruments, patterns) {
        super();
        this.instrument = instruments.map(function (envelope) {
            return new Instrument(...envelope);
        });
        this.pattern = patterns;
        this.indexPattern = 0;
        this.indexRow = 0;
        this.indexSample = 0;
    }
    sample() {
        if(!this.playing) { return 0;}
        if(!(this.indexSample%this.samplesPerRow)) {
            this.playRow(this.indexRow);
            this.indexRow++;
        }
        this.indexSample++;
        return (
            channel[0].sample() +
            channel[1].sample() +
            channel[2].sample() +
            channel[3].sample() +
            channel[4].sample()
        );
    }
    playRow(rowIndex) {
        messageSend(RESPONSE_PATTERN_ROW, rowIndex)
        let dataPattern = this.pattern[this.indexPattern]
        let offsetCell = rowIndex*CHANNELS_NUMBER;
        for(let indexChannel = 0; indexChannel < CHANNELS_NUMBER; indexChannel++) {
            let cell = dataPattern[offsetCell+indexChannel];
            if(!cell) { continue;}
            let [note, indexInstrument, volume, effect] = cellParse(cell);
            let instrument = this.instrument[indexInstrument];
            if(cell&MASK_CELL_FLAG_VOLUME) {
                channel[indexChannel].volumeSet(
                    volume / (Math.pow(2, MASK_CELL_VOLUME_WIDTH)-1)
                );
            }
            if(note === MASK_CELL_NOTE_STOP) {
                channel[indexChannel].noteEnd();
                return;
            }
            instrument.notePlay(note, indexChannel);
        }
    }
    play() {
        this.playing = true;
    }
    pause() {
        this.playing = false;
        for(let indexChannel = 0; indexChannel < CHANNELS_NUMBER; indexChannel++) {
            channel[indexChannel].noteEnd();
        }
    }
}

//-- Channel -------------------------------------
class Channel extends AudioProcessor {
    volume = 1
    ADSRTime = 0
    ADSRMode = 4
    // ADSRSustain = false
    constructor(waveForm) {
        super();
        this.wave = new waveForm();
    }
    sample() {
        if(!this.instrument) { return 0;}
        return this.wave.sample() * this.volume * this.instrument.sample(this);
    }
    noteEnd() {
        if(this.instrument) {
            this.ADSRMode = 3;
            this.ADSRTime = this.instrument.envelope[3];
        }
    }
    volumeSet(volumeNew) {
        this.volume = volumeNew;
    }
}

//-- Wave Forms ----------------------------------
class wavePhase extends AudioProcessor{
    phase = 0
    phaseOffset = 0
    phaseLength = undefined
    frequency = undefined
    constructor() {
        super();
        this.setFrequency(1);
    }
    noteSet(note) {
        this.setFrequency(55*Math.pow(2, note/12));
    }
    setFrequency(frequencyNew) {
        //
        this.phaseLength = RATE_SAMPLE / frequencyNew;
        this.frequency = frequencyNew;
        this.phaseOffset = this.phase*this.phaseLength;
    }
    sample() {
        this.phaseOffset = (this.phaseOffset+1) % this.phaseLength;
        this.phase = this.phaseOffset / this.phaseLength;
        return this.phase;
    }
}
class waveSquare extends wavePhase {
    duty = 1/2
    setDuty(dutyNew) { // 16 values possible, only 8 unique
        if(this.phase >= this.duty) {
            if(this.phase < dutyNew) {
                this.phase = dutyNew;
                this.phaseOffset = this.phase*this.phaseLength;
            }
        } else {
            if(this.phase >= dutyNew) {
                this.phase = 0;
                this.phaseOffset = 0;
            }
        }
        this.duty = dutyNew;
    }
    sample() {
        return (super.sample() >= this.duty)? 1 : -1;
    }
}
class waveSaw extends wavePhase {
    sample() {
        return super.sample()*2 - 1;
    }
}
class waveSine extends wavePhase {
    sample() {
        return Math.sin(super.sample() * TAU);
    }
}
class waveTriangle extends wavePhase {
    sample() {
        return Math.abs((super.sample()*4)-2)-1;
    }
}
class waveNoise extends wavePhase { // 16 "frequencies" available, 1=high, 16=low
    // const timerPeriod = [4, 8, 16, 32, 64, 96, 128, 160, 202, 254, 380, 508, 762, 1016, 2034, 4068];
    // const timerPeriod = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    // When the timer clocks the shift register, the following actions occur in order: 
    //     Feedback is calculated as the exclusive-OR of bit 0 and one other bit: bit 6 if Mode flag is set, otherwise bit 1.
    //     The shift register is shifted right by one bit.
    //     Bit 14, the leftmost bit, is set to the feedback calculated earlier.
    // setFrequency(frequencyNew) {
    //     this.frequency = frequencyNew;
    //     this.phaseOffset = Math.floor(RATE_SAMPLE / this.frequency);
    //     // this.phaseOffset = Math.floor(RATE_SAMPLE / timerPeriod[this.frequency]);
    // }
    sr = 1
    noteSet(note) {
        this.frequency = note;
    }
    sample() {
        this.phase = (this.phase+1)%this.frequency;
        if(!this.phase) {
            this.sr = (((this.sr ^ (this.sr >>> 1)) & 0b1) << 14) | (this.sr >>> 1);
        }
        return ((this.sr&1)*2)-1;
    }
}

//-- Instrument ----------------------------------
class Instrument extends AudioProcessor {
    /* envelope:
        A: Time to reach full volume
        D: Time to decay to sustain volume
        S: Sustain volume
        R: Time to "release" to 0 volume
    */
    constructor(timeAttack, timeDecay, volumeSustain, timeRelease, sustain) {
        super();
        this.envelope = [timeAttack, timeDecay, volumeSustain, timeRelease];
        this.sustain = sustain;
    }
    sample(playChannel) {
        switch(playChannel.ADSRMode) {
            case 4:
                return 0;
            case 2:
                if(this.sustain) {
                    return this.envelope[2];
                } else {
                    playChannel.ADSRMode++;
                    playChannel.ADSRTime = this.envelope[3]
                }
                break;
            default:
                if(playChannel.ADSRTime--) { break;}
                playChannel.ADSRMode++;
                playChannel.ADSRTime = this.envelope[playChannel.ADSRMode]
                break;
        }
        const P = playChannel.ADSRTime/this.envelope[playChannel.ADSRMode];
        switch(playChannel.ADSRMode) {
            case 0:
                return 1-P;
            case 1:
                return (P * (1-this.envelope[2])) + this.envelope[2];
            case 3:
                return P*this.envelope[2];
        }
    }
    notePlay(note, indexChannel) {
        let playChannel = channel[indexChannel];
        playChannel.wave.noteSet(note);
        playChannel.instrument = this;
        playChannel.ADSRMode = 0;
        playChannel.ADSRTime = this.envelope[0];
        playChannel.ADSRSustain = true;
    }
}


//== Pattern Building ==========================================================

//------------------------------------------------
export function cell(note, instrument, volume, effect) {
    let R = (
        MASK_CELL_FLAG_DATA |
        (Number.isFinite(volume)? MASK_CELL_FLAG_VOLUME : 0) |
        (note       << MASK_CELL_NOTE_OFFSET      ) |
        (instrument << MASK_CELL_INSTRUMENT_OFFSET) |
        (volume     << MASK_CELL_VOLUME_OFFSET    ) |
        (effect     << MASK_CELL_EFFECT_OFFSET    )
    );
    return R;
}
export function cellParse(cellData32Bit) {
    return [
        (cellData32Bit >> MASK_CELL_NOTE_OFFSET      ) & (Math.pow(2,MASK_CELL_NOTE_WIDTH      )-1),
        (cellData32Bit >> MASK_CELL_INSTRUMENT_OFFSET) & (Math.pow(2,MASK_CELL_INSTRUMENT_WIDTH)-1),
        (cellData32Bit >> MASK_CELL_VOLUME_OFFSET    ) & (Math.pow(2,MASK_CELL_VOLUME_WIDTH    )-1),
        (cellData32Bit >> MASK_CELL_EFFECT_OFFSET    ) & (Math.pow(2,MASK_CELL_EFFECT_WIDTH    )-1),
    ];
}
export function empty() {
    return 0;
}
export function pattern(rows, channels) {
    return new Uint32Array(rows*channels);
}
