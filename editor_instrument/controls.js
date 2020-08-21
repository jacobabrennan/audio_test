

//==============================================================================

//-- Dependencies --------------------------------
import Selector from '../controls/selector.js';
import Adjuster from '../controls/adjuster.js';
import {
    Instrument,
    instrumentCount,
    instrumentListGet,
    instrumentAdd,
    instrumentRemove,
    instrumentSelect,
} from './instrument.js';

//-- Module State --------------------------------
let instrumentSelector;
let instrumentCountAdjuster;

//-- Setup ---------------------------------------
export async function setupControlInstrumentSelect() {
    const containerGroup = document.createElement('div');
    containerGroup.className = 'control_group';
    // Add instrument addition / removal control
    instrumentCountAdjuster = new Adjuster(
        containerGroup, 'Inst.', 15, instrumentCountSet,
    );
    instrumentCountAdjuster.valueSet(0, true);
    // Add instrument selection control
    instrumentSelector = new Selector(
        containerGroup, 15, 8, instrumentChange,
    );
    //
    let envelopes = [
        [100,200,0.5,2000, true],
        [25,25,1,500, false],
        [25,75,1,1000, false],
    ];
    for(let envelope of envelopes) {
        const instrumentNew = new Instrument();
        instrumentNew.envelope = envelope;
        instrumentNew.envelopeVolume = [0,1,0.5,0.5,0];
        instrumentNew.envelopeLength = [0,100,300,500,900];
        instrumentAdd(instrumentNew);
    }
    instrumentChange(0);
    return containerGroup;
}

//------------------------------------------------
function instrumentChange(idInstrument) {
    instrumentSelect(idInstrument);
    instrumentListUpdate();
}
function instrumentCountSet(countNew) {
    let idInstrumentNewest;
    let countCurrent = instrumentCount();
    while(countCurrent !== countNew) {
        if(countNew > countCurrent) {
            const instrumentNew = new Instrument();
            idInstrumentNewest = instrumentAdd(instrumentNew);
        } else {
            instrumentRemove();
        }
        const countAfter = instrumentCount();
        if(countAfter === countCurrent) { break;}
        countCurrent = countAfter;
    }
    if(idInstrumentNewest !== undefined) {
        instrumentSelect(idInstrumentNewest);
    } else {
        instrumentListUpdate();
    }
    return countCurrent;
}
export function instrumentListUpdate() {
    const listData = instrumentListGet();
    instrumentSelector.optionsUpdate(listData);
    instrumentCountAdjuster.valueSet(listData.length, true);
}
