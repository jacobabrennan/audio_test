

//==============================================================================

//-- Dependencies --------------------------------
import { HEX } from '../processor.js';

//-- Module State --------------------------------
const instruments = [];
let instrumentCurrent;

//-- Instrument Class -------------------------------
export class Instrument {
    name = 'Instrument'
    envelopeDuration = [0]
    envelopeVolume = [0.5]
    sustain = 0
    constructor(data) {
        if(!data) { return;}
        this.sustain = data.sustain;
        this.loopStart = data.loopStart;
        this.loopEnd = data.loopEnd;
        this.envelopeDuration = data.envelopeDuration.slice();
        this.envelopeVolume = data.envelopeDuration.slice();
    }
    envelopePointGet(indexPoint) {
        return [
            this.envelopeDuration[indexPoint],
            this.envelopeVolume[indexPoint],
        ];
    }
    envelopePointSet(indexPoint, duration, volume) {
        this.envelopeDuration[indexPoint] = duration;
        this.envelopeVolume[indexPoint] = volume;
    }
    envelopeLengthSet(lengthNew) {
        lengthNew = Math.max(1, Math.min(9, lengthNew));
        if(lengthNew <= this.envelopeLengthGet()) {
            this.envelopeDuration.length = lengthNew;
            this.envelopeVolume.length = lengthNew;
            return;
        }
        while(this.envelopeLengthGet() < lengthNew) {
            this.envelopeDuration.push(this.envelopeDuration.length? 25 : 0);
            this.envelopeVolume.push(0.5);
        }
    }
    envelopeLengthGet() {
        return this.envelopeVolume.length;
    }
    sustainGet() {
        return this.sustain;
    }
    sustainSet(susNew) {
        this.loopStart = undefined;
        this.loopend = undefined;
        if(susNew === null) {
            this.sustain = undefined;
            return undefined;
        }
        const susMax = this.envelopeLengthGet()-1;
        this.sustain = Math.max(0, Math.min(susMax, susNew));
        return this.sustain;
    }
    loopGet() {
        if(this.loopStart === undefined) { return undefined;}
        return [
            this.loopStart,
            this.loopEnd,
        ];
    }
    loopSet(start, end) {
        if(start === null || end === null) {
            this.loopStart = undefined;
            this.loopEnd = undefined;
            return undefined;
        }
        const nodeMax = this.envelopeLengthGet()-1;
        start = Math.max(0, Math.min(nodeMax, start));
        end = Math.max(0, Math.min(nodeMax, end));
        if(start > end && end === this.loopEnd) {
            end = start;
        }
        else if(end < start && start === this.loopStart) {
            start = end;
        }
        this.sustain = undefined;
        this.loopStart = start;
        this.loopEnd = end;
        return [start, end];
    }
    toData() {
        return {
            sustain: this.sustain,
            loopStart: this.loopStart,
            loopEnd: this.loopEnd,
            envelopeDuration: this.envelopeDuration.slice(),
            envelopeVolume: this.envelopeVolume.slice(),
        };
    }
}

//-- Saving / Loading ----------------------------
export function populateFromData(data) {
    instruments.splice(0);
    for(let instrumentData of data) {
        instrumentAdd(
            new Instrument(instrumentData)
        );
    }
    instrumentCurrent = instruments[0];
}

//-- Instrument Management -----------------------
export function instrumentSelect(indexInstrument) {
    const instrumentNew = instruments[indexInstrument];
    if(!instrumentNew) { return;}
    instrumentCurrent = instrumentNew;
}
export function instrumentAdd(instrumentNew) {
    if(instruments.indexOf(instrumentNew) !== -1) { return;}
    instruments.push(instrumentNew);
    return instruments.length-1;
}
export function instrumentRemove() {
    let indexInstrument = instruments.indexOf(instrumentCurrent);
    if(indexInstrument === -1) { return;}
    instruments.splice(indexInstrument, 1);
    if(instruments.length) {
        indexInstrument = Math.max(0, Math.min(instruments.length-1, indexInstrument));
    } else {
        indexInstrument = instrumentAdd(new Instrument());
    }
    instrumentSelect(indexInstrument);
    return instruments.length;
}

//-- Instrument Querying -------------------------
export function instrumentGet() {
    return instrumentCurrent;
}
export function instrumentIndexGet() {
    return instruments.indexOf(instrumentCurrent);
}
export function instrumentCount() {
    return instruments.length;
}
export function instrumentListGet() {
    return {
        length: instruments.length,
        indexCurrent: instruments.indexOf(instrumentCurrent),
        names: instruments.map(
            (instrument, index) => `${index.toString(HEX)} ${instrument.name}`
        ),
    };
}
export function instrumentDataCompile() {
    return instruments.map(instrument => instrument.toData());
}
