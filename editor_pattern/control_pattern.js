

//==============================================================================

//-- Dependencies --------------------------------
import {
    patternListGet,
    patternNew,
    patternDelete,
    patternSelect,
    lengthSet,
    patternCount,
    lengthGet,
} from './pattern.js';
import Adjuster from '../controls/adjuster.js';
import Selector from '../controls/selector.js';

//-- Module State --------------------------------
let patternSelector;
let lengthAdjuster;
let patternCountAdjuster;

//-- Setup ---------------------------------------
export async function setup() {
    const containerGroup = document.createElement('div');
    containerGroup.className = 'control_group';
    // Add pattern addition / removal control
    patternCountAdjuster = new Adjuster(
        containerGroup, 'Patterns', 15, patternCountSet,
    );
    // Add pattern selection control
    patternSelector = new Selector(
        containerGroup, 15, 8, patternChange,
    )
    // Add pattern length adjustment controls
    lengthAdjuster = new Adjuster(
        containerGroup, 'Length', 15, lengthSet,
    );
    //
    let patternNewId = patternNew();
    patternSelect(patternNewId);
    patternListUpdate();
    //
    return containerGroup;
}

//-- Saving / Loading ----------------------------
export function loadFromData(length) {
    lengthAdjuster.valueSet(length);
}

//------------------------------------------------
export function patternCountSet(countNew) {
    let idPatternNewest;
    let countCurrent = patternCount();
    while(countCurrent !== countNew) {
        if(countNew > countCurrent) {
            idPatternNewest = patternNew();
        } else {
            patternDelete();
        }
        const countAfter = patternCount();
        if(countAfter === countCurrent) { break;}
        countCurrent = countAfter;
    }
    if(idPatternNewest !== undefined) {
        patternSelect(idPatternNewest);
    } else {
        patternListUpdate();
    }
    patternListUpdate();
    return countCurrent;
}
export function patternChange(idPattern) {
    patternSelect(idPattern);
    patternListUpdate();
}

//------------------------------------------------
export function patternListUpdate() {
    const listData = patternListGet();
    patternSelector.optionsUpdate(listData);
    patternCountAdjuster.valueSet(listData.length, true);
    lengthAdjuster.valueSet(lengthGet(), true);
}
