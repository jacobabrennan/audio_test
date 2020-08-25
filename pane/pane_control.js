

//==============================================================================

import { ButtonBar } from '../controls/button.js';
import { songSave, songLoad } from '../file_management/controls.js';
import { CONTROL_GROUP_FILE_MANAGEMENT } from '../utilities.js';

//-- Dependencies --------------------------------

//-- Constants -----------------------------------

//-- Module State --------------------------------
let controls;
const groups = {};
const groupsActive = [];

//-- Setup ---------------------------------------
export async function setup() {
    // Create file management group
    const fileManagement = new ButtonBar(undefined, {
        'Save': songSave,
        'Load': songLoad,
    });
    groupRegister(CONTROL_GROUP_FILE_MANAGEMENT, fileManagement.element);
    // Create DOM container
    controls = document.createElement('div');
    controls.id = 'controls';
    // Return DOM container
    return controls;
}

//------------------------------------------------
export function groupRegister(idGroup, elementGroup) {
    groups[idGroup] = elementGroup;
}
export function groupShow(idGroup) {
    const groupNew = groups[idGroup];
    if(!groupNew) { return;}
    groupsActive.push(idGroup);
    controls.append(groupNew);
}
export function groupHide(idGroup) {
    const groupOld = groups[idGroup];
    if(!groupOld) { return;}
    const indexGroup = groupsActive.indexOf(idGroup);
    if(indexGroup === -1) { return;}
    groupOld.remove();
    groupsActive.splice(indexGroup, 1);
}
export function groupHideAll() {
    for(let idGroup of groupsActive.slice()) {
        groupHide(idGroup);
    }
}
