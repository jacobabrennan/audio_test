

//==============================================================================

//-- Dependencies --------------------------------
import {
    GRAPH_POINT_RADIUS,
    DISPLAY_INSTRUMENT_HEIGHT,
} from './canvas.js';

//-- Event Handlers ------------------------------
export function handleMouseDown(eventMouseDown) {
    const coord = getEventCoords(eventMouseDown);
    for(let index = 0; index < this.points.length; index++) {
        const point = this.points[index];
        const deltaX = point.x - coord.x;
        const deltaY = point.y - coord.y;
        const hippopotenuse = Math.sqrt(deltaX*deltaX+deltaY*deltaY);
        if(hippopotenuse <= GRAPH_POINT_RADIUS) {
            this.pointSelection = {
                index: index,
                point: point,
            };
            this.draw();
            break;
        }
    }
}
export function handleMouseUp(eventMouseUp) {
    const selection = this.pointSelection;
    this.pointSelection = undefined;
    if(!selection || !selection.point) { return;}
    this.modifyNode(selection.index);
}
export function handleMouseMove(eventMouseMove) {
    //
    if(!this.pointSelection) { return;}
    const coord = getEventCoords(eventMouseMove);
    if(!coord) { return;}
    //
    let posXMin = 0;
    let posXMax = Infinity;
    if(this.pointSelection.index > 0) {
        const pointPrior = this.points[this.pointSelection.index-1];
        posXMin = pointPrior.x;
    }
    if(this.pointSelection.index === 0) {
        posXMax = 0;
    }
    else if(this.pointSelection.index+1 < this.points.length) {
        const pointNext = this.points[this.pointSelection.index+1];
        posXMax = pointNext.x;
    }
    //
    this.pointSelection.point.x = Math.max(posXMin, Math.min(posXMax, coord.x));
    this.pointSelection.point.y = Math.max(0, Math.min(DISPLAY_INSTRUMENT_HEIGHT, coord.y));
    //
    this.draw();
}
export function handleWheel(eventWheel) {
    let direction = Math.sign(eventWheel.deltaY);
    // const zoomLevels = [90,128,181,256,362,512,724,1024,1448,2048,2896,4096];
    const zoomLevels = [256,512,1024,2048,4096,8192,16384,32768];
    let indexZoom = zoomLevels.indexOf(this.zoom);
    if(indexZoom === -1) {
        indexZoom = 8;
    }
    indexZoom += direction;
    if(indexZoom < 0 || indexZoom >= zoomLevels.length) { return;}
    this.zoom = zoomLevels[indexZoom];
}

//-- Utilities -----------------------------------
function getEventCoords(event) {
    if(!event.target) { return;}
    const clientRect = event.target.getClientRects()[0];
    let posX = event.clientX - clientRect.left;
    let posY = event.clientY - clientRect.top;
    return {
        x: posX,
        y: posY,
    };
}
