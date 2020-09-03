

//==============================================================================


//-- Dependencies --------------------------------
import Vue from './libraries/vue.esm.browser.js';
import './editor_pattern/index.js';
import {
    ACTION_SONG,
    ACTION_PLAYBACK_PLAY,
    ACTION_PLAYBACK_STOP,
    BPS_DEFAULT,
    TPB_DEFAULT,
    CHANNELS_NUMBER,
    VOLUME_MAX,
    BPS_MAX,
    TPB_MAX,
    PATTERNS_MAX,
    PATTERN_LENGTH_MAX,
} from './processor.js';
import {
    DISPLAY_HEIGHT_DEFAULT,
} from './utilities.js';
import { EVENT_OPTION_SELECT } from './controls/selector.js';
import { DISPLAY_PIXEL_WIDTH } from './editor_pattern/canvas.js';
import { EVENT_ADJUST } from './controls/adjuster.js';
import { songSave, songLoad } from './file_management/controls.js';
import {
    messageSend,
} from './worklet_interface.js';

//-- Constants -----------------------------------
const DOM_ID_CLIENT = 'client';
const TEMPLATE_EDITOR = `
    <div id=${DOM_ID_CLIENT}>
        <div id="editor" style="width:${DISPLAY_PIXEL_WIDTH}">
            <keep-alive>
                <editor-pattern
                    :pattern="patternCurrent"
                    :height="${DISPLAY_HEIGHT_DEFAULT}"
                    :instrument="instrumentCurrentIndex"
                    @cell-edit="handleCellEdit"
                />
            </keep-alive>
        </div>
        <div id="controls">
            <div class="control_group">
                <button-bar :actions="actionsFile" />
            </div>
            <div class="control_group">
                <button-bar :actions="actionsPlayback" />
            </div>
            <div class="control_group">
                <value-adjuster
                    label="Volume"
                    :value="volume"
                    :max="${VOLUME_MAX}"
                    @${EVENT_ADJUST}="volume = $event"
                />
                <value-adjuster
                    label="Beats/Sec."
                    :value="beatsPerSecond"
                    :max="${BPS_MAX}"
                    @${EVENT_ADJUST}="beatsPerSecond = $event"
                />
                <value-adjuster
                    label="Ticks/Beat"
                    :value="ticksPerBeat"
                    :max="${TPB_MAX}"
                    @${EVENT_ADJUST}="tickPerBeat = $event"
                />
            </div>
            <div class="control_group">
                <div class="control_group">
                    <button-bar :actions="actionsPattern" />
                </div>
                <!--<value-adjuster
                    label="Patterns"
                    :value="patterns.length"
                    :max="${PATTERNS_MAX}"
                    @${EVENT_ADJUST}=""
                />-->
                <option-selector
                    :value="patternCurrentIndex"
                    :height="8"
                    :options="patternNames"
                    @${EVENT_OPTION_SELECT}="handlePatternSelect"
                />
                <value-adjuster
                    label="Length"
                    :value="patternCurrent.length / ${CHANNELS_NUMBER}"
                    :min="1"
                    :max="${PATTERN_LENGTH_MAX}"
                    @${EVENT_ADJUST}="handlePatternLength"
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
                new Uint32Array(CHANNELS_NUMBER*DISPLAY_HEIGHT_DEFAULT),
            ],
            patternCurrent: null,
            instrumentCurrentIndex: 0,
            instruments: [],
        };
    },
    created() {
        this.patternCurrent = this.patterns[this.patternCurrentIndex];
    },
    computed: {
        patternNames() {
            return this.patterns.map((pattern, index) => `Pattern ${index}`);
        },
        actionsPlayback() {
            return [
                {
                    label: 'Play',
                    action: async () => {
                        await messageSend(ACTION_SONG, this.songCompile());
                        await messageSend(ACTION_PLAYBACK_PLAY, {/* Currently empty */});
                    }
                },
                {
                    label: 'Stop',
                    action: () => {
                        messageSend(ACTION_PLAYBACK_STOP, {/* Currently empty */});
                    }
                },
            ]
        },
        actionsFile() {
            return [
                {
                    label: 'Save',
                    action: () => undefined,
                },
                {
                    label: 'Load',
                    action: () => undefined,
                },
            ];
        },
        actionsPattern() {
            return [
                {
                    label: 'New P.',
                    action: () => {
                        const patternNew = new Uint32Array(CHANNELS_NUMBER*DISPLAY_HEIGHT_DEFAULT);
                        this.patterns.push(patternNew);
                        this.patternCurrent = patternNew;
                        this.patternCurrentIndex = this.patterns.length-1;
                    },
                },
                {
                    label: 'Del P.',
                    action: () => {
                        this.patterns.splice(this.patternCurrentIndex, 1);
                        if(!this.patterns.length) {
                            this.patterns.push(new Uint32Array(CHANNELS_NUMBER*DISPLAY_HEIGHT_DEFAULT));
                        }
                        if(this.patternCurrentIndex >= this.patterns.length) {
                            this.patternCurrentIndex = this.patterns.length - 1;
                        }
                        this.patternCurrent = this.patterns[this.patternCurrentIndex];
                    },
                },
            ];
        },
    },
    methods: {
        songCompile() {
            return {
                volume: this.volume,
                bps: this.beatsPerSecond,
                tpb: this.ticksPerBeat,
                patterns: this.patterns,
                instruments: this.instruments,
            };
        },
        handleCellEdit(event) {
            const compoundIndex = event.channel + (event.row * CHANNELS_NUMBER);
            const patternOld = this.patternCurrent;
            const patternNew = patternOld.slice();
            patternNew[compoundIndex] = event.value;
            this.patterns[this.patternCurrentIndex] = patternNew;
            this.patternCurrent = patternNew;
        },
        handlePatternLength(rowsNew) {
            const patternOld = this.patternCurrent;
            const rowsOld = this.patternCurrent.length / CHANNELS_NUMBER;
            if(rowsOld === rowsNew) { return;}
            let patternNew;
            if(rowsNew < rowsOld) {
                patternNew = patternOld.slice(0, rowsNew*CHANNELS_NUMBER);
            } else {
                patternNew = new Uint32Array(rowsNew*CHANNELS_NUMBER);
                for(let indexCell = 0; indexCell < patternOld.length; indexCell++) {
                    patternNew[indexCell] = patternOld[indexCell];
                }
            }
            this.patterns[this.patternCurrentIndex] = patternNew;
            this.patternCurrent = patternNew;
        },
        handlePatternSelect(indexNew) {
            if(indexNew < 0 || indexNew >= this.patterns.length) { return;}
            this.patternCurrentIndex = indexNew;
            this.patternCurrent = this.patterns[this.patternCurrentIndex];
        },
    },
});
