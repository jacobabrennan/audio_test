

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
    setup as setupCanvas,
    DISPLAY_PIXEL_WIDTH,
    DISPLAY_HEIGHT,
    patternDisplay,
    patternGridConstruct,
} from './canvas.js';
// import {
//     cursorHighlight,
// } from './cursor.js';
// import {
//     setup as setupInput,
// } from './input.js';
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
    },
    data() {
        return {
            patternGrid: null,
            cursor: {
                posX: 0,
                posY: 0,
            },
            selection: null,
            scrollY: 48,
        };
    },
    methods: {
        handleMouseDown: handleMouseDown,
        handleMouseUp: handleMouseUp,
        handleMouseMove: handleMouseMove,
        handleWheel: handleWheel,
        draw() {
            patternDisplay(
                this.context,
                this.patternGrid,
                this.cursor,
                this.selection,
                this.scrollY
            );
        },
    },
    mounted() {
        this.context = setupCanvas(this.$el);
        this.patternGrid = patternGridConstruct(this.pattern);
    },
    watch: {
        scrollY: 'draw',
        patternGrid: 'draw',
        pattern: {
            deep: true,
            handler: function (valueNew) {
                this.patternGrid = patternGridConstruct(valueNew);
            },
        },
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
