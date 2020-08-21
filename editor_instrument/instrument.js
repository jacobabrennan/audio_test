

//==============================================================================

//-- Dependencies --------------------------------
import { HEX } from '../processor.js';

//-- Module State --------------------------------
const instruments = [];
let instrumentCurrent;

//------------------------------------------------
export class Instrument {
    constructor() {
        this.name = "Instrument";
    }
    toData() {
        return this.envelope;
    }
}

//------------------------------------------------
export function instrumentSelect(indexInstrument) {
    const instrumentNew = instruments[indexInstrument];
    if(!instrumentNew) { return;}
    instrumentCurrent = instrumentNew;
}

//------------------------------------------------
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
export function instrumentIndexGet() {
    return instruments.indexOf(instrumentCurrent);
}
