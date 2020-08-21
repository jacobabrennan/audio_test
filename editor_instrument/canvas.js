

//==============================================================================

//-- Dependencies --------------------------------
import { TAU } from '../processor.js';
import {
    contextConfigure,
    COLOR_BG,
    COLOR_BG_HIGHLIGHT,
    COLOR_BG_HINT,
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
let zoomSampleWidth = 1024;
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
    context.fillStyle = '#444';
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
    let pointSelection = pointSelectionGet();
    context.strokeStyle = 'grey';
    context.lineWidth = 4;
    context.beginPath();
    let first = true;
    let sampleXCurrent = 0;
    pointSprites = [];
    for(let indexPoint = 0; indexPoint < instrument.envelopeLengthGet(); indexPoint++) {
        let point;
        if(pointSelection && indexPoint === pointSelection.index && pointSelection.point) {
            point = [pointSelection.point[0], pointSelection.point[1]];
        } else {
            point = instrument.envelopePointGet(indexPoint);
        }
        sampleXCurrent += point[0];
        const pointDrawn = [
            (sampleXCurrent/zoomSampleWidth) * DISPLAY_PIXEL_WIDTH,
            (1-point[1]) * DISPLAY_INSTRUMENT_HEIGHT,
        ];
        pointSprites.push(pointDrawn);
        if(first) {
            first = false;
            context.moveTo(pointDrawn[0], pointDrawn[1]);
        } else {
            context.lineTo(pointDrawn[0], pointDrawn[1]);
        }
    }
    context.stroke();
    // Plot points
    context.fillStyle = COLOR_BG_HIGHLIGHT;
    for(let point of pointSprites) {
        context.fillRect(point[0], 0, 1, DISPLAY_INSTRUMENT_HEIGHT);
        context.beginPath();
        context.arc(point[0], point[1], GRAPH_POINT_RADIUS, 0, TAU);
        context.stroke();
        context.fill();
    }
    // Draw Selected Point
    if(pointSelection) {
        context.fillStyle = COLOR_BG_HINT;
        const selectedPoint = pointSprites[pointSelection.index];
        context.fillRect(
            selectedPoint[0], 0,
            1, DISPLAY_INSTRUMENT_HEIGHT,
        );
        context.beginPath();
        context.arc(
            selectedPoint[0], selectedPoint[1],
            GRAPH_POINT_RADIUS, 0, TAU
        );
        context.stroke();
        context.fill();
    }
    //
    context.restore();
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
    const zoomLevels = [64,128,256,512,1024,2048,4096,8192];
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
