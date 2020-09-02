

//==============================================================================

//-- Dependencies --------------------------------
import {
    CELL_WIDTH,
    // DISPLAY_HEIGHT,
    WIDTH_LINE_NUMBER,
} from './canvas.js';
// import {
//     // cellGet,
//     // cellEdit,
//     // cellEditNote,
//     // cellEditInstrument,
//     // cellEditVolume,
//     // cellEditEffects,
//     // lengthGet,
// } from './pattern.js';
import {
    cell,
    cellParse,
    CHANNEL_NOISE,
    CHANNELS_NUMBER,
    HEX,
    MASK_CELL_NOTE_STOP,
} from '../processor.js';
import {
    noteNameToNumber,
    noteNumberToName,
    FONT_SIZE,
} from '../utilities.js';

//-- Mouse Utilities -----------------------------
function getEventCoords(event, scrollY) {
    const clientRect = event.target.getClientRects()[0];
    let posX = event.clientX - clientRect.left;
    let posY = event.clientY - clientRect.top;
    posX = Math.floor(posX/FONT_SIZE);
    posY = Math.floor(posY/FONT_SIZE);
    posY += scrollY;
    posX = Math.max(0, posX - WIDTH_LINE_NUMBER);
    return {
        x: posX,
        y: posY,
    };
}

//-- Event Handlers ------------------------------
export function handleMouseDown(eventMouse) {
    const coordsMouse = getEventCoords(eventMouse, this.scrollY);
    this.mouseStart = coordsMouse;
    this.cursorPosition(coordsMouse.x, coordsMouse.y);
}
export function handleMouseUp(eventMouse) {
    const coordsStart = this.mouseStart;
    delete this.mouseStart;
    if(!this.cursor) { return;}
    const coordsMouse = getEventCoords(eventMouse, this.scrollY);
    const posUpX = coordsMouse.x;
    const posUpY = coordsMouse.y;
    if(posUpX === coordsStart.x && posUpY === coordsStart.y) {
        return;
    }
    this.cursorSelect(coordsStart.x, coordsStart.y, posUpX, posUpY);
}
export function handleMouseMove(eventMouse) {
    if(!this.mouseStart) { return;}
    if(!this.cursor && !this.selection) { return;}
    const coordsMouse = getEventCoords(eventMouse, this.scrollY);
    if(!coordsMouse) { return;}
    const posUpX = coordsMouse.x;
    const posUpY = coordsMouse.y;
    const posDownX = this.mouseStart.x;
    const posDownY = this.mouseStart.y;
    if(this.cursor && posUpX === posDownX && posUpY === posDownY) {
        return;
    }
    this.cursorSelect(posDownX, posDownY, posUpX, posUpY);
}
export function handleMouseLeave() {
    delete this.mouseStart;
}
export function handleWheel(eventWheel) {
    const DOM_DELTA_PIXEL = 0;
    const DOM_DELTA_LINE = 1;
    const DOM_DELTA_PAGE = 2;
    let scrollLines;
    switch(eventWheel.deltaMode) {
        case DOM_DELTA_PIXEL:
            scrollLines = eventWheel.deltaY / FONT_SIZE;
            break;
        case DOM_DELTA_LINE:
            scrollLines = eventWheel.deltaY;
            break;
        case DOM_DELTA_PAGE:
        default:
            scrollLines = eventWheel.deltaY * this.height;
            break;
    }
    this.scrollBy(scrollLines);
}
export function handleKeyDown(eventKeyboard) {
    const key = eventKeyboard.key.toLowerCase();
    // Handle Copy / Paste
    // if(eventKeyboard.ctrlKey) {
    //     switch(key) {
    //         case 'c':
    //             commandCopy();
    //             break;
    //         case 'v':
    //             commandPaste();
    //             break;
    //         case 'x':
    //             commandCopy(true);
    //             break;
    //     }
    //     return;
    // }
    // Handle Movement, and special values
    switch(key) {
        case 'delete':
        case 'backspace':
            this.parseInputDelete();
            return;
        case 'enter':
            if(!this.cursor) { break;}
            this.cellEditNote(
                this.cursor.posY,
                Math.floor(this.cursor.posX/CELL_WIDTH),
                MASK_CELL_NOTE_STOP,
            );
            return;
        case 'arrowup':
            this.cursorMove(0, -1);
            return;
        case 'arrowdown':
            this.cursorMove(0, 1);
            return;
        case 'arrowleft':
            this.cursorMove(-1, 0);
            return;
        case 'arrowright':
            this.cursorMove(1, 0);
            return;
        case 'pageup':
            if(!this.cursor) { break;}
            this.cursorMove(0, Math.floor(-this.height/2), this.cursor.posY == 0);
            return;
        case 'pagedown': {
            if(!this.cursor) { break;}
            const length = this.pattern.length / CHANNELS_NUMBER;
            this.cursorMove(0, Math.floor(this.height/2), this.cursor.posY == length-1);
            return;
        }
    }
    //
    if(!this.cursor) { return;}
    //
    if(key.length !== 1) { return;}
    // Handle Note Entry
    let indexDigit = this.cursor.posX%CELL_WIDTH;
    if(indexDigit < 3) {
        this.parseNoteInput(key);
        return;
    }
    // Handle entry of digits
    let digit = (key.length === 1)? key.match(/[0-9a-f]/i) : null;
    digit = digit? digit[0] : null;
    if(digit) {
        this.parseCellInput(digit, this.cursor.posX, this.cursor.posY);
        return;
    }
}



