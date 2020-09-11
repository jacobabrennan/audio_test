

//==============================================================================

//-- Dependencies --------------------------------
import Vue from '../libraries/vue.esm.browser.js';
import { TAU } from '../libraries/audio_processor.js';
import {
    contextConfigure,
    COLOR_BG,
    COLOR_BG_HIGHLIGHT,
    COLOR_BG_HINT,
    COLOR_FG_HIGHLIGHT,
} from '../utilities.js';
import { DISPLAY_PIXEL_WIDTH } from '../editor_pattern/canvas.js';
import {
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    handleWheel,
} from './input.js';

//-- Constants -----------------------------------
export const GRAPH_POINT_RADIUS = 8;
export const DISPLAY_INSTRUMENT_HEIGHT = 254;
export const DISPLAY_INSTRUMENT_PADDING = 8;
export const DISPLAY_INSTRUMENT_INNER_HEIGHT = DISPLAY_INSTRUMENT_HEIGHT - DISPLAY_INSTRUMENT_PADDING*2;
export const DISPLAY_INSTRUMENT_INNER_WIDTH = DISPLAY_PIXEL_WIDTH - DISPLAY_INSTRUMENT_PADDING*2;
export const EVENT_UPDATE_ENVELOPES = 'update-envelopes';

//------------------------------------------------
Vue.component('editor-envelope', {
    template: (`
        <canvas
            @mousedown="handleMouseDown"
            @mouseup="handleMouseUp"
            @mousemove="handleMouseMove"
            @mouseleave="handleMouseUp"
            @wheel="handleWheel"
        />
    `),
    props: {
        instrument: {
            type: Object,
            required: true,
        },
    },
    data: function () {
        return {
            zoom: 2048,
        };
    },
    watch: {
        instrument: {
            deep: true,
            handler: 'refresh',
        },
        zoom: 'refresh',
    },
    mounted() {
        //
        const canvas = this.$el;
        canvas.width = DISPLAY_PIXEL_WIDTH;
        canvas.height = DISPLAY_INSTRUMENT_HEIGHT;
        //
        this.context = canvas.getContext('2d');
        contextConfigure(this.context);
        this.context.translate(DISPLAY_INSTRUMENT_PADDING, DISPLAY_INSTRUMENT_PADDING)
        //
        this.refresh();
    },
    methods: {
        handleMouseDown: handleMouseDown,
        handleMouseUp: handleMouseUp,
        handleMouseMove: handleMouseMove,
        handleWheel: handleWheel,
        refresh() {
            this.plotPoints();
            this.draw();
        },
        plotPoints() {
            if(!this.instrument.envelopeVolume.length) {
                return [];
            }
            // Prep for loop
            let sampleTotal = 0;
            this.points = [];
            // Retreive each point and save location information
            for(let index = 0; index < this.instrument.envelopeVolume.length; index++) {
                sampleTotal += this.instrument.envelopeDuration[index];
                let durationX = (sampleTotal/this.zoom);
                let volumeY = (1-this.instrument.envelopeVolume[index]);
                durationX *= DISPLAY_INSTRUMENT_INNER_WIDTH;
                volumeY *= DISPLAY_INSTRUMENT_INNER_HEIGHT;
                const point = {
                    x: durationX,
                    y:  volumeY,
                };
                this.points.push(point);
            }
        },
        draw() {
            this.context.save();
            // Blank and fill back color
            this.context.fillStyle = COLOR_BG;
            this.context.fillRect(
                -DISPLAY_INSTRUMENT_PADDING, -DISPLAY_INSTRUMENT_PADDING,
                DISPLAY_PIXEL_WIDTH, DISPLAY_INSTRUMENT_HEIGHT,
            );
            this.context.fillStyle = '#438';
            // Draw graph lines
            for(let volume = 0; volume <= 1; volume += 1/8) {
                const posY = Math.floor(volume*DISPLAY_INSTRUMENT_INNER_HEIGHT);
                this.context.fillRect(0, posY, DISPLAY_INSTRUMENT_INNER_WIDTH, 1);
            }
            const sampleWidthFloor = Math.pow(2, Math.floor(Math.log2(this.zoom)));
            for(let sampleX = 0; sampleX <= this.zoom; sampleX += (sampleWidthFloor >> 4)) {
                const posX = Math.floor((sampleX/this.zoom) * DISPLAY_INSTRUMENT_INNER_WIDTH);
                this.context.fillRect(posX, 0, 1, DISPLAY_INSTRUMENT_INNER_HEIGHT);
            }
            // Draw sample markers
            if(DISPLAY_INSTRUMENT_INNER_WIDTH / this.zoom > 2) {
                this.context.fillStyle = 'white';
                for(let sampleX = 0; sampleX <= this.zoom; sampleX += 2) {
                    const posX = Math.floor((sampleX/this.zoom) * DISPLAY_INSTRUMENT_INNER_WIDTH);
                    this.context.fillRect(posX, DISPLAY_INSTRUMENT_INNER_HEIGHT-8, 1, 8);
                }
            }
            // Draw envelope lines
            this.drawEnvelope();
            // Draw points
            for(let point of this.points) {
                this.drawPoint(point.x, point.y, COLOR_BG_HIGHLIGHT);
            }
            // Draw Selected Point
            if(this.pointSelection) {
                this.drawPoint(
                    this.pointSelection.point.x,
                    this.pointSelection.point.y,
                    COLOR_BG_HINT,
                );
            }
            // Draw Sustain marker
            if(this.instrument.sustain !== undefined) {
                this.context.fillStyle = COLOR_FG_HIGHLIGHT;
                const pointSus = this.points[this.instrument.sustain];
                this.context.fillText('S', pointSus.x-7, pointSus.y+7);
            }
            // Draw Loop markers
            if(this.instrument.loopStart !== undefined) {
                this.context.fillStyle = COLOR_FG_HIGHLIGHT;
                const pointLoopStart = this.points[this.instrument.loopStart];
                this.context.fillText('>', pointLoopStart.x-13, pointLoopStart.y+7);
                const pointLoopEnd = this.points[this.instrument.loopEnd];
                this.context.fillText('<', pointLoopEnd.x-1, pointLoopEnd.y+7);
            }
            //
            this.context.restore();
        },
        drawEnvelope() {
            if(!this.points.length) { return [];}
            // Set drawing styles
            this.context.strokeStyle = 'grey';
            this.context.lineWidth = 4;
            // Move path to start of graph
            this.context.beginPath();
            this.context.moveTo(this.points[0].x, this.points[0].y);
            // Draw path connecting points
            for(let index = 0; index < this.points.length; index++) {
                this.context.lineTo(this.points[index].x, this.points[index].y);
            }
            // Finalize graph / path
            this.context.stroke();
        },
        drawPoint(posX, posY, color) {
            this.context.fillStyle = color;
            this.context.fillRect(posX, 0, 1, DISPLAY_INSTRUMENT_INNER_HEIGHT);
            this.context.beginPath();
            this.context.arc(posX, posY, GRAPH_POINT_RADIUS, 0, TAU);
            this.context.stroke();
            this.context.fill();
        },
        modifyNode(indexChanged) {
            //
            if(!this.points) { return;}
            // Calculate change in sample duration
            let samplePosBefore = 0;
            for(let index=0; index <= indexChanged; index++) {
                samplePosBefore += this.instrument.envelopeDuration[index];
            }
            let samplePosCurrent = (this.points[indexChanged].x/DISPLAY_INSTRUMENT_INNER_WIDTH) * this.zoom;
            let samplePosDelta = samplePosCurrent - samplePosBefore;
            // Modify duration
            const envelopeDurationNew = this.instrument.envelopeDuration.slice();
            envelopeDurationNew[indexChanged] += samplePosDelta;
            if(indexChanged+1 < this.instrument.envelopeDuration.length) {
                envelopeDurationNew[indexChanged+1] = this.instrument.envelopeDuration[indexChanged+1];
                envelopeDurationNew[indexChanged+1] -= samplePosDelta;
            }
            // Modify Volume
            const envelopeVolumeNew = this.instrument.envelopeVolume.slice();
            const volumeNew = 1-(this.points[indexChanged].y / DISPLAY_INSTRUMENT_INNER_HEIGHT);
            envelopeVolumeNew[indexChanged] = volumeNew;
            //
            this.$emit(EVENT_UPDATE_ENVELOPES, {
                duration: envelopeDurationNew,
                volume: envelopeVolumeNew,
            });
        }
    }
});
