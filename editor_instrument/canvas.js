

//==============================================================================

//-- Dependencies --------------------------------
import { TAU } from '../libraries/audio_processor.js';
import {
    contextConfigure,
    COLOR_BG,
    COLOR_BG_HIGHLIGHT,
    COLOR_BG_HINT,
    COLOR_FG_HIGHLIGHT,
    FONT_SIZE,
} from '../utilities.js';
import { DISPLAY_PIXEL_WIDTH } from '../editor_pattern/canvas.js';
import { instrumentGet } from './instrument.js';
import {
    setup as setupInput,
    pointSelectionGet,
} from './input.js';

//-- Constants -----------------------------------
export const GRAPH_POINT_RADIUS = 8;
export const DISPLAY_INSTRUMENT_HEIGHT = 256;

//-- Module State --------------------------------
let context;
let zoomSampleWidth = 2048;
let pointSprites = [];

//------------------------------------------------
export async function setup() {
    const canvas = document.createElement('canvas');
    canvas.id = 'instrument_display';
    canvas.width = DISPLAY_PIXEL_WIDTH;
    canvas.height = DISPLAY_INSTRUMENT_HEIGHT;
    //
    setupInput(canvas);
    //
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
    context.fillStyle = '#438';
    // Draw graph lines
    for(let volume = 0; volume <= 1; volume += 1/8) {
        const posY = Math.floor(volume*DISPLAY_INSTRUMENT_HEIGHT);
        context.fillRect(0, posY, DISPLAY_PIXEL_WIDTH, 1);
    }
    const sampleWidthFloor = Math.pow(2, Math.floor(Math.log2(zoomSampleWidth)));
    for(let sampleX = 0; sampleX <= zoomSampleWidth; sampleX += (sampleWidthFloor >> 4)) {
        const posX = Math.floor((sampleX/zoomSampleWidth) * DISPLAY_PIXEL_WIDTH);
        context.fillRect(posX, 0, 1, DISPLAY_INSTRUMENT_HEIGHT);
    }
    // Draw sample markers
    if(DISPLAY_PIXEL_WIDTH / zoomSampleWidth > 2) {
        context.fillStyle = 'white';
        for(let sampleX = 0; sampleX <= zoomSampleWidth; sampleX += 2) {
            const posX = Math.floor((sampleX/zoomSampleWidth) * DISPLAY_PIXEL_WIDTH);
            context.fillRect(posX, DISPLAY_INSTRUMENT_HEIGHT-8, 1, 8);
        }
    }
    // Plot lines
    plotLines();
    // Plot points
    for(let point of pointSprites) {
        drawPoint(point[0], point[1], COLOR_BG_HIGHLIGHT);
    }
    // Draw Selected Point
    let pointSelection = pointSelectionGet();
    if(pointSelection) {
        const selectedPoint = pointSprites[pointSelection.index];
        drawPoint(selectedPoint[0], selectedPoint[1], COLOR_BG_HINT);
    }
    // Draw Sustain marker
    const indexSus = instrument.sustainGet();
    if(indexSus !== undefined) {
        context.fillStyle = COLOR_FG_HIGHLIGHT;
        const pointSus = pointSprites[indexSus];
        context.fillText('S', pointSus[0]-7, pointSus[1]+7);
    }
    // Draw Loop markers
    const dataLoop = instrument.loopGet();
    if(dataLoop) {
        context.fillStyle = COLOR_FG_HIGHLIGHT;
        const pointLoopStart = pointSprites[dataLoop[0]];
        context.fillText('[', pointLoopStart[0]-13, pointLoopStart[1]+7);
        const pointLoopEnd = pointSprites[dataLoop[1]];
        context.fillText(']', pointLoopEnd[0]-1, pointLoopEnd[1]+7);
    }
    //
    context.restore();
}
function plotLines() {
    // Set drawing styles
    context.strokeStyle = 'grey';
    context.lineWidth = 4;
    // Move path to start of graph
    const instrument = instrumentGet();
    const firstPoint = instrument.envelopePointGet(0);
    if(!firstPoint) { return;}
    context.beginPath();
    context.moveTo(firstPoint[0], firstPoint[1]);
    // Prep for loop
    const selection = pointSelectionGet();
    let sampleTotal = 0;
    pointSprites = [];
    // Retreive each point, save location information, and connect path
    for(let index = 0; index < instrument.envelopeLengthGet(); index++) {
        // Retreive points from envelope, and from user selection
        let point = instrument.envelopePointGet(index);
        if(selection && index === selection.index && selection.point) {
            point = [selection.point[0], selection.point[1]];
        }
        // Save location information
        sampleTotal += point[0];
        const pointDrawn = [
            (sampleTotal/zoomSampleWidth) * DISPLAY_PIXEL_WIDTH,
            (1-point[1]) * DISPLAY_INSTRUMENT_HEIGHT,
        ];
        pointSprites.push(pointDrawn);
        // Connect path
        context.lineTo(pointDrawn[0], pointDrawn[1]);
    }
    // Finalize graph / path
    context.stroke();
    // Return location information
    return pointSprites;
}
function drawPoint(posX, posY, color) {
    context.fillStyle = color;
    context.fillRect(posX, 0, 1, DISPLAY_INSTRUMENT_HEIGHT);
    context.beginPath();
    context.arc(posX, posY, GRAPH_POINT_RADIUS, 0, TAU);
    context.stroke();
    context.fill();
}

//------------------------------------------------
export function instrumentPointSelect(selection) {
    const instrument = instrumentGet();
    instrument.envelopePointSet(
        selection.index, selection.point[0], selection.point[1],
    );
    instrumentDraw();
}

//------------------------------------------------
export function graphSpritesGet() {
    return pointSprites;
}
export function instrumentZoomGet() {
    return zoomSampleWidth;
}
export function instrumentZoomAdjust(direction) {
    // const zoomLevels = [90,128,181,256,362,512,724,1024,1448,2048,2896,4096];
    const zoomLevels = [256,512,1024,2048,4096,8192,16384,32768];
    let indexZoom = zoomLevels.indexOf(zoomSampleWidth);
    if(indexZoom === -1) {
        indexZoom = 8;
    }
    direction = Math.sign(direction);
    indexZoom += direction;
    if(indexZoom < 0 || indexZoom >= zoomLevels.length) { return;}
    zoomSampleWidth = zoomLevels[indexZoom];
    instrumentDraw();
}
