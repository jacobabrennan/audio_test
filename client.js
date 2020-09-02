

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
    DISPLAY_HEIGHT_DEFAULT,
} from './utilities.js';
import { DISPLAY_PIXEL_WIDTH } from './editor_pattern/canvas.js';
import { EVENT_ADJUST } from './controls/adjuster.js';

//-- Constants -----------------------------------
const DOM_ID_CLIENT = 'client';

//------------------------------------------------
Vue.component('song-editor', {
    template: `
        <div id=${DOM_ID_CLIENT}>
            <div id="editor" style="width:${DISPLAY_PIXEL_WIDTH}">
                <editor-pattern
                    :pattern="patternCurrent"
                    :height="${DISPLAY_HEIGHT_DEFAULT}"
                />
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
    `,
    data: function () {
        return {
            volume: 4,
            beatsPerSecond: BPS_DEFAULT,
            ticksPer: TPB_DEFAULT,
            patternCurrentIndex: 0,
            patterns: [
                Array.from(new Uint32Array(CHANNELS_NUMBER*64)),
            ],
            instrumentCurrentIndex: 0,
            instruments: [],
        };
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
