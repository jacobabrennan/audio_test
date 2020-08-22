

//==============================================================================

//-- Dependencies --------------------------------
import Radio from '../controls/radio.js';
import Adjuster from '../controls/adjuster.js';
import { instrumentGet } from './instrument.js';
import { instrumentDraw } from './canvas.js';

//-- Constants -----------------------------------
const SUSTAIN_NONE = 'No Sustain';
const SUSTAIN_ON = 'Sustain';
const SUSTAIN_LOOP = 'Loop';

//-- Module State --------------------------------
let nodeGroup;
let radioSustype;
let adjusterSustain;
let adjusterLoopStart;
let adjusterLoopEnd;
let adjusterNodes;

//------------------------------------------------
export async function setup() {
    // Create DOM container
    const instrumentControls = document.createElement('div');
    instrumentControls.id = 'instrument_controls';
    // Add Sustain type selector to control strip
    radioSustype = new Radio(
        instrumentControls, 12,
        [SUSTAIN_NONE, SUSTAIN_LOOP, SUSTAIN_ON],
        selectSustype,
    );
    radioSustype.draw();
    radioSustype.element.style.alignSelf = 'flex-end'
    // Add node group container
    nodeGroup = document.createElement('div');
    nodeGroup.style.display = 'flex';
    nodeGroup.style.border = '2px solid black';
    nodeGroup.style.background = 'black';
    nodeGroup.style.flexDirection = 'column';
    // Create node group contents
    adjusterNodes = new Adjuster(nodeGroup, 'Nodes', 11, instrumentNodeCountSet);
    adjusterSustain = new Adjuster(null, 'Sustain', 11, instrumentSustainSet);
    adjusterLoopStart = new Adjuster(null, 'L.Start', 11, instrumentLoopStartSet);
    adjusterLoopEnd = new Adjuster(null, 'L.End', 11, instrumentLoopEndSet);
    // Insert into DOM
    instrumentControls.append(nodeGroup);
    return instrumentControls;
}

//------------------------------------------------
export function controlStripUpdate() {
    const instrument = instrumentGet();
    adjusterNodes.valueSet(instrument.envelopeLengthGet(), true);
    if(instrument.sustainGet() !== undefined) {
        selectSustype(SUSTAIN_ON);
        radioSustype.valueSet(SUSTAIN_ON, true);
    }
    else if(instrument.loopGet()) {
        selectSustype(SUSTAIN_LOOP);
        radioSustype.valueSet(SUSTAIN_LOOP, true);
    }
    else {
        selectSustype(SUSTAIN_NONE);
        radioSustype.valueSet(SUSTAIN_NONE, true);
    }
}

//------------------------------------------------
function selectSustype(groupName) {
    adjusterSustain.element.remove();
    adjusterLoopStart.element.remove();
    adjusterLoopEnd.element.remove();
    const instrument = instrumentGet();
    switch(groupName) {
        case SUSTAIN_NONE: {
            instrument.sustainSet(null);
            instrument.loopSet(null);
            break;
        }
        case SUSTAIN_LOOP: {
            let loopData = instrument.loopGet();
            if(!loopData) {
                instrument.loopSet(0, 0);
                loopData = instrument.loopGet();
            }
            adjusterLoopStart.valueSet(loopData[0], true);
            adjusterLoopEnd.valueSet(loopData[1], true);
            nodeGroup.append(
                adjusterLoopStart.element,
                adjusterLoopEnd.element,
            );
            break;
        }
        case SUSTAIN_ON: {
            let sustain = instrument.sustainGet();
            if(sustain === undefined) {
                instrument.sustainSet(0);
                sustain = instrument.sustainGet();
            }
            adjusterSustain.valueSet(sustain, true);
            nodeGroup.append(adjusterSustain.element);
        }
    }
    instrumentDraw();
    return groupName;
}
function instrumentNodeCountSet(countNew) {
    const instrument = instrumentGet();
    instrument.envelopeLengthSet(countNew);
    instrumentDraw();
    return instrument.envelopeLengthGet();
}
function instrumentSustainSet(susNew) {
    const instrument = instrumentGet();
    susNew = instrument.sustainSet(susNew);
    instrumentDraw();
    return susNew;
}
function instrumentLoopStartSet(loopNew) {
    const instrument = instrumentGet();
    let dataLoop = instrument.loopGet();
    dataLoop = instrument.loopSet(loopNew, dataLoop[1]);
    adjusterLoopEnd.valueSet(dataLoop[1], true);
    instrumentDraw();
    return dataLoop[0];
}
function instrumentLoopEndSet(loopNew) {
    const instrument = instrumentGet();
    let dataLoop = instrument.loopGet();
    dataLoop = instrument.loopSet(dataLoop[0], loopNew);
    adjusterLoopStart.valueSet(dataLoop[0], true);
    instrumentDraw();
    return dataLoop[1];
}
