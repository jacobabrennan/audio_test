

//==============================================================================

//------------------------------------------------
function cell(note, instrument, volume, effect) {
    let R = (
        (1          << 31) |
        (note       << 23) |
        (instrument << 18) |
        (volume     << 12) |
        (effect     <<  0)
    );
    return R;
}
function empty() {
    return 0;
}
function pattern(rows, channels) {
    return new Uint32Array(rows*channels);
}
const testPattern = pattern(256, 5);
for(let I = 0; I < 256; I++) {
    const note = Math.floor(Math.random()*16)+24;
    testPattern[I*5] = cell(note,0,32,0);
    if(!(I%2)) {
        testPattern[I*5+4] = cell(1,3,63,0);
    }
    if(!(I%4)) {
        testPattern[(I*5)+4] = cell(5,4,63,0);
        testPattern[(I*5)+3] = cell(28,4,63,0);
    }
}


//==============================================================================

//-- Notes ---------------------------------------
    // A-O·II·VV·EEE
    // A-O: Note name (A) and octave (O)
        // 2 Nibbles
    // I: Instrument
        // 1 Nibble
    // V: Volume
        // Byte
    // E: Effects
        // Three Nibbles

//-- Constants -----------------------------------
const RATE_SAMPLE = 8000
const TAU = Math.PI*2;
const BPM_DEFAULT = 100;

//-- Main Processor ------------------------------
registerProcessor('processor', class extends AudioWorkletProcessor {
    channel = []
    constructor() {
        super();
        this.channel[0] = new Channel(waveSquare);
        this.channel[1] = new Channel(waveSquare);
        this.channel[2] = new Channel(waveSaw);
        this.channel[3] = new Channel(waveTriangle);
        this.channel[4] = new Channel(waveNoise);
        this.playSong(new Song(
            [
                [100,200,0.5,8000],
                [100,200,0.5,8000],
                [100,200,0.5,8000],
                [25,25,1,500],
                [25,75,1,1000],
            ],
            [testPattern],
        ));
    }
    process(inputs, outputs, parameters) {
        // if(!this.songCurrent) { return true;}
        const output = outputs[0][0];
        let bufferLength = output.length;
        let c0 = this.channel[0];
        let c1 = this.channel[1];
        let c2 = this.channel[2];
        let c3 = this.channel[3];
        let c4 = this.channel[4];
        let sample;
        for(let index=0; index < bufferLength; index++) {
            sample = this.songCurrent.sample(this.channel);
            // sample = c0.sample()+c1.sample()+c2.sample()+c3.sample()+c4.sample();
            output[index] = sample;//Math.max(-1, Math.min(1, sample));
        }
        return true;
    }
    playSong(songNew) {
        this.songCurrent = songNew;
    }
});


//== Audio Processors ==========================================================

//-- Abstract Audio Processor --------------------
class AudioProcessor {
    sample() { return 0;}
}

//-- Song Playing --------------------------------
class Song extends AudioProcessor {
    samplesPerRow = (RATE_SAMPLE*60)/BPM_DEFAULT
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
    sample(channels) {
        if(!(this.indexSample%this.samplesPerRow)) {
            this.playRow(this.indexRow, channels);
            this.indexRow++;
        }
        this.indexSample++;
        return (
            channels[0].sample() +
            channels[1].sample() +
            channels[2].sample() +
            channels[3].sample() +
            channels[4].sample()
        );
    }
    playRow(rowIndex, channels) {
        let dataPattern = this.pattern[this.indexPattern]
        let offsetCell = rowIndex*5;
        channels[0].playCell(dataPattern[  offsetCell], this);
        channels[1].playCell(dataPattern[++offsetCell], this);
        channels[2].playCell(dataPattern[++offsetCell], this);
        channels[3].playCell(dataPattern[++offsetCell], this);
        channels[4].playCell(dataPattern[++offsetCell], this);
    }
}

//-- Channel -------------------------------------
class Channel extends AudioProcessor {
    constructor(waveForm) {
        super();
        this.wave = new waveForm();
    }
    sample() {
        if(!this.instrument) { return 0;}
        return this.wave.sample() * this.instrument.sample() * this.volume;
    }
    playCell(cell, song) {
        if(!cell) { return;}
        const note       = (cell & 0b00011111100000000000000000000000) >> 23;
        const instrument = (cell & 0b00000000011111000000000000000000) >> 18;
        const volume     = (cell & 0b00000000000000111111000000000000) >> 12;
        const effect     = (cell & 0b00000000000000000000111111111111) >>  0;
        this.volume = volume / 63;
        this.note(note, song.instrument[instrument], false);
    }
    note(note, instrument, sustain) {
        this.instrument = instrument;
        this.wave.setNote(note);
        this.instrument.note(note, sustain);
    }
    noteEnd() {
        if(!this.instrument) { return;}
        this.instrument.noteEnd();
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
    setNote(note) {
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
    setNote(note) {
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
    time = 0
    mode = 4
    sustain = false;
    constructor(timeAttack, timeDecay, volumeSustain, timeRelease) {
        super();
        this.envelope = [timeAttack, timeDecay, volumeSustain, timeRelease];
    }
    sample() {
        switch(this.mode) {
            case 4:
                return 0;
            case 2:
                if(this.sustain) {
                    this.envelope[2];
                } else {
                    this.mode++;
                    this.time = this.envelope[3]
                }
                break;
            default:
                if(this.time--) { break;}
                this.mode++;
                this.time = this.envelope[this.mode]
                break;
        }
        const P = this.time/this.envelope[this.mode];
        switch(this.mode) {
            case 0:
                return 1-P;
            case 1:
                return (P * (1-this.envelope[2])) + this.envelope[2];
            case 3:
                return P*this.envelope[2];
        }
    }
    note(frequency, sustain) {
        this.frequency = frequency;
        this.mode = 0;
        this.time = this.envelope[0];
        this.sustain = sustain;
    }
    noteEnd() {
        this.sustain = false;
    }
}
