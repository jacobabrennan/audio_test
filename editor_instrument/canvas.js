

//==============================================================================

//-- Dependencies --------------------------------
import Vue from '../libraries/vue.esm.browser.js';
import { TAU } from '../libraries/audio_processor.js';
import {
    contextConfigure,
    COLOR_BG,
    COLOR_BG_HIGHLIGHT,
    // COLOR_BG_HINT,
    COLOR_FG_HIGHLIGHT,
} from '../utilities.js';
import { DISPLAY_PIXEL_WIDTH } from '../editor_pattern/canvas.js';

//-- Constants -----------------------------------
export const GRAPH_POINT_RADIUS = 8;
export const DISPLAY_INSTRUMENT_HEIGHT = 254;

//------------------------------------------------
Vue.component('editor-envelope', {
    template: (`
        <canvas />
    `),
    props: {
        zoom: {
            type: Number,
            default: 200,
        },
        instrument: {
            type: Object,
            required: true,
        },
    },
    mounted() {
        //
        const canvas = this.$el;
        canvas.width = DISPLAY_PIXEL_WIDTH;
        canvas.height = DISPLAY_INSTRUMENT_HEIGHT;
        //
        this.context = canvas.getContext('2d');
        contextConfigure(this.context);
        //
        canvas.style.background = 'black'
        this.draw()
    },
    methods: {
        draw() {
            this.context.save();
            // Blank and fill back color
            this.context.fillStyle = COLOR_BG;
            this.context.fillRect(0, 0, DISPLAY_PIXEL_WIDTH, DISPLAY_INSTRUMENT_HEIGHT);
            this.context.fillStyle = '#438';
            // Draw graph lines
            for(let volume = 0; volume <= 1; volume += 1/8) {
                const posY = Math.floor(volume*DISPLAY_INSTRUMENT_HEIGHT);
                this.context.fillRect(0, posY, DISPLAY_PIXEL_WIDTH, 1);
            }
            const sampleWidthFloor = Math.pow(2, Math.floor(Math.log2(this.zoom)));
            for(let sampleX = 0; sampleX <= this.zoom; sampleX += (sampleWidthFloor >> 4)) {
                const posX = Math.floor((sampleX/this.zoom) * DISPLAY_PIXEL_WIDTH);
                this.context.fillRect(posX, 0, 1, DISPLAY_INSTRUMENT_HEIGHT);
            }
            // Draw sample markers
            if(DISPLAY_PIXEL_WIDTH / this.zoom > 2) {
                this.context.fillStyle = 'white';
                for(let sampleX = 0; sampleX <= this.zoom; sampleX += 2) {
                    const posX = Math.floor((sampleX/this.zoom) * DISPLAY_PIXEL_WIDTH);
                    this.context.fillRect(posX, DISPLAY_INSTRUMENT_HEIGHT-8, 1, 8);
                }
            }
            // Plot lines
            let pointSprites = this.plotLines();
            // Plot points
            for(let point of pointSprites) {
                this.drawPoint(point[0], point[1], COLOR_BG_HIGHLIGHT);
            }
            // Draw Selected Point
            // let pointSelection = pointSelectionGet();
            // if(pointSelection) {
            //     const selectedPoint = pointSprites[pointSelection.index];
            //     this.drawPoint(selectedPoint[0], selectedPoint[1], COLOR_BG_HINT);
            // }
            // Draw Sustain marker
            if(this.instrument.sustain !== undefined) {
                this.context.fillStyle = COLOR_FG_HIGHLIGHT;
                const pointSus = pointSprites[this.instrument.sustain];
                this.context.fillText('S', pointSus[0]-7, pointSus[1]+7);
            }
            // Draw Loop markers
            if(this.instrument.loopStart !== undefined) {
                this.context.fillStyle = COLOR_FG_HIGHLIGHT;
                const pointLoopStart = pointSprites[this.instrument.loopStart];
                this.context.fillText('>', pointLoopStart[0]-13, pointLoopStart[1]+7);
                const pointLoopEnd = pointSprites[this.instrument.loopEnd];
                this.context.fillText('<', pointLoopEnd[0]-1, pointLoopEnd[1]+7);
            }
            //
            this.context.restore();
        },
        plotLines() {
            if(!this.instrument.envelopeVolume.length) {
                return [];
            }
            // Set drawing styles
            this.context.strokeStyle = 'grey';
            this.context.lineWidth = 4;
            // Move path to start of graph
            this.context.beginPath();
            this.context.moveTo(
                this.instrument.envelopeDuration[0],
                this.instrument.envelopeVolume[0],
            );
            // Prep for loop
            // const selection = pointSelectionGet();
            let sampleTotal = 0;
            const pointSprites = [];
            // Retreive each point, save location information, and connect path
            for(let index = 0; index < this.instrument.envelopeVolume.length; index++) {
                // Retreive points from envelope, and from user selection
                // if(selection && index === selection.index && selection.point) {
                //     point = [selection.point[0], selection.point[1]];
                // }
                // Save location information
                sampleTotal += this.instrument.envelopeDuration[index];
                const pointDrawn = [
                    (sampleTotal/this.zoom) * DISPLAY_PIXEL_WIDTH,
                    (1-this.instrument.envelopeVolume[index]) * DISPLAY_INSTRUMENT_HEIGHT,
                ];
                pointSprites.push(pointDrawn);
                // Connect path
                this.context.lineTo(pointDrawn[0], pointDrawn[1]);
            }
            // Finalize graph / path
            this.context.stroke();
            // Return location information
            return pointSprites;
        },    
        drawPoint(posX, posY, color) {
            this.context.fillStyle = color;
            this.context.fillRect(posX, 0, 1, DISPLAY_INSTRUMENT_HEIGHT);
            this.context.beginPath();
            this.context.arc(posX, posY, GRAPH_POINT_RADIUS, 0, TAU);
            this.context.stroke();
            this.context.fill();
        }
    }
});

// //-- Drawing -------------------------------------

// //------------------------------------------------
// export function instrumentPointSelect(selection) {
//     const instrument = instrumentGet();
//     instrument.envelopePointSet(
//         selection.index, selection.point[0], selection.point[1],
//     );
//     instrumentDraw();
// }

// //------------------------------------------------
// export function instrumentZoomAdjust(direction) {
//     // const zoomLevels = [90,128,181,256,362,512,724,1024,1448,2048,2896,4096];
//     const zoomLevels = [256,512,1024,2048,4096,8192,16384,32768];
//     let indexZoom = zoomLevels.indexOf(this.zoom);
//     if(indexZoom === -1) {
//         indexZoom = 8;
//     }
//     direction = Math.sign(direction);
//     indexZoom += direction;
//     if(indexZoom < 0 || indexZoom >= zoomLevels.length) { return;}
//     this.zoom = zoomLevels[indexZoom];
//     instrumentDraw();
// }
