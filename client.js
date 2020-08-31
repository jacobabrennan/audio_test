

//==============================================================================

//-- Dependencies --------------------------------
import Vue from './libraries/vue.esm.browser.js';
import './controls/adjuster.js';
import './controls/button.js';
import './pane/pane_control.js';
import './pane/pane_editor.js';
import './editor_pattern/index.js';
import {
    BPS_DEFAULT,
    TPB_DEFAULT,
    CHANNELS_NUMBER,
    VOLUME_MAX,
} from './processor.js';
import {
    contextConfigure,
    CHAR_HEART,
    DISPLAY_HEIGHT_DEFAULT,
    DOM_STYLE_DYNAMIC,
    // EDITOR_PANE_PATTERN,
    FONT_SIZE,
} from './utilities.js';
import { DISPLAY_PIXEL_WIDTH } from './editor_pattern/canvas.js';
import { EVENT_ADJUST } from './controls/adjuster.js';
// import { setup as setupEditorPattern } from './editor_pattern/index.js';
// import { setup as setupEditorInstrument } from './editor_instrument/index.js';
// import { setup as setupControls } from './pane/pane_control.js';
// import {
//     setup as setupEditor,
//     paneSelect,
// } from './pane/pane_editor.js';

//-- Constants -----------------------------------
const DOM_ID_CLIENT = 'client';

//-- Setup ---------------------------------------
export async function setup() {
    // Load custom font
    await loadFont();
    // Create DOM container
    let client = document.createElement('div');
    document.body.append(client);
    client.outerHTML = (`
        <div id=${DOM_ID_CLIENT}>
            <div id="editor" style="width:${DISPLAY_PIXEL_WIDTH}">
                <editor-pattern :pattern="patternCurrent" :height="${DISPLAY_HEIGHT_DEFAULT}">
                </editor-pattern>
            </div>
            <client-controls id="controls">
                <value-adjuster
                    label="Volume"
                    :width="15"
                    :value="volume"
                    event="test-test"
                    @${EVENT_ADJUST}="handleAdjustVolume"
                ></value-adjuster>
            </client-controls>
        </div>
    `);
    // Create Vue Instance
    new Vue({
        el: `#${DOM_ID_CLIENT}`,
        data: {
            volume: 4,
            beatsPerSecond: BPS_DEFAULT,
            ticksPer: TPB_DEFAULT,
            patternCurrentIndex: 0,
            patterns: [
                Array.from(new Uint32Array(CHANNELS_NUMBER*64)),
            ],
            instrumentCurrentIndex: 0,
            instruments: [],
        },
        computed: {
            patternCurrent() {
                return this.patterns[this.patternCurrentIndex];
            }
        },
        methods: {
            handleAdjustVolume(valueNew) {
                valueNew = Math.max(0, Math.min(VOLUME_MAX, valueNew));
                this.volume = valueNew;
            },
        },
    });
}


//== Font Load Checker =========================================================

/* This font loader is necessary due to Chrome's refusal to load fonts until
after an attempt is made to use them. This is too late for a call to the canvas
2D drawing functions. Until FontFace becomes an offical stanard, a kludge like
this will remain necessary. Switch to Firefox, where this just works. */

//-- Font Loader ---------------------------------
async function loadFont() {
    const elementStyle = document.createElement('style');
    elementStyle.innerText = DOM_STYLE_DYNAMIC;
    document.head.appendChild(elementStyle);
    const canvas = document.createElement('canvas');
    canvas.width = FONT_SIZE;
    canvas.height = FONT_SIZE;
    const context = canvas.getContext('2d');
    contextConfigure(context);
    let runningTotal = 0;
    const timeoutFont = 1000; // Give chrome a second to attempt to load the font.
    return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            const success = checkFontStatus(context);
            if(success) {
                clearInterval(interval);
                resolve();
            }
            runningTotal += 10;
            if(runningTotal > timeoutFont) {
                clearInterval(interval);
                reject();
            }
        }, 10);
    });
}
function checkFontStatus(context) {
    context.fillStyle = '#000';
    context.fillRect(0,0,FONT_SIZE,FONT_SIZE);
    context.fillStyle = '#f00';
    context.fillText(CHAR_HEART, 0, FONT_SIZE);
    const imageData = context.getImageData(0,0,FONT_SIZE,FONT_SIZE).data;
    const posY = 8;
    const colorChannels = 4;
    let success = true;
    for(let posX = 4; posX < FONT_SIZE-4; posX++) {
        const indexRedChannel = ((posY*FONT_SIZE)+posX)*colorChannels;
        const valueRed = imageData[indexRedChannel];
        if(valueRed === 255) { continue;}
        success = false;
    }
    return success;
}
