

//==============================================================================

//-- Dependencies --------------------------------
import {
    // cellParse,
    CHANNELS_NUMBER,
    // HEX,
    // CHANNEL_NOISE,
    // MASK_CELL_NOTE_STOP,
    // PATTERNS_MAX,
} from '../processor.js';
import {
    // noteNumberToName,
    contextConfigure,
    FONT_SIZE,
    // COLOR_FG_HIGHLIGHT,
    // COLOR_BG_HIGHLIGHT,
    // COLOR_FG,
    // COLOR_BG,
} from '../utilities.js';
// import {
//     getSelection,
//     getCursor,
//     getScroll,
//     scrollCheck
// } from './cursor.js';
// import {
//     dataGet,
//     lengthGet,
// } from './pattern.js';
import Vue from '../libraries/vue.esm.browser.js';

//-- Constants -----------------------------------
export const CELL_WIDTH = 9;
export const DISPLAY_HEIGHT = 40;
export const WIDTH_LINE_NUMBER = 3;
const DISPLAY_CHAR_WIDTH = CELL_WIDTH*CHANNELS_NUMBER;
export const DISPLAY_PIXEL_WIDTH = (DISPLAY_CHAR_WIDTH+WIDTH_LINE_NUMBER)*FONT_SIZE;

//-- Setup ---------------------------------------
function setup(instance) {
    const canvas = instance.$el;
    canvas.imTheDrawCanvas = true;
    //
    canvas.width  = DISPLAY_PIXEL_WIDTH;
    canvas.height = DISPLAY_HEIGHT*FONT_SIZE;
    //
    instance.context = canvas.getContext('2d');
    contextConfigure(instance.context);
    //
    canvas.tabIndex = 1;
    setTimeout(() => {
        canvas.focus();
    }, 1);
}

//------------------------------------------------

//-- Event Handlers ------------------------------
function handleMouseDown(eventMouse) {
    // const coordsMouse = getEventCoords(eventMouse);
    // this.posDownX = coordsMouse.x;
    // this.posDownY = coordsMouse.y;
}
function handleMouseUp(eventMouse) {
    // const coordsMouse = getEventCoords(eventMouse);
    // const posUpX = coordsMouse.x;
    // const posUpY = coordsMouse.y;
    // if(posUpX === this.posDownX && posUpY === this.posDownY) {
    //     cursorPosition(this.posDownX, this.posDownY);
    // } else {
    //     cursorSelect(this.posDownX, this.posDownY, posUpX, posUpY);
    // }
    // this.posDownX = undefined;
    // this.posDownY = undefined;
}
function handleMouseMove(eventMouse) {
    // if(this.posDownX === undefined || this.posDownY === undefined) { return;}
    // const coordsMouse = getEventCoords(eventMouse);
    // if(!coordsMouse) { return;}
    // const posUpX = coordsMouse.x;
    // const posUpY = coordsMouse.y;
    // if(posUpX === this.posDownX && posUpY === this.posDownY) { return;}
    // cursorSelect(this.posDownX, this.posDownY, posUpX, posUpY);
}
// function handleKeyDown(eventKeyboard) {
//     const key = eventKeyboard.key.toLowerCase();
//     const cursor = getCursor();
//     // Handle Copy / Paste
//     if(eventKeyboard.ctrlKey) {
//         switch(key) {
//             case 'c':
//                 commandCopy();
//                 break;
//             case 'v':
//                 commandPaste();
//                 break;
//             case 'x':
//                 commandCopy(true);
//                 break;
//         }
//         return;
//     }
//     // Handle Movement, and special values
//     switch(key) {
//         case 'delete':
//         case 'backspace':
//             parseDeleteInput();
//             return;
//         case 'enter':
//             if(!cursor) { break;}
//             editCellNote(
//                 cursor.posY,
//                 Math.floor(cursor.posX/CELL_WIDTH),
//                 MASK_CELL_NOTE_STOP,
//             );
//             return;
//         case 'arrowup':
//             cursorMove(0, -1);
//             return;
//         case 'arrowdown':
//             cursorMove(0, 1);
//             return;
//         case 'arrowleft':
//             cursorMove(-1, 0);
//             return;
//         case 'arrowright':
//             cursorMove(1, 0);
//             return;
//         case 'pageup':
//             if(!cursor) { break;}
//             cursorMove(0, Math.floor(-DISPLAY_HEIGHT/2), cursor.posY == 0);
//             return;
//         case 'pagedown':
//             if(!cursor) { break;}
//             cursorMove(0, Math.floor(DISPLAY_HEIGHT/2), cursor.posY == lengthGet()-1);
//             return;
//     }
//     //
//     if(!cursor) { return;}
//     //
//     if(key.length !== 1) { return;}
//     // Handle Note Entry
//     let indexDigit = cursor.posX%CELL_WIDTH;
//     if(indexDigit < 3) {
//         parseNoteInput(key);
//         return;
//     }
//     // Handle entry of digits
//     let digit = (key.length === 1)? key.match(/[0-9a-f]/i) : null;
//     digit = digit? digit[0] : null;
//     if(digit) {
//         parseCellInput(digit, cursor.posX, cursor.posY);
//         return;
//     }
//     //
// }
function handleWheel(eventWheel) {
    // let scrollLines;
    // switch(eventWheel.deltaMode) {
    //     case 0:
    //         scrollLines = eventWheel.deltaY / FONT_SIZE;
    //         break;
    //     case 1:
    //         scrollLines = eventWheel.deltaY;
    //         break;
    //     case 0:
    //     default:
    //         scrollLines = eventWheel.deltaY * DISPLAY_HEIGHT;
    //         break;
    // }
    // scrollBy(scrollLines);
}













