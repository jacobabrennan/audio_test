

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
import { instrumentDraw } from './canvas.js';
import { controlStripUpdate } from './control_strip.js';

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
    instrumentAdd(new Instrument());
    instrumentChange(0);
    return containerGroup;
}

//------------------------------------------------
function instrumentChange(idInstrument) {
    instrumentSelect(idInstrument);
    instrumentListUpdate();
    controlStripUpdate();
    instrumentDraw();
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
    }
    instrumentListUpdate();
    controlStripUpdate();
    instrumentDraw();
    return countCurrent;
}
export function instrumentListUpdate() {
    const listData = instrumentListGet();
    instrumentSelector.optionsUpdate(listData);
    instrumentCountAdjuster.valueSet(listData.length, true);
}
