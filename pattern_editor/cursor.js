

//==============================================================================

//-- Dependencies --------------------------------
import {
    FONT_SIZE,
} from './index.js';

//-- Module State --------------------------------
let row = 0;
let channel = 0;
let char = 0;
let posDownX;
let posDownY;
let posUpX;
let posUpY;

//------------------------------------------------
export function getPosCursor() {
    return {
        posDownX,
        posDownY,
    };
}
export function getSelection() {
    return {
        posDownX,
        posDownY,
        posUpX,
        posUpY
    };
}

//-- Event Handlers ------------------------------
export function handleMouseDown(mouseEvent) {
    const coordsMouse = getEventCoords(mouseEvent);
    posDownX = coordsMouse.x;
    posDownY = coordsMouse.y;
    return {
        x: posDownX,
        y: posDownY,
    };
}
export function handleMouseUp(mouseEvent) {
    const coordsMouse = getEventCoords(mouseEvent);
    posUpX = coordsMouse.x;
    posUpY = coordsMouse.y;
    return {
        x: posUpX,
        y: posUpY,
    };
}

//-- Mouse Utilities -----------------------------
function getEventCoords(event) {
    const clientRect = event.target.getClientRects()[0];
    let posX = event.clientX - clientRect.left;
    let posY = event.clientY - clientRect.top;
    posX = Math.floor(posX/FONT_SIZE);
    posY = Math.floor(posY/FONT_SIZE);
    return {
        x: posX,
        y: posY,
    };
}
