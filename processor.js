

//==============================================================================

//-- Constants -----------------------------------
// Generic geometric and physical constants
export const TAU = Math.PI*2;
export const HEX = 16;
// Audio parameters
export const RATE_SAMPLE = 16000;
export const BPS_DEFAULT = 8;
export const TPB_DEFAULT = 4;
export const CHANNELS_NUMBER = 5;
export const CHANNEL_NOISE = 4;
export const PATTERNS_MAX = 16;
// Pattern cell data masking
// 0b NIVE NNNNNN IIII VVVVVV EEEEEEEEEEEE 
export const MASK_CELL_FLAG_NOTE       = 0b10000000000000000000000000000000;
export const MASK_CELL_FLAG_INSTRUMENT = 0b01000000000000000000000000000000;
export const MASK_CELL_FLAG_VOLUME     = 0b00100000000000000000000000000000;
export const MASK_CELL_FLAG_EFFECT     = 0b00010000000000000000000000000000;
export const MASK_CELL_NOTE_WIDTH = 6;
export const MASK_CELL_NOTE_OFFSET = 22;
export const MASK_CELL_NOTE_STOP = Math.pow(2, MASK_CELL_NOTE_WIDTH)-1;
export const MASK_CELL_INSTRUMENT_WIDTH = 4;
export const MASK_CELL_INSTRUMENT_OFFSET = 18;
export const MASK_CELL_VOLUME_WIDTH = 6;
export const MASK_CELL_VOLUME_OFFSET = 12;
export const MASK_CELL_EFFECT_WIDTH = 12;
export const MASK_CELL_EFFECT_OFFSET = 0;
export const NOTE_NOISE_MAX = 0b1111;
// Client Actions
let INDEX = 1;
export const ACTION_SONG = INDEX++;
export const ACTION_PLAYBACK_PLAY = INDEX++;
export const ACTION_PLAYBACK_STOP = INDEX++;
// Processor Feedback
export const RESPONSE_READY = INDEX++;
export const RESPONSE_PATTERN_ROW = INDEX++;
export const RESPONSE_SONG_END = INDEX++;

//-- Module State --------------------------------
let worklet;
const channels = [];
let songCurrent;