//-- Input Interpretors --------------------------
export function parseNoteInput(key) {
    key = key.toUpperCase();
    if(!this.cursor) { return;}
    const indexRow = this.cursor.posY;
    const indexChannel = Math.floor(this.cursor.posX/CELL_WIDTH);
    if(indexChannel === CHANNEL_NOISE) {
        return this.parseNoiseInput(key);
    }
    const dataCell = this.cellGet(indexRow, indexChannel);
    let note = cellParse(dataCell)[0];
    if(note === undefined) {
        note = noteNameToNumber('C 2');
    }
    if(key === ']') {
        this.cellEditNote(indexRow, indexChannel, note+1);
        return;
    }
    if(key === '[') {
        this.cellEditNote(indexRow, indexChannel, note-1);
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
        this.cellEditNote(indexRow, indexChannel, value);
    }
}
export function parseNoiseInput(key) {
    key = key.toUpperCase();
    if(!this.cursor) { return;}
    const indexRow = this.cursor.posY;
    const indexChannel = Math.floor(this.cursor.posX/CELL_WIDTH);
    const dataCell = this.cellGet(indexRow, indexChannel);
    let note = cellParse(dataCell)[0];
    if(note === undefined) { note = 0;}
    if(key === ']') {
        note++;
        if(note > NOTE_NOISE_MAX) { note = 0;}
        this.cellEditNote(indexRow, indexChannel, note);
        return;
    }
    if(key === '[') {
        note--;
        if(note < 0) { note = NOTE_NOISE_MAX;}
        this.cellEditNote(indexRow, indexChannel, note);
        return;
    }
    note = parseInt(key, HEX);
    if(!Number.isFinite(note)) { return;}
    this.cellEditNote(indexRow, indexChannel, note);
}
export function parseInputDelete() {
    if(this.cursor) {
        const indexRow = this.cursor.posY;
        const indexChannel = Math.floor(this.cursor.posX/CELL_WIDTH);
        const indexDigit = this.cursor.posX%CELL_WIDTH;
        const dataCellOld = this.cellGet(indexRow, indexChannel);
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
        this.cellEdit(indexRow, indexChannel, dataCellNew);
    }
    if(this.selection) {
        const posXStart = Math.floor(this.selection.posStartX / CELL_WIDTH);
        const posYStart = this.selection.posStartY;
        const posXEnd = Math.floor(this.selection.posEndX / CELL_WIDTH);
        const posYEnd = this.selection.posEndY;
        for(let posY = posYStart; posY <= posYEnd; posY++) {
            for(let posX = posXStart; posX <= posXEnd; posX++) {
                this.cellEdit(posY, posX, 0);
            }
        }
    }
}
export function parseCellInput(digit, posX, posY) {
    const value = parseInt(digit, HEX);
    const indexRow = posY;
    const indexChannel = Math.floor(posX/CELL_WIDTH);
    const indexDigit = posX%CELL_WIDTH;
    //
    const dataCell = this.cellGet(indexRow, indexChannel);
    let [note, instrument, volume, effect] = cellParse(dataCell);
    note = note || 0;
    instrument = instrument || 0;
    volume = volume || 0;
    effect = effect || 0;
    //
    switch(indexDigit) {
        case 3:
            this.cellEditInstrument(indexRow, indexChannel, value);
            break;
        case 4: {
            let sV = volume.toString(HEX).padStart(2,'0');
            sV = `${digit}${sV[1]}`;
            this.cellEditVolume(indexRow, indexChannel, parseInt(sV, HEX));
            break;
        }
        case 5: {
            let sV = volume.toString(HEX).padStart(2,'0');
            sV = `${sV[0]}${digit}`;
            this.cellEditVolume(indexRow, indexChannel, parseInt(sV, HEX));
            break;
        }
        case 6: {
            let sE = effect.toString(HEX).padStart(3,'0');
            sE = `${digit}${sE[1]}${sE[2]}`;
            this.cellEditEffects(indexRow, indexChannel, parseInt(sE, HEX));
            break;
        }
        case 7: {
            let sE = effect.toString(HEX).padStart(3,'0');
            sE = `${sE[0]}${digit}${sE[2]}`;
            this.cellEditEffects(indexRow, indexChannel, parseInt(sE, HEX));
            break;
        }
        case 8: {
            let sE = effect.toString(HEX).padStart(3,'0');
            sE = `${sE[0]}${sE[1]}${digit}`;
            this.cellEditEffects(indexRow, indexChannel, parseInt(sE, HEX));
            break;
        }
    }
}
// function commandCopy(clear) {
//     //
//     let posXStart;
//     let posXEnd;
//     let posYStart;
//     let posYEnd;
//     const cursor = getCursor();
//     const selection = getSelection();
//     if(selection) {
//         posXStart = selection.posStartX;
//         posXEnd = selection.posEndX;
//         posYStart = selection.posStartY;
//         posYEnd = selection.posEndY;
//     }
//     else if(cursor) {
//         posXStart = cursor.posX;
//         posXEnd = cursor.posX;
//         posYStart = cursor.posY;
//         posYEnd = cursor.posY;
//     }
//     else { return;}
//     posXStart = Math.floor(posXStart / CELL_WIDTH);
//     posXEnd = Math.floor(posXEnd / CELL_WIDTH);
//     //
//     clipBoard = [];
//     for(let posY = posYStart; posY <= posYEnd; posY++) {
//         clipBoard[posY-posYStart] = [];
//         for(let posX = posXStart; posX <= posXEnd; posX++) {
//             clipBoard[posY-posYStart][posX-posXStart] = cellGet(posY, posX);
//             if(clear) {
//                 cellEdit(posY, posX, 0);
//             }
//         }
//     }
// }
// function commandPaste() {
//     //
//     const cursor = getCursor();
//     if(!cursor) { return;}
//     //
//     if(!clipBoard) { return;}
//     //
//     let posXStart = Math.floor(cursor.posX / CELL_WIDTH);
//     let posYStart = cursor.posY;
//     let posYEnd = (posYStart+clipBoard.length)-1;
//     let posXEnd = (posXStart+clipBoard[0].length)-1;
//     posXEnd = Math.min(posXEnd, CHANNELS_NUMBER-1);
//     //
//     for(let posY = posYStart; posY <= posYEnd; posY++) {
//         for(let posX = posXStart; posX <= posXEnd; posX++) {
//             const cellData = clipBoard[posY-posYStart][posX-posXStart];
//             cellEdit(posY, posX, cellData);
//         }
//     }
// }
