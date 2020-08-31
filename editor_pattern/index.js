

//==============================================================================

//-- Dependencies --------------------------------
import Vue from '../libraries/vue.esm.browser.js';
import './canvas.js';
// import { pattern, CHANNELS_NUMBER } from '../processor.js';
import {
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    handleMouseLeave,
    handleWheel,
    handleKeyDown,
} from './input.js';
import {
    setup as setupCanvas,
    // DISPLAY_PIXEL_WIDTH,
    // DISPLAY_HEIGHT,
    patternDisplay,
    patternGridConstruct,
} from './canvas.js';
import {
    cursorPosition,
    cursorSelect,
    cursorHighlight,
    cursorMove,
    scrollBy,
    scrollTo,
    scrollCheck,
} from './cursor.js';
// import {
//     setup as setupInput,
// } from './input.js';
// import {
//     patternSelect
// } from './pattern.js';
// import { setup as setupControlPattern, patternListUpdate } from './control_pattern.js';
// import { setup as setupControlPlayback } from './control_playback.js';
// import { paneAdd } from '../pane/pane_editor.js';
import {
    contextConfigure
//     EDITOR_PANE_PATTERN,
//     CONTROL_GROUP_PATTERN,
//     CONTROL_GROUP_PLAYBACK,
//     CONTROL_GROUP_EDITOR_SWAP,
//     CONTROL_GROUP_INSTRUMENT_SELECT,
//     CONTROL_GROUP_FILE_MANAGEMENT,
} from '../utilities.js';
// import { groupRegister } from '../pane/pane_control.js';

//------------------------------------------------
Vue.component('editor-pattern', {
    template: `<canvas
        id="pattern_display"
        @mousedown = "handleMouseDown"
        @mouseup = "handleMouseUp"
        @mousemove = "handleMouseMove"
        @mouseleave = "handleMouseLeave"
        @wheel = "handleWheel"
        @keydown = "handleKeyDown"
    />`,
    props: {
        pattern: Array,
        height: {
            type: Number,
            required: true,
        }
    },
    data() {
        return {
            patternGrid: null,
            cursor: {
                posX: 0,
                posY: 0,
            },
            selection: null,
            scrollY: 0,
        };
    },
    methods: {
        handleMouseDown: handleMouseDown,
        handleMouseUp: handleMouseUp,
        handleMouseMove: handleMouseMove,
        handleMouseLeave: handleMouseLeave,
        handleWheel: handleWheel,
        handleKeyDown: handleKeyDown,
        draw() {
            if(this.drawWaiting) { return true;}
            this.drawWaiting = true;
            requestAnimationFrame(() => {
                patternDisplay(
                    this.context,
                    this.patternGrid,
                    this.cursor,
                    this.selection,
                    this.scrollY
                );
                this.drawWaiting = false;
            });
        },
        cursorPosition: cursorPosition,
        cursorSelect: cursorSelect,
        cursorHighlight: cursorHighlight,
        cursorMove: cursorMove,
        scrollBy: scrollBy,
        scrollTo: scrollTo,
        scrollCheck: scrollCheck,
    },
    mounted() {
        this.context = setupCanvas(this.$el, this.height);
        this.patternGrid = patternGridConstruct(this.pattern);
    },
    watch: {
        scrollY: 'draw',
        patternGrid: 'draw',
        selection: 'draw',
        cursor: 'draw',
        pattern: {
            deep: true,
            handler: function (valueNew) {
                this.patternGrid = patternGridConstruct(valueNew);
            },
        },
        height: function (valueNew) {
            this.context.canvas.height = valueNew*FONT_SIZE;
            contextConfigure(this.context);
            this.scrollCheck();
            this.draw();
        },
    }
});

//-- Setup ---------------------------------------
// export function patternEditorShown() {
//     canvasHeightSet(DISPLAY_HEIGHT);
// }

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
