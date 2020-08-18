

//==============================================================================

//-- Dependencies --------------------------------
import {
    patternNew,
    patternDelete,
    patternListGet,
    patternDisplay,
    patternLengthAdjust,
    patternLengthGet,
    patternSelect,
} from '../pattern_editor/index.js';

//-- Module State --------------------------------
let patternSelector;
let lengthLabel;

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
    patternSelector.addEventListener('change', () => patternChange());
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
    lengthLabel = document.createElement('span');
    lengthLabel.innerText = 'Length:';
    const lengthAdd = document.createElement('button');
    const lengthSubtract = document.createElement('button');
    lengthAdd.addEventListener('click', () => patternAugment(1));
    lengthSubtract.addEventListener('click', () => patternAugment(-1));
    lengthAdd.innerText = '+';
    lengthSubtract.innerText = '-';
    const groupLength = document.createElement('div');
    groupLength.append(lengthLabel, lengthAdd, lengthSubtract);
    containerGroup.append(groupLength);
    //
    return containerGroup;
}

//------------------------------------------------
export function patternAdd() {
    let idPattern = patternNew();
    patternSelect(idPattern);
    return idPattern;
}
export function patternRemove() {
    const success = patternDelete();
    patternListUpdate();
    return success;
}
export function patternChange() {
    const idPattern = Number(patternSelector.value);
    patternSelect(idPattern);
}
export function patternAugment(amount) {
    patternLengthAdjust(amount);
    patternListUpdate();
}

//------------------------------------------------

//------------------------------------------------
export function patternListUpdate() {
    // Clear old values
    while (patternSelector.firstChild) {
        patternSelector.removeChild(patternSelector.lastChild);
    }
    // Populate with new data
    const listData = patternListGet();
    const options = [];
    for(let indexPattern = 0; indexPattern < listData.length; indexPattern++) {
        const option = document.createElement('option');
        option.setAttribute('value', indexPattern);
        option.innerText = listData.names[indexPattern];
        option.value = indexPattern;
        if(indexPattern == listData.indexCurrent) {
            option.selected = true;
        }
        options.push(option);
    }
    // patternSelector.value = listData.indexCurrent;
    patternSelector.append(...options);
    const patternLength = patternLengthGet();
    lengthLabel.innerText = `Length: ${patternLength}`;
}
