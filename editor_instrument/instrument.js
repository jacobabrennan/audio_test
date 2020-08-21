

//==============================================================================

//-- Dependencies --------------------------------
import { HEX } from '../processor.js';

//-- Module State --------------------------------
const instruments = [];
let instrumentCurrent;

//-- Instrument Class -------------------------------
export class Instrument {
    name = 'Instrument'
    envelopeVolume = []
    envelopeLength = []
    envelopePointGet(indexPoint) {
        return [
            this.envelopeVolume[indexPoint],
            this.envelopeLength[indexPoint],
        ];
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