//------------------------------------------------
Vue.component('pattern-canvas', {
    template: `<canvas
        id="pattern_display"
        @mousedown = "handleMouseDown"
        @mouseup = "handleMouseUp"
        @wheel = "handleWheel"
        @mousemove = "handleMouseMove"
    />`, // document.addEventListener('keydown', handleKeyDown);
    mounted() {
        setup(this);
    },
    methods: {
        handleMouseDown: handleMouseDown,
        handleMouseUp: handleMouseUp,
        handleMouseMove: handleMouseMove,
        handleWheel: handleWheel,
    }
});

//-- Module State --------------------------------
// let patternGrid = [];
// let drawWaiting = false;
// let heightCanvas = DISPLAY_HEIGHT;

// //-- Pattern Display -----------------------------
// export function patternDisplay() {
//     const data = dataGet();
//     patternGrid = new Array(data.length*CELL_WIDTH)
//     //
//     const rows = data.length / CHANNELS_NUMBER;
//     for(let row = 0; row < rows; row++) {
//         const offsetRow = row*CHANNELS_NUMBER;
//         for(let channel = 0; channel < CHANNELS_NUMBER; channel++) {
//             drawCell(row, channel, data[offsetRow+channel]);
//         }
//     }
//     //
//     if(drawWaiting) { return true;}
//     drawWaiting = true;
//     requestAnimationFrame(() => {
//         drawPatternGrid();
//         drawWaiting = false;
//     });
//     return true;
// }
// function drawCell(row, channel, dataCell) {
//     const offsetX = channel*CELL_WIDTH;
//     const offsetY = row;
//     const [note, instrument, volume, effects] = cellParse(dataCell);
//     if(note === undefined) {
//         placeString('···', offsetX, offsetY);
//     } else if(channel === CHANNEL_NOISE && note !== MASK_CELL_NOTE_STOP) {
//         placeString('*'+note.toString(HEX).toUpperCase()+'*', offsetX, offsetY);
//     } else {
//         const noteName = noteNumberToName(note);
//         placeString(noteName, offsetX, offsetY);
//     }
//     if(instrument === undefined) {
//         placeString('·', offsetX+3, offsetY);
//     } else {
//         placeString(instrument.toString(HEX).toUpperCase(), offsetX+3, offsetY);
//     }
//     if(volume === undefined) {
//         placeString('··', offsetX+4, offsetY);
//     } else {
//         placeString(volume.toString(HEX).padStart(2,'0').toUpperCase(), offsetX+4, offsetY);
//     }
//     if(effects === undefined) {
//         placeString('···', offsetX+6, offsetY);
//     } else {
//         placeString(effects.toString(HEX).padStart(3,'0').toUpperCase(), offsetX+6, offsetY);
//     }
// }