//-- Setup ---------------------------------------
function setup() {
    channels[0] = new Channel(waveSquare);
    channels[1] = new Channel(waveSquare);
    channels[2] = new Channel(waveSaw);
    channels[3] = new Channel(waveTriangle);
    channels[CHANNEL_NOISE] = new Channel(waveNoise);
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
            messageSend(RESPONSE_READY, {});
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
        case ACTION_SONG:
            songCurrent = new Song(data);
            for(let aChannel of channels) {
                aChannel.reset();
            }
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
    playing = false
    indexPattern = 0
    indexRow = 0
    indexSample = 0
    volume = 1
    constructor(dataSong) {
        // Ensure parent behavior
        super();
        // Configure basic settings
        if(dataSong.volume !== undefined) {
            this.volumeSet(dataSong.volume);
        }
        // Populate instruments and patterns
        this.pattern = dataSong.patterns;
        this.instrument = dataSong.instruments.map(function (data) {
            return new Instrument(data);
        });
        // Calculate metrics
        this.samplesPerRow = Math.ceil(RATE_SAMPLE/dataSong.bps);
        this.ticksPerRow = dataSong.tpb;
        this.samplesPerTick = Math.ceil(this.samplesPerRow/this.ticksPerRow);
    }
    sample() {
        if(!this.playing) { return 0;}
        let jump = false;
        if(!(this.indexSample%this.samplesPerRow)) {
            this.indexSample = 0;
            jump = this.playRow();
            if(jump) {
                songCurrent.indexSample = 0;
                songCurrent.playRow();
                songCurrent.tickAdvance(0);
            }
        }
        if(!jump && !(this.indexSample%this.samplesPerTick)) {
            const indexTick = this.indexSample/this.samplesPerTick;
            this.tickAdvance(indexTick);
        }
        this.indexSample++;
        return this.volume * (
            channels[0].sample() +
            channels[1].sample() +
            channels[2].sample() +
            channels[3].sample() +
            channels[4].sample()
        );
    }
    tickAdvance(indexTick) {
        channels[0].tickAdvance(indexTick);
        channels[1].tickAdvance(indexTick);
        channels[2].tickAdvance(indexTick);
        channels[3].tickAdvance(indexTick);
        channels[4].tickAdvance(indexTick);
    }
    playRow() {
        let jump = false;
        let patternCurrent = this.pattern[this.indexPattern];
        if(this.indexRow >= patternCurrent.length / CHANNELS_NUMBER) {
            this.indexPattern++;
            patternCurrent = this.pattern[this.indexPattern];
            this.indexRow = 0;
        }
        if(!patternCurrent) {
            this.end();
            return;
        }
        messageSend(RESPONSE_PATTERN_ROW, {
            patternId: this.indexPattern,
            row: this.indexRow,
        });
        const dataPattern = this.pattern[this.indexPattern]
        const offsetCell = this.indexRow*CHANNELS_NUMBER;
        for(let indexChannel = 0; indexChannel < CHANNELS_NUMBER; indexChannel++) {
            const cell = dataPattern[offsetCell+indexChannel];
            if(!cell) { continue;}
            const [note, indexInstrument, volume, effect] = cellParse(cell);
            let instrument = null;
            if(indexInstrument !== undefined) {
                instrument = this.instrument[indexInstrument];
            }
            if(volume !== undefined) {
                channels[indexChannel].volumeSet(
                    volume / (Math.pow(2, MASK_CELL_VOLUME_WIDTH)-1)
                );
            }
            if(note === MASK_CELL_NOTE_STOP) {
                channels[indexChannel].noteEnd();
            } else if(note !== undefined && instrument) {
                channels[indexChannel].notePlay(note, instrument);
            }
            if(effect !== undefined) {
                const channelJump = handleEffect(effect, indexChannel);
                jump = channelJump || jump;
            }
        }
        if(!jump) {
            this.indexRow++;
        }
        return jump;
    }
    play() {
        this.playing = true;
    }
    pause() {
        this.playing = false;
        for(let indexChannel = 0; indexChannel < CHANNELS_NUMBER; indexChannel++) {
            channels[indexChannel].noteEnd();
        }
    }
    end() {
        this.playing = false;
        this.indexPattern = 0;
        this.indexRow = 0;
        messageSend(RESPONSE_SONG_END, {});
        for(let aChannel of channels) {
            aChannel.reset();
        }
    }
    volumeSet(volumeNew) {
        this.volume = volumeNew / ((1 << MASK_CELL_VOLUME_WIDTH)-1);
    }
}

