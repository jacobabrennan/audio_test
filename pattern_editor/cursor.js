

//==============================================================================

//-- Dependencies --------------------------------
import {
    FONT_SIZE,
    CELL_WIDTH,
} from './index.js';

//-- Module State --------------------------------
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
    if(posUpX === undefined) {
        posUpX = posDownX;
    }
    if(posUpY === undefined) {
        posUpY = posDownY;
    }
    let posMinX = Math.min(posDownX, posUpX);
    let posMinY = Math.min(posDownY, posUpY);
    let posMaxX = Math.max(posDownX, posUpX);
    let posMaxY = Math.max(posDownY, posUpY);
    if(posMinX !== posMaxX || posMinY !== posMaxY) {
        posMinX = posMinX - posMinX%CELL_WIDTH;
        posMaxX = posMaxX + CELL_WIDTH-(posMaxX%CELL_WIDTH)-1;
    }
    return {
        posMinX,
        posMinY,
        posMaxX,
        posMaxY,
    };
}

//-- Event Handlers ------------------------------
export function handleMouseDown(mouseEvent) {
    const coordsMouse = getEventCoords(mouseEvent);
    posUpX = undefined;
    posUpY = undefined;
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
