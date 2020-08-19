

//==============================================================================

//-- Dependencies --------------------------------
import {
    patternDisplay,
    FONT_SIZE,
    CELL_WIDTH,
    DISPLAY_HEIGHT,
    WIDTH_LINE_NUMBER,
} from './canvas.js'
import {
    getCursor,
    cursorMove,
    cursorSelect,
    cursorPosition,
    getScroll,
    scrollBy,
} from './cursor.js';
import {
    cellGet,
    editCell,
    editCellNote,
    editCellInstrument,
    editCellVolume,
    editCellEffects,
    lengthGet,
} from './pattern.js';
import {
    cell,
    cellParse,
    MASK_CELL_NOTE_STOP,
} from '../processor.js';
import { noteNameToNumber, noteNumberToName } from '../utilities.js';
//-- Module State --------------------------------
let posDownX;
let posDownY;

//-- Setup ---------------------------------------
export async function setup(editor) {
    editor.tabIndex = 1;
    setTimeout(() => {
        editor.focus();
    }, 1);
    editor.addEventListener('mousedown', (eventMouse) => {
        handleMouseDown(eventMouse);
    });
    editor.addEventListener('mouseup', (eventMouse) => {
        handleMouseUp(eventMouse);
        patternDisplay();
    });
    editor.addEventListener('keydown', (eventKeyboard) => {
        handleKeyDown(eventKeyboard);
        patternDisplay();
    });
    editor.addEventListener('wheel', (eventWheel) => {
        handleWheel(eventWheel);
        patternDisplay();
    });
}

//-- Event Handlers ------------------------------
function handleMouseDown(eventMouse) {
    const coordsMouse = getEventCoords(eventMouse);
    posDownX = coordsMouse.x;
    posDownY = coordsMouse.y;
}
function handleMouseUp(eventMouse) {
    const coordsMouse = getEventCoords(eventMouse);
    const posUpX = coordsMouse.x;
    const posUpY = coordsMouse.y;
    if(posUpX === posDownX && posUpY === posDownY) {
        cursorPosition(posDownX, posDownY);
    } else {
        cursorSelect(posDownX, posDownY, posUpX, posUpY)
    }
    posDownX = undefined;
    posDownY = undefined;
}
function handleKeyDown(eventKeyboard) {
    const key = eventKeyboard.key.toLowerCase();
    const cursor = getCursor();
    if(!cursor) { return;}
    // Handle Movement, and special values
    switch(key) {
        case 'delete':
        case 'backspace':
            parseDeleteInput();
            return;
        case 'enter':
            editCellNote(
                cursor.posY,
                Math.floor(cursor.posX/CELL_WIDTH),
                MASK_CELL_NOTE_STOP,
            );
            return;
        case 'arrowup':
            cursorMove(0, -1);
            return;
        case 'arrowdown':
            cursorMove(0, 1);
            return;
        case 'arrowleft':
            cursorMove(-1, 0);
            return;
        case 'arrowright':
            cursorMove(1, 0);
            return;
        case 'pageup':
            cursorMove(0, Math.floor(-DISPLAY_HEIGHT/2), cursor.posY == 0);
            return;
        case 'pagedown':
            cursorMove(0, Math.floor(DISPLAY_HEIGHT/2), cursor.posY == lengthGet()-1);
            return;
    }
    //
    if(key.length !== 1) { return;}
    // Handle Note Entry
    let indexDigit = cursor.posX%CELL_WIDTH;
    if(indexDigit < 3) {
        parseNoteInput(key);
        return;
    }
    // Handle entry of digits
    let digit = (key.length === 1)? key.match(/[0-9a-f]/i) : null;
    digit = digit? digit[0] : null;
    if(digit) {
        parseCellInput(digit, cursor.posX, cursor.posY);
        return;
    }
    //
}
function handleWheel(eventWheel) {
    let scrollLines;
    switch(eventWheel.deltaMode) {
        case 0:
            scrollLines = eventWheel.deltaY / FONT_SIZE;
            break;
        case 1:
            scrollLines = eventWheel.deltaY;
            break;
        case 0:
        default:
            scrollLines = eventWheel.deltaY * DISPLAY_HEIGHT;
            break;
    }
    scrollBy(scrollLines);
}

//-- Mouse Utilities -----------------------------
function getEventCoords(event) {
    const scrollY = getScroll();
    const clientRect = event.target.getClientRects()[0];
    let posX = event.clientX - clientRect.left;
    let posY = event.clientY - clientRect.top;
    posX = Math.floor(posX/FONT_SIZE);
    posY = Math.floor(posY/FONT_SIZE);
    posY += scrollY;
    posX -= WIDTH_LINE_NUMBER;
    return {
        x: posX,
        y: posY,
    };
}

//-- Input Interpretors --------------------------
function parseNoteInput(key) {
    key = key.toUpperCase();
    const cursor = getCursor();
    if(!cursor) { return;}
    const indexRow = cursor.posY;
    const indexChannel = Math.floor(cursor.posX/CELL_WIDTH);
    const dataCell = cellGet(indexRow, indexChannel);
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
function parseDeleteInput() {
    const cursor = getCursor();
    if(!cursor) { return;}
    const indexRow = cursor.posY;
    const indexChannel = Math.floor(cursor.posX/CELL_WIDTH);
    const indexDigit = cursor.posX%CELL_WIDTH;
    const dataCellOld = cellGet(indexRow, indexChannel);
    let [note, instrument, volume, effect] = cellParse(dataCellOld);
    switch(indexDigit) {
        case 0: case 1: case 2:
            note = undefined;
            break;
        case 3:
            instrument = undefined;
            break;
        case 4: case 5:
            volume = undefined;
            break;
        case 6: case 7: case 8:
            effect = undefined;
            break;
    }
    const dataCellNew = cell(note, instrument, volume, effect);
    editCell(indexRow, indexChannel, dataCellNew);
}
function parseCellInput(digit, posX, posY) {
    const value = parseInt(digit, 16);
    const indexRow = posY;
    const indexChannel = Math.floor(posX/CELL_WIDTH);
    const indexDigit = posX%CELL_WIDTH;
    //
    const dataCell = cellGet(indexRow, indexChannel);
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