// //-- Pattern Grid --------------------------------
// function drawPatternGrid() {
//     // Ensure context changes don't bleed into other functions
//     context.save();
//     // Get pattern and interface state
//     const data = dataGet();
//     const rows = data.length / CHANNELS_NUMBER;
//     const selection = getSelection();
//     const cursor = getCursor();
//     const scrollY = getScroll();
//     // Draw character grid (the whole big deal)
//     context.fillStyle = COLOR_BG;
//     context.fillRect(0,0,context.canvas.width, context.canvas.height);
//     for(let row = scrollY; row < rows; row++) {
//         let background = (row%2)? COLOR_BG : '#222';
//         drawString(
//             row.toString(HEX).padStart(2,'0')+' ',
//             0, row-scrollY,
//             '#888', background,
//         );
//         if(cursor && row === cursor.posY && !selection) {
//             background = '#606';
//         }
//         for(let channel = 0; channel < CHANNELS_NUMBER; channel++) {
//             const offsetChannel = channel*CELL_WIDTH;
//             drawGridPos(offsetChannel+0, row, '#fff', background);
//             drawGridPos(offsetChannel+1, row, '#fff', background);
//             drawGridPos(offsetChannel+2, row, '#fff', background);
//             drawGridPos(offsetChannel+3, row, '#f88', background);
//             drawGridPos(offsetChannel+4, row, '#6bf', background);
//             drawGridPos(offsetChannel+5, row, '#6bf', background);
//             drawGridPos(offsetChannel+6, row, '#86f', background);
//             drawGridPos(offsetChannel+7, row, '#86f', background);
//             drawGridPos(offsetChannel+8, row, '#86f', background);
//         }
//     }
//     // Draw Selection box
//     if(selection) {
//         const posYMax = Math.min(rows-1, selection.posEndY);
//         for(let posY = selection.posStartY; posY <= posYMax; posY++) {
//             for(let posX = selection.posStartX; posX <= selection.posEndX; posX++) {
//                 drawGridPos(posX, posY, COLOR_FG_HIGHLIGHT, COLOR_BG_HIGHLIGHT);
//             }
//         }
//     }
//     // Draw Cursor
//     if(cursor) {
//         drawGridPos(cursor.posX, cursor.posY, COLOR_FG_HIGHLIGHT, COLOR_BG_HIGHLIGHT);
//         drawString(
//             cursor.posY.toString(HEX).padStart(2,'0')+' ',
//             0, cursor.posY-scrollY,
//             COLOR_FG_HIGHLIGHT, COLOR_BG_HIGHLIGHT,
//         );
//     }
//     // Cleanup context
//     context.restore();
// }
// function placeChar(char, posX, posY) {
//     const compoundIndex = posY*DISPLAY_CHAR_WIDTH+posX;
//     patternGrid[compoundIndex] = char;
// }
// function placeString(string, posX, posY) {
//     for(let indexChar = 0; indexChar < string.length; indexChar++) {
//         placeChar(string[indexChar], posX+indexChar, posY);
//     }
// }

// //-- Drawing Primitives --------------------------
// function drawChar(char, posX, posY, color=COLOR_FG, background=COLOR_BG) {
//     if(posX < 0 || posX >= CELL_WIDTH*CHANNELS_NUMBER+WIDTH_LINE_NUMBER) { return;}
//     if(posY < 0 || posY >= lengthGet()) { return;}
//     context.save();
//     const fillX = posX*FONT_SIZE;
//     const fillY = posY*FONT_SIZE;
//     const textX = fillX;
//     const textY = fillY+FONT_SIZE;
//     context.fillStyle = background;
//     context.fillRect(fillX, fillY, FONT_SIZE, FONT_SIZE);
//     if(char === '·') {
//         context.globalAlpha = 0.5;
//     }
//     context.fillStyle = color;
//     context.fillText(char, textX, textY);
//     context.restore();
// }
// function drawGridPos(posX, posY, color=COLOR_FG, background=COLOR_BG) {
//     const compoundIndex = posY*DISPLAY_CHAR_WIDTH+posX;
//     let scrollY = getScroll();
//     posY -= scrollY;
//     posX += WIDTH_LINE_NUMBER;
//     drawChar(patternGrid[compoundIndex], posX, posY, color, background);
// }
// function drawString(string, posX, posY, color=COLOR_FG, background=COLOR_BG) {
//     for(let indexChar = 0; indexChar < string.length; indexChar++) {
//         drawChar(string[indexChar], posX+indexChar, posY, color, background);
//     }
// }

// //-- Canvas Size ---------------------------------
// export function canvasHeightSet(heightNew) {
//     context.canvas.height = heightNew*FONT_SIZE;
//     heightCanvas = heightNew;
//     contextConfigure(context);
//     patternDisplay();
//     scrollCheck();
// }
// export function canvasHeightGet() {
//     return heightCanvas;
// }
