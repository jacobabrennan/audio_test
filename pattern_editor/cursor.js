

//==============================================================================

//-- Dependencies --------------------------------
import {
    CHANNELS_NUMBER,
} from '../processor.js';
import {
    patternDisplay,
    CELL_WIDTH,
    DISPLAY_HEIGHT,
} from './canvas.js'
import {
    lengthGet,
} from './pattern.js';

//-- Module State --------------------------------
let scrollY = 0;
let cursorX;
let cursorY;
let selection;

//-- Cursor Querying -----------------------------
export function getScroll() {
    return scrollY;
}
export function getCursor() {
    if(cursorX === undefined || cursorY === undefined) { return undefined;}
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
    scrollCheck();
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
    scrollCheck();
}
export function cursorMove(deltaX, deltaY, wrap=true) {
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
        if(wrap) {
            cursorY = lengthGet()-1;
        } else {
            cursorY = 0;
        }
    }
    else if(cursorY >= lengthGet()) {
        if(wrap) {
            cursorY = 0;
        } else {
            cursorY = lengthGet()-1;
        }
    }
    scrollCheck();
}

//-- Scrolling -----------------------------------
export function scrollTo(posY) {
    scrollY = posY;
    patternDisplay();
}
export function scrollBy(deltaY) {
    scrollY += deltaY;
    scrollY = Math.max(0, Math.min(lengthGet()-DISPLAY_HEIGHT, scrollY));
    patternDisplay();
}
export function scrollCheck() {
    if(cursorY < scrollY) {
        scrollTo(cursorY);
    }
    else if(cursorY >= DISPLAY_HEIGHT+scrollY) {
        scrollTo(cursorY - (DISPLAY_HEIGHT-1));
    }
}
