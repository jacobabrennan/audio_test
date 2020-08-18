

//==============================================================================

//-- Dependencies --------------------------------
import {
    FONT_SIZE,
    CELL_WIDTH,
    patternCellGet,
    editCellNote,
    editCellInstrument,
    editCellVolume,
    editCellEffects,
} from './index.js';
import {
    cellParse,
    CHANNELS_NUMBER,
} from '../processor.js';
import {
    noteNumberToName,
    noteNameToNumber,
} from '../utilities.js';

//-- Module State --------------------------------
let cursorX;
let cursorY;
let posUpX;
let posUpY;

//------------------------------------------------
export function cursorHighlight(indexRow) {
    posUpX = undefined;
    posUpY = undefined;
    cursorY = indexRow;
}

//------------------------------------------------
export function getPosCursor() {
    return {
        cursorX,
        cursorY,
    };
}
export function getSelection() {
    if(posUpX === undefined) {
        posUpX = cursorX;
    }
    if(posUpY === undefined) {
        posUpY = cursorY;
    }
    let posMinX = Math.min(cursorX, posUpX);
    let posMinY = Math.min(cursorY, posUpY);
    let posMaxX = Math.max(cursorX, posUpX);
    let posMaxY = Math.max(cursorY, posUpY);
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
export function handleMouseDown(eventMouse) {
    const coordsMouse = getEventCoords(eventMouse);
    posUpX = undefined;
    posUpY = undefined;
    cursorX = coordsMouse.x;
    cursorY = coordsMouse.y;
    return {
        x: cursorX,
        y: cursorY,
    };
}
export function handleMouseUp(eventMouse) {
    const coordsMouse = getEventCoords(eventMouse);
    posUpX = coordsMouse.x;
    posUpY = coordsMouse.y;
    return {
        x: posUpX,
        y: posUpY,
    };
}
export function handleKeyDown(eventKeyboard) {
    const key = eventKeyboard.key.toLowerCase();
    // Handle Movement
    switch(key) {
        case 'arrowup':
            cursorY = Math.max(0, cursorY-1);
            posUpX = undefined;
            posUpY = undefined;
            return;
        case 'arrowdown':
            cursorY++;
            posUpX = undefined;
            posUpY = undefined;
            return;
        case 'arrowleft':
            cursorX = Math.max(0, cursorX-1);
            posUpX = undefined;
            posUpY = undefined;
            return;
        case 'arrowright':
            cursorX = Math.min(CELL_WIDTH*CHANNELS_NUMBER-1, cursorX+1);
            posUpX = undefined;
            posUpY = undefined;
            return;
    }
    //
    if(key.length !== 1) { return;}
    // Handle Note Entry
    let indexDigit = cursorX%CELL_WIDTH;
    if(indexDigit < 3) {
        parseNoteInput(key);
        return;
    }
    // Handle entry of digits
    let digit = (key.length === 1)? key.match(/[0-9a-f]/i) : null;
    digit = digit? digit[0] : null;
    if(digit) {
        parseCellInput(digit, cursorX, cursorY);
        return;
    }
    //
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

//------------------------------------------------
function parseNoteInput(key) {
    key = key.toUpperCase();
    const indexRow = cursorY;
    const indexChannel = Math.floor(cursorX/CELL_WIDTH);
    const dataCell = patternCellGet(indexRow, indexChannel);
    let note = cellParse(dataCell)[0];
    if(note === undefined) {
        note = noteNameToNumber('C 2');
    }
    if(key === ']') {
        editCellNote(indexRow, indexChannel, note+1);
        return;
    }
    if(key === '[') {
        editCellNote(indexRow, indexChannel, note-1);
        return;
    }
    note = noteNumberToName(note);
    let octave = note[2];
    let letter = note[0];
    let keyNumber = parseInt(key);
    let value;
    if(Number.isFinite(keyNumber)) {
        value = noteNameToNumber(`${letter} ${keyNumber}`);
    } else {
        value = noteNameToNumber(`${key} ${octave}`);
    }
    if(Number.isFinite(value)) {
        editCellNote(indexRow, indexChannel, value);
    }
}
function parseCellInput(digit, posX, posY) {
    const value = parseInt(digit, 16);
    const indexRow = posY;
    const indexChannel = Math.floor(posX/CELL_WIDTH);
    const indexDigit = posX%CELL_WIDTH;
    //
    const dataCell = patternCellGet(indexRow, indexChannel);
    let [note, instrument, volume, effect] = cellParse(dataCell);
    note = note || 0;
    instrument = instrument || 0;
    volume = volume || 0;
    effect = effect || 0;
    //
    switch(indexDigit) {
        case 3:
            editCellInstrument(indexRow, indexChannel, value);
            break;
        case 4: {
            let sV = volume.toString(16).padStart(2,'0');
            sV = `${digit}${sV[1]}`;
            editCellVolume(indexRow, indexChannel, parseInt(sV, 16));
            break;
        }
        case 5: {
            let sV = volume.toString(16).padStart(2,'0');
            sV = `${sV[0]}${digit}`;
            editCellVolume(indexRow, indexChannel, parseInt(sV, 16));
            break;
        }
        case 6: {
            let sE = effect.toString(16).padStart(3,'0');
            sE = `${digit}${sE[1]}${sE[2]}`;
            editCellEffects(indexRow, indexChannel, parseInt(sE, 16));
            break;
        }
        case 7: {
            let sE = effect.toString(16).padStart(3,'0');
            sE = `${sE[0]}${digit}${sE[2]}`;
            editCellEffects(indexRow, indexChannel, parseInt(sE, 16));
            break;
        }
        case 8: {
            let sE = effect.toString(16).padStart(3,'0');
            sE = `${sE[0]}${sE[1]}${digit}`;
            editCellEffects(indexRow, indexChannel, parseInt(sE, 16));
            break;
        }
    }

}
