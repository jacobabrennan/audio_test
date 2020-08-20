

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

//------------------------------------------------
export async function setup() {
    const containerGroup = document.createElement('div');
    containerGroup.className = 'control_group';
    //
    const title = document.createElement('h2');
    title.innerText = 'Pattern';
    containerGroup.append(title);
    // Add pattern addition / removal control
    patternCountAdjuster = new Adjuster(
        containerGroup, 'Patterns', 16, patternCountSet,
    );
    // Add pattern selection control
    patternSelector = new Selector(
        containerGroup, 16, 8, patternChange,
    )
    // Add pattern length adjustment controls
    lengthAdjuster = new Adjuster(
        containerGroup, 'Length', 16, lengthSet,
    );
    //
    let patternNewId = patternNew();
    patternSelect(patternNewId);
    patternListUpdate();
    //
    return containerGroup;
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
