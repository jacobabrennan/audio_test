

//==============================================================================

import {
    graphSpritesGet,
    instrumentDraw,
    instrumentZoomGet,
    GRAPH_POINT_RADIUS,
    DISPLAY_INSTRUMENT_HEIGHT,
    instrumentPointSelect,
    instrumentZoomAdjust,
} from './canvas.js';
import { DISPLAY_PIXEL_WIDTH } from '../editor_pattern/canvas.js';

//-- Dependencies --------------------------------

//-- Module State --------------------------------
let pointSelection;
let eventTarget;

//-- Setup ---------------------------------------
export function setup(canvas) {
    eventTarget = canvas;
    canvas.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('wheel', handleWheel);
}

//------------------------------------------------
export function pointSelectionGet() {
    return pointSelection;
}

//-- Event Handlers ------------------------------
function handleMouseDown(eventMouseDown) {
    const coord = getEventCoords(eventMouseDown);
    const points = graphSpritesGet();
    for(let point of points) {
        const deltaX = point[0] - coord.x;
        const deltaY = point[1] - coord.y;
        const hippopotenuse = Math.sqrt(deltaX*deltaX+deltaY*deltaY);
        if(hippopotenuse <= GRAPH_POINT_RADIUS) {
            pointSelection = {
                index: points.indexOf(point),
            };
            instrumentDraw();
            break;
        }
    }
}
function handleMouseUp(eventMouseUp) {
    const selection = pointSelection;
    pointSelection = undefined;
    if(selection && selection.point) {
        instrumentPointSelect(selection);
    }
}
function handleMouseMove(eventMouseMove) {
    if(!pointSelection) { return;}
    const coord = getEventCoords(eventMouseMove);
    if(!coord) { return;}
    const points = graphSpritesGet();
    let posXMin = 0;
    let posXMax = Infinity;
    if(pointSelection.index > 0) {
        const pointPrior = points[pointSelection.index-1];
        posXMin = pointPrior[0];
    }
    if(pointSelection.index === 0) {
        posXMax = 0;
    } else if(pointSelection.index+1 < points.length) {
        const pointNext = points[pointSelection.index+1];
        posXMax = pointNext[0];
    }
    let zoom = instrumentZoomGet();
    let duration = Math.max(posXMin, Math.min(coord.x, posXMax));
    duration -= posXMin;
    duration = (duration/DISPLAY_PIXEL_WIDTH) * zoom;
    let volume = Math.max(0, Math.min(DISPLAY_INSTRUMENT_HEIGHT, coord.y));
    volume = 1 - (volume/DISPLAY_INSTRUMENT_HEIGHT);
    pointSelection.point = [duration, volume];
    instrumentDraw();
}
function handleWheel(eventWheel) {
    instrumentZoomAdjust(eventWheel.deltaY);
}
function getEventCoords(event) {
    if(!event.target) { return;}
    const clientRect = eventTarget.getClientRects()[0];
    let posX = event.clientX - clientRect.left;
    let posY = event.clientY - clientRect.top;
    return {
        x: posX,
        y: posY,
    };
}
