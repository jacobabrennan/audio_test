

//==============================================================================

//-- Dependencies --------------------------------
import {
    CHANNELS_NUMBER,
    VOLUME_MAX,
    BPS_MAX,
    TPB_MAX,
    PATTERNS_MAX,
    MASK_CELL_INSTRUMENT_WIDTH,
} from '/libraries/apu.single.js';
import Vue from '/libraries/vue.esm.browser.js';
import './editor_pattern/index.js';
import './editor_instrument/index.js';
import {
    Pattern,
    Instrument,
    DISPLAY_HEIGHT_DEFAULT,
} from './utilities.js';
import {
    EVENT_OPTION_SELECT,
    EVENT_ADJUST,
} from './base_components/index.js';
import { DISPLAY_PIXEL_WIDTH } from './editor_pattern/canvas.js';

//------------------------------------------------
export default Vue.component('editor-main', {
    template: (`
        <div class="view-main">
            <div class="main-panel" style="width:${DISPLAY_PIXEL_WIDTH}">
                <keep-alive>
                    <editor-pattern
                        :pattern="patternCurrent"
                        :height="instrumentEditorOpen? 18 : ${DISPLAY_HEIGHT_DEFAULT}"
                        :instrument="instrumentCurrentIndex"
                        :highlight-row="highlightRow"
                        @cell-edit="handleCellEdit"
                        @new="handlePatternNew"
                        @delete="handlePatternDelete"
                        @adjustlength="handlePatternLength"
                    />
                </keep-alive>
                <keep-alive v-if="instrumentEditorOpen">
                    <editor-instrument
                        :instrument="instrumentCurrent"
                        @new="handleInstrumentNew"
                        @delete="handleInstrumentDelete"
                    />
                </keep-alive>
            </div>
            <div class="controls">
                <div class="button_bar">
                    <button @click="$emit('save')">{{newData? 'Save*' : 'Save'}}</button>
                    <button @click="$router.push('/')">Close</button>
                </div>
                <div class="button_bar">
                    <button @click="$emit('play')">Play</button>
                    <button @click="$emit('stop')">Stop</button>
                </div>
                <div class="control_group">
                    <value-adjuster
                        label="Volume"
                        :value="song.volume"
                        :max="${VOLUME_MAX}"
                        @${EVENT_ADJUST}="song.volume = $event"
                    />
                    <value-adjuster
                        label="Beats/Sec."
                        :value="song.beatsPerSecond"
                        :max="${BPS_MAX}"
                        :min="1"
                        @${EVENT_ADJUST}="song.beatsPerSecond = $event"
                    />
                    <value-adjuster
                        label="Ticks/Beat"
                        :value="song.ticksPerBeat"
                        :max="${TPB_MAX}"
                        :min="0"
                        @${EVENT_ADJUST}="song.ticksPerBeat = $event"
                    />
                </div>
                <option-selector
                    :value="patternCurrentIndex"
                    :height="8"
                    :options="patternNames"
                    @${EVENT_OPTION_SELECT}="handlePatternSelect"
                />
                <button
                    :class="{ selected: instrumentEditorOpen }"
                    @click="toggleInstrumentEditor"
                >
                    Inst. Editor
                </button>
                <option-selector
                    :value="instrumentCurrentIndex"
                    :height="8"
                    :options="instrumentNames"
                    @${EVENT_OPTION_SELECT}="handleInstrumentSelect"
                />
            </div>
        </div>
    `),
    data: function () {
        return {
            patternCurrentIndex: 0,
            patternCurrent: null,
            instrumentCurrentIndex: 0,
            instrumentCurrent: null,
            instrumentEditorOpen: true,
            newData: false,
        };
    },
    props: {
        song: {
            type: Object,
            require: true,
        },
        highlightRow: Number,
        highlightPattern: Number,
    },
    created() {
        this.patternCurrent = this.song.patterns[this.patternCurrentIndex];
        this.instrumentCurrent = this.song.instruments[this.instrumentCurrentIndex];
    },
    computed: {
        patternNames() {
            return this.song.patterns.map((pattern, index) => {
                if(!pattern.name) {
                    return `Pattern ${index}`;
                }
                return pattern.name;
            });
        },
        instrumentNames() {
            return this.song.instruments.map((instrument, index) => {
                if(!instrument.name) {
                    return `Instrument ${index}`;
                }
                return instrument.name;
            });
        },
    },
    methods: {
        // Use splice when dealing with patterns, to ensure Vue watchers fire
        handleHighlightRow(rowNew) {
            this.highlightRow = rowNew;
        },
        handleHighlightPattern(patternNew) {
            if(!Number.isFinite(patternNew)) { return;}
            this.patternCurrentIndex = patternNew;
            console.log(patternNew)
            this.patternCurrent = this.song.patterns[this.patternCurrentIndex];
        },
        handleCellEdit(event) {
            const compoundIndex = event.channel + (event.row * CHANNELS_NUMBER);
            const patternOld = this.patternCurrent;
            const patternNew = new Pattern();
            patternNew.name = patternOld.name;
            patternNew.data = patternOld.data.slice();
            patternNew.data[compoundIndex] = event.value;
            this.song.patterns.splice(this.patternCurrentIndex, 1, patternNew);
            this.patternCurrent = patternNew;
        },
        handlePatternLength(rowsNew) {
            const patternOld = this.patternCurrent;
            const rowsOld = this.patternCurrent.data.length / CHANNELS_NUMBER;
            if(rowsOld === rowsNew) { return;}
            const patternNew = new Pattern();
            patternNew.name = patternOld.name;
            if(rowsNew < rowsOld) {
                patternNew.data = patternOld.data.slice(0, rowsNew*CHANNELS_NUMBER);
            } else {
                patternNew.data = new Uint32Array(rowsNew*CHANNELS_NUMBER);
                for(let indexCell = 0; indexCell < patternOld.data.length; indexCell++) {
                    patternNew.data[indexCell] = patternOld.data[indexCell];
                }
            }
            this.song.patterns.splice(this.patternCurrentIndex, 1, patternNew);
            this.patternCurrent = patternNew;
        },
        handlePatternSelect(indexNew) {
            if(indexNew < 0 || indexNew >= this.song.patterns.length) { return;}
            this.patternCurrentIndex = indexNew;
            this.patternCurrent = this.song.patterns[this.patternCurrentIndex];
        },
        handlePatternNew() {
            if(this.song.patterns.length >= PATTERNS_MAX) { return;}
            const patternNew = new Pattern();
            this.song.patterns.push(patternNew);
            this.patternCurrent = patternNew;
            this.patternCurrentIndex = this.song.patterns.length-1;
        },
        handlePatternDelete() {
            this.song.patterns.splice(this.patternCurrentIndex, 1);
            if(!this.song.patterns.length) {
                this.song.patterns.push(new Pattern());
            }
            if(this.patternCurrentIndex >= this.song.patterns.length) {
                this.patternCurrentIndex = this.song.patterns.length - 1;
            }
            this.patternCurrent = this.song.patterns[this.patternCurrentIndex];
        },
        handleInstrumentSelect(indexNew) {
            if(indexNew < 0 || indexNew >= this.song.instruments.length) { return;}
            this.instrumentCurrentIndex = indexNew;
            this.instrumentCurrent = this.song.instruments[this.instrumentCurrentIndex];
        },
        handleInstrumentNew() {
            const instrumentsMax = Math.pow(2, MASK_CELL_INSTRUMENT_WIDTH);
            if(this.song.instruments.length >= instrumentsMax) { return;}
            const instrumentNew = new Instrument();
            this.song.instruments.push(instrumentNew);
            this.instrumentCurrent = instrumentNew;
            this.instrumentCurrentIndex = this.song.instruments.length-1;
        },
        handleInstrumentDelete() {
            this.song.instruments.splice(this.instrumentCurrentIndex, 1);
            if(!this.song.instruments.length) {
                this.song.instruments.push(new Instrument());
            }
            if(this.instrumentCurrentIndex >= this.song.instruments.length) {
                this.instrumentCurrentIndex = this.song.instruments.length - 1;
            }
            this.instrumentCurrent = this.song.instruments[this.instrumentCurrentIndex];
        },
        toggleInstrumentEditor() {
            this.instrumentEditorOpen = !this.instrumentEditorOpen;
        },
        notifySave() {
            this.newData = true;
        },
        save() {
            this.newData = false;
        },
    },
    watch: {
        song: {
            deep: true,
            handler: 'notifySave',
        },
        highlightRow: 'handleHighlightRow',
        highlightPattern: 'handleHighlightPattern',
    },
});
