

//==============================================================================

//-- Dependencies --------------------------------
import Vue from '../libraries/vue.esm.browser.js';
import './canvas.js';
import { pattern, CHANNELS_NUMBER } from '../processor.js';
import {
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    handleWheel,
} from './input.js';
import {
    DISPLAY_PIXEL_WIDTH,
    DISPLAY_HEIGHT,
    patternDisplay,
    patternGridConstruct,
} from './canvas.js';
import {
    contextConfigure,
    FONT_SIZE,
} from '../utilities.js';
// import {
//     cursorHighlight,
// } from './cursor.js';
// import {
//     setup as setupInput,
// } from './input.js';
// import {
//     setup as setupCanvas,
//     patternDisplay,
//     DISPLAY_HEIGHT,
//     canvasHeightSet,
// } from './canvas.js';
// import {
//     patternSelect
// } from './pattern.js';
// import { setup as setupControlPattern, patternListUpdate } from './control_pattern.js';
// import { setup as setupControlPlayback } from './control_playback.js';
// import { paneAdd } from '../pane/pane_editor.js';
// import {
//     EDITOR_PANE_PATTERN,
//     CONTROL_GROUP_PATTERN,
//     CONTROL_GROUP_PLAYBACK,
//     CONTROL_GROUP_EDITOR_SWAP,
//     CONTROL_GROUP_INSTRUMENT_SELECT,
//     CONTROL_GROUP_FILE_MANAGEMENT,
// } from '../utilities.js';
// import { groupRegister } from '../pane/pane_control.js';

//------------------------------------------------
Vue.component('editor-pattern', {
    template: `<canvas
        id="pattern_display"
        @mousedown = "handleMouseDown"
        @mouseup = "handleMouseUp"
        @wheel = "handleWheel"
        @mousemove = "handleMouseMove"
    />`,
    props: {
        pattern: Array,
        cursor: Object,
        selection: Object,
        scrollY: Number
    },
    methods: {
        handleMouseDown: handleMouseDown,
        handleMouseUp: handleMouseUp,
        handleMouseMove: handleMouseMove,
        handleWheel: handleWheel,
        draw() {
            const patternGrid = patternGridConstruct(this.pattern);
            patternDisplay(this.context, patternGrid);
        }
    },
    mounted() {
        const canvas = this.$el;
        canvas.imTheDrawCanvas = true;
        //
        canvas.width  = DISPLAY_PIXEL_WIDTH;
        canvas.height = DISPLAY_HEIGHT*FONT_SIZE;
        //
        this.context = canvas.getContext('2d');
        contextConfigure(this.context);
        //
        canvas.tabIndex = 1;
        setTimeout(() => {
            canvas.focus();
        }, 1);
        const patternGrid = patternGridConstruct(this.pattern);
        patternDisplay(this.context, patternGrid);
    },
    watch: {
        scrollY: function () {
            console.log('scrolly')
            this.draw();
        },
        pattern: {
            deep: true,
            handler: 'draw',
        }
    }
});

//-- Setup ---------------------------------------
export function patternEditorShown() {
    canvasHeightSet(DISPLAY_HEIGHT);
}

//-- Pattern Display -----------------------------
export function highlightRow(indexRow, indexPattern, scroll) {
    if(indexPattern !== undefined) {
        patternSelect(indexPattern);
        patternListUpdate();
    }
    cursorHighlight(indexRow);
    patternDisplay();
    return true;
}
