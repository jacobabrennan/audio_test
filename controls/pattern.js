

//==============================================================================

//-- Dependencies --------------------------------
import {
    patternNew,
    patternDelete,
    patternListGet,
    patternDisplay,
} from '../pattern_editor/index.js';

//-- Module State --------------------------------
let patternSelector;

//------------------------------------------------
export async function setup() {
    const containerGroup = document.createElement('div');
    containerGroup.className = 'control_group';
    //
    const title = document.createElement('h2');
    title.innerText = 'Pattern';
    containerGroup.append(title);
    //
    patternSelector = document.createElement('select');
    patternSelector.id = 'pattern_selector';
    patternSelector.setAttribute('size', 8);
    patternSelector.addEventListener('change', () => patternSelect());
    containerGroup.append(patternSelector);
    //
    const buttonGroup = document.createElement('div');
    const buttonPatternAdd = document.createElement('button');
    const buttonPatternRemove = document.createElement('button');
    buttonPatternAdd.addEventListener('click', () => patternAdd());
    buttonPatternRemove.addEventListener('click', () => patternRemove());
    buttonPatternAdd.innerText = 'Add';
    buttonPatternRemove.innerText = 'Remove';
    buttonGroup.append(buttonPatternAdd, buttonPatternRemove);
    containerGroup.append(buttonGroup);
    //
    return containerGroup;
}

//------------------------------------------------
export function patternAdd() {
    let idPattern = patternNew();
    patternDisplay(idPattern);
    patternListUpdate();
    return idPattern;
}
export function patternRemove(idPattern) {
    const success = patternDelete(idPattern);
    patternListUpdate();
    return success;
}
export function patternSelect(idPattern) {
    if(idPattern === undefined) {
        idPattern = patternSelector.value;
        console.log(idPattern);
    }
    patternDisplay(idPattern);
}

//------------------------------------------------
function patternListUpdate() {
    // Clear old values
    while (patternSelector.firstChild) {
        patternSelector.removeChild(patternSelector.lastChild);
    }
    // Populate with new data
    const listData = patternListGet();
    const listElements = [];
    for(let indexPattern = 0; indexPattern < listData.length; indexPattern++) {
        const option = document.createElement('option');
        option.setAttribute('value', indexPattern);
        option.innerText = listData.names[indexPattern];
        option.value = indexPattern;
        if(indexPattern === listData.indexCurrent) {
            option.selected = true;
        }
        listElements.push(option);
    }
    patternSelector.value = listData.indexCurrent;
    patternSelector.append(...listElements);
}
