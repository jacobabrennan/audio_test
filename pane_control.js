

//==============================================================================

//-- Dependencies --------------------------------

//-- Constants -----------------------------------

//-- Module State --------------------------------
let controls;
const groups = {};
const groupsActive = [];

//-- Setup ---------------------------------------
export async function setup() {
    // Create DOM container
    controls = document.createElement('div');
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
    groupsActive.push(groupNew);
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
    for(let idGroup of groupsActive) {
        groupHide(idGroup);
    }
}
