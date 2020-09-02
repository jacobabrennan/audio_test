

//==============================================================================


//-- Dependencies --------------------------------
import Vue from './libraries/vue.esm.browser.js';
// import './pane/pane_control.js';
// import './pane/pane_editor.js';
import './editor_pattern/index.js';
import {
    BPS_DEFAULT,
    TPB_DEFAULT,
    CHANNELS_NUMBER,
    VOLUME_MAX,
    BPS_MAX,
    TPB_MAX,
} from './processor.js';
import {
    DISPLAY_HEIGHT_DEFAULT,
} from './utilities.js';
import { DISPLAY_PIXEL_WIDTH } from './editor_pattern/canvas.js';
import { EVENT_ADJUST } from './controls/adjuster.js';
import { songSave, songLoad } from './file_management/controls.js';

//-- Constants -----------------------------------
const DOM_ID_CLIENT = 'client';
const ACTIONS_FILE_MANAGEMENT = [
    {
        label: 'Save',
        action: songSave
    },
    {
        label: 'Load',
        action: songLoad,
    },
];
const TEMPLATE_EDITOR = `
<div id=${DOM_ID_CLIENT}>
    <div id="editor" style="width:${DISPLAY_PIXEL_WIDTH}">
        <editor-pattern
            :pattern="patternCurrent"
            :height="${DISPLAY_HEIGHT_DEFAULT}"
        />
    </div>
    <div id="controls">
        <div class="control_group">
            <button-bar :actions="actionsFile" />
        </div>
        <div class="control_group">
            <value-adjuster
                label="Volume"
                :width="15"
                :value="volume"
                @${EVENT_ADJUST}="handleAdjustVolume"
            />
            <value-adjuster
                label="Beats/Sec"
                :width="15"
                :value="beatsPerSecond"
                @${EVENT_ADJUST}="handleAdjustBPS"
            />
            <value-adjuster
                label="Ticks/Beat"
                :width="15"
                :value="ticksPerBeat"
                @${EVENT_ADJUST}="handleAdjustTPB"
            />
        </div>
    </div>
</div>
`;

//------------------------------------------------
Vue.component('song-editor', {
    template: TEMPLATE_EDITOR,
    data: function () {
        return {
            volume: 4,
            beatsPerSecond: BPS_DEFAULT,
            ticksPerBeat: TPB_DEFAULT,
            patternCurrentIndex: 0,
            patterns: [
                Array.from(new Uint32Array(CHANNELS_NUMBER*64)),
            ],
            instrumentCurrentIndex: 0,
            instruments: [],
            actionsFile: ACTIONS_FILE_MANAGEMENT,
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
        handleAdjustBPS(valueNew) {
            valueNew = Math.max(0, Math.min(BPS_MAX, valueNew));
            this.beatsPerSecond = valueNew;
        },
        handleAdjustTPB(valueNew) {
            valueNew = Math.max(0, Math.min(TPB_MAX, valueNew));
            this.ticksPerBeat = valueNew;
        },
    },
});
