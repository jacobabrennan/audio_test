

//==============================================================================

//-- Dependencies --------------------------------
import { contextConfigure } from '../utilities.js';
import { DISPLAY_PIXEL_WIDTH } from '../editor_pattern/canvas.js';

//-- Module State --------------------------------
let context;

//------------------------------------------------
export async function setup() {
    const canvas = document.createElement('canvas');
    canvas.id = 'instrument_display';
    canvas.width = DISPLAY_PIXEL_WIDTH;
    canvas.height = 378;
    context = canvas.getContext('2d');
    contextConfigure(context);
    return canvas;
}