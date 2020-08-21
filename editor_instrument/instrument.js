

//==============================================================================

//-- Dependencies --------------------------------
import { HEX } from '../processor.js';

//-- Module State --------------------------------
const instruments = [];
let instrumentCurrent;

//-- Instrument Class -------------------------------
export class Instrument {
    name = 'Instrument'
    envelopeLength = []
    envelopeVolume = []
    envelopePointGet(indexPoint) {
        return [
            this.envelopeLength[indexPoint],
            this.envelopeVolume[indexPoint],
        ];
    }
    envelopePointSet(indexPoint, duration, volume) {
        this.envelopeLength[indexPoint] = duration;
        this.envelopeVolume[indexPoint] = volume;
    }
    envelopeLengthSet(lengthNew) {
        lengthNew = Math.max(0, Math.min(9, lengthNew));
        if(lengthNew <= this.envelopeLengthGet()) {
            this.envelopeLength.length = lengthNew;
            this.envelopeVolume.length = lengthNew;
            return;
        }
        while(this.envelopeLengthGet() < lengthNew) {
            this.envelopeLength.push(this.envelopeLength.length? 25 : 0);
            this.envelopeVolume.push(0.5);
        }
    }
    envelopeLengthGet() {
        return this.envelopeVolume.length;
    }
    toData() {
        return this.envelope;
    }
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
    let indexInstrument = instruments.indexOf(instrumentNew);
    if(indexInstrument === -1) { return;}
    instruments.splice(indexInstrument, 1);
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
    return instruments.map(instrument => instrument.toData())
}
