

//==============================================================================


//-- Dependencies --------------------------------
import Vue from './libraries/vue.esm.browser.js';
import './editor_pattern/index.js';
import './editor_instrument/index.js';
import AudioMessageInterface, {
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
    RESPONSE_PATTERN_ROW,
    RESPONSE_SONG_END,
} from './libraries/audio_processor.js';
import {
    DISPLAY_HEIGHT_DEFAULT,
} from './utilities.js';
import {
    EVENT_OPTION_SELECT,
    EVENT_ADJUST,
} from './base_components/index.js';
import { songSave, songLoad } from './file_management/controls.js';
import { DISPLAY_PIXEL_WIDTH } from './editor_pattern/canvas.js';
Vue.component('derp-derp', {
    render() {
        return;
    }
});
//-- Constants -----------------------------------
const TEMPLATE_EDITOR = `
    <div class="client">
        <keep-alive>
            <derp-derp />
        </keep-alive>
        <div class="editor" style="width:${DISPLAY_PIXEL_WIDTH}">
            <keep-alive>
                <editor-pattern
                    :pattern="patternCurrent"
                    :height="instrumentEditorOpen? 20 : ${DISPLAY_HEIGHT_DEFAULT}"
                    :instrument="instrumentCurrentIndex"
                    :highlight-row="highlightRow"
                    @cell-edit="handleCellEdit"
                />
            </keep-alive>
            <keep-alive v-if="instrumentEditorOpen">
                <editor-instrument :instrument="instrumentCurrent" />
            </keep-alive>
        </div>
        <div class="controls">
            <div>
                <button-bar :actions="actionsFile" />
            </div>
            <div>
                <button-bar :actions="actionsPlayback" />
            </div>
            <div>
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
                    :min="1"
                    @${EVENT_ADJUST}="beatsPerSecond = $event"
                />
                <value-adjuster
                    label="Ticks/Beat"
                    :value="ticksPerBeat"
                    :max="${TPB_MAX}"
                    :min="0"
                    @${EVENT_ADJUST}="ticksPerBeat = $event"
                />
            </div>
            <div>
                <button-bar :actions="actionsPattern" />
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
            <div>
                <button
                    :class="{ selected: instrumentEditorOpen }"
                    @click="toggleInstrumentEditor"
                >
                    Inst. Editor
                </button>
            </div>
            <div>
                <button-bar :actions="actionsInstrument" />
                <option-selector
                    :value="instrumentCurrentIndex"
                    :height="8"
                    :options="instrumentNames"
                    @${EVENT_OPTION_SELECT}="handleInstrumentSelect"
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
            highlightRow: null,
            patternCurrentIndex: 0,
            patternCurrent: null,
            patterns: [
                new Uint32Array(CHANNELS_NUMBER*DISPLAY_HEIGHT_DEFAULT),
            ],
            instrumentCurrentIndex: 0,
            instrumentCurrent: null,
            instruments: [
                {
                    sustain: undefined,
                    loopStart: 1,
                    loopEnd: 2,
                    envelopeVolume: [0.5, 0.5, 0.75],
                    envelopeDuration: [0, 10, 100],
                },
            ],
            instrumentEditorOpen: true,
        };
    },
    created() {
        this.patternCurrent = this.patterns[this.patternCurrentIndex];
        this.instrumentCurrent = this.instruments[this.instrumentCurrentIndex];
        this.processor = new AudioMessageInterface((action, data) => {
            this.handleMessageAudio(action, data);
        });
    },
    computed: {
        patternNames() {
            return this.patterns.map((pattern, index) => `Pattern ${index}`);
        },
        instrumentNames() {
            return this.instruments.map((instrument, index) => `instrument ${index}`);
        },
        actionsPlayback() {
            return [
                {
                    label: 'Play',
                    action: async () => {
                        await this.processor.messageSend(ACTION_SONG, this.songCompile());
                        await this.processor.messageSend(ACTION_PLAYBACK_PLAY, {/* Currently empty */});
                    }
                },
                {
                    label: 'Stop',
                    action: () => {
                        this.processor.messageSend(ACTION_PLAYBACK_STOP, {/* Currently empty */});
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
                        if(this.patterns.length >= PATTERNS_MAX) { return;}
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
        actionsInstrument() {
            return [
                {
                    label: 'New I.',
                    action: () => {
                        if(this.patterns.length >= PATTERNS_MAX) { return;}
                        const patternNew = new Uint32Array(CHANNELS_NUMBER*DISPLAY_HEIGHT_DEFAULT);
                        this.patterns.push(patternNew);
                        this.patternCurrent = patternNew;
                        this.patternCurrentIndex = this.patterns.length-1;
                    },
                },
                {
                    label: 'Del I.',
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
        handleInstrumentSelect(indexNew) {
            if(indexNew < 0 || indexNew >= this.instruments.length) { return;}
            this.instrumentCurrentIndex = indexNew;
            this.instrumentCurrent = this.instruments[this.instrumentCurrentIndex];
        },
        handleMessageAudio(action, data) {
            switch(action) {
                case RESPONSE_PATTERN_ROW: {
                    this.patternCurrentIndex = data.patternId;
                    this.patternCurrent = this.patterns[this.patternCurrentIndex];
                    this.highlightRow = data.row;
                    break;
                }
                case RESPONSE_SONG_END: {
                    this.highlightRow = null;
                    break;
                }
            }
        },
        toggleInstrumentEditor() {
            this.instrumentEditorOpen = !this.instrumentEditorOpen;
        },
    },
});
