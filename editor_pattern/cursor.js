

//==============================================================================

//-- Dependencies --------------------------------
import {
    CHANNELS_NUMBER,
} from '../processor.js';
import {
    CELL_WIDTH,
} from './canvas.js';

//-- Cursor Movement -----------------------------
export function cursorPosition(posX, posY) {
    this.selection = null;
    this.cursor = {
        posX: posX,
        posY: posY,
    };
    this.scrollCheck();
}
export function cursorSelect(posDownX, posDownY, posUpX, posUpY) {
    this.cursor = null;
    let posStartX = Math.min(posDownX, posUpX);
    let posStartY = Math.min(posDownY, posUpY);
    let posEndX = Math.max(posDownX, posUpX);
    let posEndY = Math.max(posDownY, posUpY);
    posStartX = posStartX - posStartX%CELL_WIDTH;
    posEndX = (posEndX - posEndX%CELL_WIDTH) + (CELL_WIDTH-1);
    this.selection = {
        posStartX: posStartX,
        posStartY: posStartY,
        posEndX: posEndX,
        posEndY: posEndY,
    };
}
export function cursorHighlight(indexRow) {
    this.cursor.posY = indexRow;
    this.scrollCheck();
}
export function cursorMove(deltaX, deltaY, wrap=true) {
    if(!this.cursor) { return;}
    let posXNew = this.cursor.posX + deltaX;
    let posYNew = this.cursor.posY + deltaY;
    if(posXNew < 0) {
        posXNew = CHANNELS_NUMBER*CELL_WIDTH -1;
    }
    else if(posXNew >= CHANNELS_NUMBER*CELL_WIDTH) {
        posXNew = 0;
    }
    const length = this.pattern.length / CHANNELS_NUMBER;
    if(posYNew < 0) {
        if(wrap) {
            posYNew = length-1;
        } else {
            posYNew = 0;
        }
    }
    else if(posYNew >= length) {
        if(wrap) {
            posYNew = 0;
        } else {
            posYNew = length-1;
        }
    }
    this.cursorPosition(posXNew, posYNew);
}

//-- Scrolling -----------------------------------
export function scrollTo(posY) {
    this.scrollY = posY;
}
export function scrollBy(deltaY) {
    const rows = this.pattern.length / CHANNELS_NUMBER;
    let scrollYNew = this.scrollY + deltaY;
    scrollYNew = Math.max(0, Math.min(rows-this.height, scrollYNew));
    this.scrollY = scrollYNew;
}
export function scrollCheck() {
    // Check against lower bound (top of display)
    if(this.cursor.posY < this.scrollY) {
        this.scrollTo(this.cursor.posY);
        return;
    }
    // Check against upper bound (bottom of display)
    const canvasHeight = this.height;
    if(this.cursor.posY >= canvasHeight+this.scrollY) {
        this.scrollTo(this.cursor.posY - (canvasHeight-1));
    }
}
