

//==============================================================================

//-- Dependencies --------------------------------
import { contextConfigure, COLOR_BG, COLOR_BG_HIGHLIGHT, COLOR_BG_HINT } from '../utilities.js';
import { DISPLAY_PIXEL_WIDTH } from '../editor_pattern/canvas.js';
import { instrumentGet } from './instrument.js';
import { TAU } from '../processor.js';

//-- Constants -----------------------------------
const DISPLAY_INSTRUMENT_HEIGHT = 256;

//-- Module State --------------------------------
let context;
let zoomSampleWidth = 1024;

//------------------------------------------------
export async function setup() {
    const canvas = document.createElement('canvas');
    canvas.id = 'instrument_display';
    canvas.width = DISPLAY_PIXEL_WIDTH;
    canvas.height = DISPLAY_INSTRUMENT_HEIGHT;
    context = canvas.getContext('2d');
    contextConfigure(context);
    //
    setTimeout(() => {
        instrumentDraw()
    }, 10)
    //
    return canvas;
}

//-- Drawing -------------------------------------
export function instrumentDraw() {
    context.save();
    const instrument = instrumentGet();
    // Blank and fill back color
    context.fillStyle = COLOR_BG;
    context.fillRect(0, 0, DISPLAY_PIXEL_WIDTH, DISPLAY_INSTRUMENT_HEIGHT);
    context.fillStyle = '#444';
    // Draw Graph
    for(let volume = 0; volume <= 1; volume += 1/8) {
        const posY = Math.floor(volume*DISPLAY_INSTRUMENT_HEIGHT);
        context.fillRect(0, posY, DISPLAY_PIXEL_WIDTH, 1);
    }
    const sampleWidthFloor = Math.pow(2, Math.floor(Math.log2(zoomSampleWidth)));
    for(let sampleX = 0; sampleX <= zoomSampleWidth; sampleX += (sampleWidthFloor >> 4)) {
        const posX = Math.floor((sampleX/zoomSampleWidth) * DISPLAY_PIXEL_WIDTH);
        context.fillRect(posX, 0, 1, DISPLAY_INSTRUMENT_HEIGHT);
    }
    // Plot lines
    context.strokeStyle = 'white';
    context.beginPath();
    let first = true;
    let posXCurrent = 0;
    for(let indexPoint = 0; indexPoint < instrument.envelopeLengthGet(); indexPoint++) {
        const point = instrument.envelopePointGet(indexPoint);
        const posY = (1-point[0]) * DISPLAY_INSTRUMENT_HEIGHT;
        const posX = (point[1]/zoomSampleWidth) * DISPLAY_PIXEL_WIDTH;
        posXCurrent = posX;
        if(first) {
            first = false;
            context.moveTo(posX, posY);
        } else {
            context.lineTo(posX, posY);
        }
    }
    context.stroke();
    // Plot points
    context.fillStyle = COLOR_BG_HIGHLIGHT;
    for(let indexPoint = 0; indexPoint < instrument.envelopeLengthGet(); indexPoint++) {
        const point = instrument.envelopePointGet(indexPoint);
        const posY = (1-point[0]) * DISPLAY_INSTRUMENT_HEIGHT;
        const posX = (point[1]/zoomSampleWidth) * DISPLAY_PIXEL_WIDTH;
        context.beginPath();
        context.arc(posX, posY, 8, 0, TAU);
        context.fill();
    }
    //
    context.restore();
}
