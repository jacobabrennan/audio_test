

//==============================================================================

//-- Dependencies --------------------------------
import {
    CHANNELS_NUMBER,
} from '../processor.js';
import {
    CELL_WIDTH,
} from './canvas.js'
import {
    lengthGet,
} from './pattern.js';

//-- Module State --------------------------------
let cursorX;
let cursorY;
let selection;

//-- Cursor Querying -----------------------------
export function getCursor() {
    return {
        posX: cursorX,
        posY: cursorY,
    };
}
export function getSelection() {
    return selection;
}

//-- Cursor Movement -----------------------------
export function cursorPosition(posX, posY) {
    selection = undefined;
    cursorX = posX;
    cursorY = posY;
}
export function cursorSelect(posDownX, posDownY, posUpX, posUpY) {
    cursorX = undefined;
    cursorY = undefined;
    selection = {
        posStartX: Math.min(posDownX, posUpX),
        posStartY: Math.min(posDownY, posUpY),
        posEndX: Math.max(posDownX, posUpX),
        posEndY: Math.max(posDownY, posUpY),
    };
}
export function cursorHighlight(indexRow) {
    cursorY = indexRow;
}
export function cursorMove(deltaX, deltaY) {
    if(cursorX === undefined || cursorY === undefined) { return;}
    cursorX += deltaX;
    cursorY += deltaY;
    if(cursorX < 0) {
        cursorX = CHANNELS_NUMBER*CELL_WIDTH -1;
    }
    else if(cursorX >= CHANNELS_NUMBER*CELL_WIDTH) {
        cursorX = 0;
    }
    if(cursorY < 0) {
        cursorY = lengthGet()-1;
    }
    else if(cursorY >= lengthGet()) {
        cursorY = 0;
    }
}