//-- Channel -------------------------------------
class Channel extends AudioProcessor {
    constructor(waveForm) {
        super();
        this.wave = new waveForm();
        this.volume = 1;
    }
    reset() {
        this.volume = 1;
        delete this.note;
        delete this.repeat;
    }
    tickAdvance(tick) {
        if(this.effect) {
            this.effect(this, tick);
        }
    }
    sample() {
        if(!this.note) { return 0;}
        const noteSample = this.note.sample();
        if(noteSample === null) {
            this.reset();
            return 0;
        }
        return this.wave.sample() * this.volume * noteSample;
    }
    notePlay(note, instrument) {
        if(this.effect) {
            delete this.effect;
        }
        this.wave.noteSet(note);
        this.note = new Note(instrument, note);
    }
    noteEnd() {
        if(!this.note) { return;}
        this.note.cut();
    }
    volumeSet(volumeNew) {
        this.volume = volumeNew;
    }
    effectAdd(effect, arg1, arg2) {
        this.effectParameter1 = arg1;
        this.effectParameter2 = arg2;
        this.effect = effect; 
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
    lastValue = 0
    lastCount = 0
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
class waveNoise extends wavePhase { // 16 "frequencies" available, 0=high, 15=low
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
        this.frequency = note+1; // Zero doesn't work with modulo
    }
    sample() {
        this.phase = (this.phase+1)%this.frequency; // see note above
        if(!this.phase) {
            this.sr = (((this.sr ^ (this.sr >>> 1)) & 0b1) << 14) | (this.sr >>> 1);
        }
        return ((this.sr&1)*2)-1;
    }
}

//-- Instrument ----------------------------------
class Instrument extends AudioProcessor {
    constructor(data) {
        super();
        this.sustain = data.sustain;
        this.loopEnd = data.loopEnd;
        this.loopStart = data.loopStart;
        this.envelopeVolume = data.envelopeVolume;
        this.envelopeDuration = data.envelopeDuration;
    }
}

//-- Note ----------------------------------------
class Note extends AudioProcessor {
    constructor(instrument, value) {
        super();
        this.value = value;
        this.instrument = instrument;
        this.nodeIndexCurrent = 0;
        this.duration = 0;
        this.volumeGoal = instrument.envelopeVolume[0];
        this.volume = this.volumeGoal;
    }
    sample() {
        if(this.nodeIndexCurrent >= this.instrument.envelopeVolume.length) {
            return 0;
            // return null;
        }
        //
        if(!this.live && this.nodeIndexCurrent === this.instrument.sustain) {
            return this.instrument.envelopeVolume[this.nodeIndexCurrent];
        }
        if(this.duration-- <= 0) {
            this.nodeIndexCurrent++;
            if(this.nodeIndexCurrent >= this.instrument.envelopeVolume.length) {
                this.duration = Infinity;
                return 0;
                // return null;
            }
            if(!this.live && this.nodeIndexCurrent === this.instrument.loopEnd) {
                this.nodeIndexCurrent = this.instrument.loopStart;
            }
            this.volume = this.volumeGoal;
            this.volumeGoal = this.instrument.envelopeVolume[this.nodeIndexCurrent];
            this.duration = this.instrument.envelopeDuration[this.nodeIndexCurrent];
        }
        //
        this.volume += (this.volumeGoal - this.volume) / this.duration;
        return this.volume;
    }
    cut() {
        this.live = true;
    }
    retrigger() {
        this.nodeIndexCurrent = 0;
        this.duration = 0;
        this.volumeGoal = this.instrument.envelopeVolume[0];
        this.volume = this.volumeGoal;
    }
}


//== Pattern Building ==========================================================

//------------------------------------------------
export function cell(note, instrument, volume, effect) {
    let R = 0;
    if(Number.isFinite(note)) {
        R |= MASK_CELL_FLAG_NOTE | note << MASK_CELL_NOTE_OFFSET;
    }
    if(Number.isFinite(instrument)) {
        R |= MASK_CELL_FLAG_INSTRUMENT | instrument << MASK_CELL_INSTRUMENT_OFFSET;
    }
    if(Number.isFinite(volume)) {
        R |= MASK_CELL_FLAG_VOLUME | volume << MASK_CELL_VOLUME_OFFSET;
    }
    if(Number.isFinite(effect)) {
        R |= MASK_CELL_FLAG_EFFECT | effect << MASK_CELL_EFFECT_OFFSET;
    }
    return R;
}
export function cellParse(cellData32Bit) {
    let note = (cellData32Bit >> MASK_CELL_NOTE_OFFSET) & (Math.pow(2,MASK_CELL_NOTE_WIDTH)-1);
    let instrument = (cellData32Bit >> MASK_CELL_INSTRUMENT_OFFSET) & (Math.pow(2,MASK_CELL_INSTRUMENT_WIDTH)-1);
    let volume = (cellData32Bit >> MASK_CELL_VOLUME_OFFSET) & (Math.pow(2,MASK_CELL_VOLUME_WIDTH)-1);
    let effect = (cellData32Bit >> MASK_CELL_EFFECT_OFFSET) & (Math.pow(2,MASK_CELL_EFFECT_WIDTH)-1);
    return [
        (cellData32Bit&MASK_CELL_FLAG_NOTE)? note : undefined,
        (cellData32Bit&MASK_CELL_FLAG_INSTRUMENT)? instrument : undefined,
        (cellData32Bit&MASK_CELL_FLAG_VOLUME)? volume : undefined,
        (cellData32Bit&MASK_CELL_FLAG_EFFECT)? effect : undefined,
    ];
}
export function empty() {
    return 0;
}
export function pattern(rows, channelNumber) {
    return new Uint32Array(rows*channelNumber);
}


//== Effects ===================================================================

//-- Effect Handler ------------------------------
function handleEffect(effect, indexChannel) {
    // Cleanup previous effect
    const theChannel = channels[indexChannel];
    if(theChannel.effect) {
        theChannel.effect(theChannel, null);
    }
    // Parse input
    const effectIndex = (effect >>> 8)&(0b1111);
    const arg1 = (effect >>> 4)&(0b1111);
    const arg2 = (effect >>> 0)&(0b1111);
    // Handle individual effects; indicate jumps where necessary
    switch(effectIndex) {
        case 0b0000:
            channels[indexChannel].effectAdd(effectArpeggio, arg1, arg2);
            break;
        case 0b0001:
            return effectLoop(indexChannel, arg1, arg2);
        case 0b0010:
            return effectPatternJump(indexChannel, arg1, arg2);
        case 0b0011:
            return effectRowJump(indexChannel, arg1, arg2);
        case 0b0100:
            channels[indexChannel].effectAdd(effectRetrigger, arg1, arg2);
            break;
        case 0b0101: 
            channels[indexChannel].effectAdd(effectDelay, arg1, arg2);
            break;
        case 0b0110: break;
        case 0b0111: break;
        case 0b1000: break;
        case 0b1001: break;
        case 0b1010: break;
        case 0b1011: break;
        case 0b1100: break;
        case 0b1101: break;
        case 0b1110: break;
        case 0b1111: break;
    }
    // Indicate no jump
    return false;
}

//------------------------------------------------
function effectArpeggio(theChannel, tick) {
    if(!theChannel.note) { return;}
    let noteValue = theChannel.note.value;
    if(tick === null) {
        theChannel.wave.noteSet(noteValue);
        return;
    }
    switch(tick % 3) {
        case 0:
            theChannel.wave.noteSet(noteValue);
            break;
        case 1:
            theChannel.wave.noteSet(noteValue+theChannel.effectParameter1);
            break;
        case 2:
            theChannel.wave.noteSet(noteValue+theChannel.effectParameter2);
            break;
    }
}
function effectLoop(indexChannel, arg1, repeatTimes) {
    // Handle Loop point set command
    const theChannel = channels[indexChannel];
    if(!repeatTimes) {
        // don't retrigger on every loop iteration
        if(!theChannel.repeat) {
            theChannel.repeat = {
                // row: songCurrent.indexRow,
                count: 0,
            };
        }
        // Set repeat point to this row
        theChannel.repeat.row = songCurrent.indexRow;
        return false;
    }
    // Loop from start if no loop start specified
    if(!theChannel.repeat) {
        theChannel.repeat = {
            row: 0,
            count: 0,
        };
    }
    // Do the actual repeating
    if(theChannel.repeat.count < repeatTimes) {
        theChannel.repeat.count++;
        songCurrent.indexRow = theChannel.repeat.row;
    }
    // Cleanup for next loop
    else {
        delete theChannel.repeat;
    }
    // Indicate a jump
    return true;
}
function effectPatternJump(indexChannel, arg1, indexPattern) {
    songCurrent.indexPattern = indexPattern;
    songCurrent.indexRow = 0;
    return true;
}
function effectRowJump(indexChannel, nibble1, nibble2) {
    const indexRow = (nibble1 << 4)|nibble2;
    songCurrent.indexRow = indexRow;
    return true;
}
function effectRetrigger(theChannel, tick) {
    if(tick === null) { return;}
    if(!theChannel.note) { return;}
    if(tick%theChannel.effectParameter2) { return;}
    theChannel.note.retrigger();
}
function effectDelay(theChannel, tick) {
    if(!theChannel.note) { return;}
    const note = theChannel.note;
    const instrument = theChannel.note.instrument;
    if(tick === 0) {
        note.nodeIndexCurrent = instrument.envelopeDuration.length-1;
        note.duration = Infinity;
        note.volumeGoal = 0;
        note.volume = 0;
    }
    else if(tick === theChannel.effectParameter2) {
        note.nodeIndexCurrent = 0;
        note.duration = 0;
        note.volumeGoal = instrument.envelopeVolume[0];
        note.volume = note.volumeGoal;
    }
}
