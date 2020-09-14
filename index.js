

//==============================================================================

//-- Dependencies --------------------------------
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
    RESPONSE_PATTERN_ROW,
    RESPONSE_SONG_END,
    MASK_CELL_INSTRUMENT_WIDTH,
} from '/libraries/apu.single.js';
import Vue from '/libraries/vue.esm.browser.js';
import loadFont from './font_loader.js';
import './editor_pattern/index.js';
import './editor_instrument/index.js';
import {
    DISPLAY_HEIGHT_DEFAULT,
} from './utilities.js';
import {
    EVENT_OPTION_SELECT,
    EVENT_ADJUST,
} from './base_components/index.js';
import { songSave, songLoad } from './file_management/controls.js';
import { DISPLAY_PIXEL_WIDTH } from './editor_pattern/canvas.js';

//-- Constants -----------------------------------
const TEMPLATE_EDITOR = `
    <div v-if="fontLoaded" class="editor">
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
                <button @click="save">{{newData? 'Save*' : 'Save'}}</button>
                <button @click="$router.push('/')">Close</button>
            </div>
            <div class="button_bar">
                <button @click="songPlay">Play</button>
                <button @click="songStop">Stop</button>
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
`;

//------------------------------------------------
export default Vue.component('song-editor', {
    template: TEMPLATE_EDITOR,
    data: function () {
        return {
            fontLoaded: false,
            volume: 4,
            beatsPerSecond: BPS_DEFAULT,
            ticksPerBeat: TPB_DEFAULT,
            highlightRow: null,
            patternCurrentIndex: 0,
            patternCurrent: null,
            patterns: [
                createBlankPattern(),
            ],
            instrumentCurrentIndex: 0,
            instrumentCurrent: null,
            instruments: [createBlankInstrument()],
            instrumentEditorOpen: true,
            newData: false,
        };
    },
    props: {
        apu: {
            type: String,
            required: true,
        },
    },
    created() {
        this.patternCurrent = this.patterns[this.patternCurrentIndex];
        this.instrumentCurrent = this.instruments[this.instrumentCurrentIndex];
        this.processor = new AudioMessageInterface((action, data) => {
            this.handleMessageAudio(action, data);
        }, this.apu);
        loadFont().then(
            () => this.fontLoaded = true
        );
    },
    computed: {
        patternNames() {
            return this.patterns.map((pattern, index) => {
                if(!pattern.name) {
                    return `Pattern ${index}`;
                }
                return pattern.name;
            });
        },
        instrumentNames() {
            return this.instruments.map((instrument, index) => {
                if(!instrument.name) {
                    return `Instrument ${index}`;
                }
                return instrument.name;
            });
        },
    },
    methods: {
        // Use splice when dealing with patterns, to ensure Vue watchers fire
        songCompile() {
            return {
                volume: this.volume,
                bps: this.beatsPerSecond,
                tpb: this.ticksPerBeat,
                patterns: this.patterns.map(pattern => pattern.data),
                instruments: this.instruments,
            };
        },
        handleCellEdit(event) {
            const compoundIndex = event.channel + (event.row * CHANNELS_NUMBER);
            const patternOld = this.patternCurrent;
            const patternNew = {
                name: patternOld.name,
                data: patternOld.data.slice(),
            };
            patternNew.data[compoundIndex] = event.value;
            this.patterns.splice(this.patternCurrentIndex, 1, patternNew);
            this.patternCurrent = patternNew;
        },
        handlePatternLength(rowsNew) {
            const patternOld = this.patternCurrent;
            const rowsOld = this.patternCurrent.data.length / CHANNELS_NUMBER;
            if(rowsOld === rowsNew) { return;}
            let patternNew = {
                name: patternOld.name,
            };
            if(rowsNew < rowsOld) {
                patternNew.data = patternOld.data.slice(0, rowsNew*CHANNELS_NUMBER);
            } else {
                patternNew.data = new Uint32Array(rowsNew*CHANNELS_NUMBER);
                for(let indexCell = 0; indexCell < patternOld.data.length; indexCell++) {
                    patternNew.data[indexCell] = patternOld.data[indexCell];
                }
            }
            this.patterns.splice(this.patternCurrentIndex, 1, patternNew);
            this.patternCurrent = patternNew;
        },
        handlePatternSelect(indexNew) {
            if(indexNew < 0 || indexNew >= this.patterns.length) { return;}
            this.patternCurrentIndex = indexNew;
            this.patternCurrent = this.patterns[this.patternCurrentIndex];
        },
        handlePatternNew() {
            if(this.patterns.length >= PATTERNS_MAX) { return;}
            const patternNew = createBlankPattern();
            this.patterns.push(patternNew);
            this.patternCurrent = patternNew;
            this.patternCurrentIndex = this.patterns.length-1;
        },
        handlePatternDelete() {
            this.patterns.splice(this.patternCurrentIndex, 1);
            if(!this.patterns.length) {
                this.patterns.push(createBlankPattern());
            }
            if(this.patternCurrentIndex >= this.patterns.length) {
                this.patternCurrentIndex = this.patterns.length - 1;
            }
            this.patternCurrent = this.patterns[this.patternCurrentIndex];
        },
        handleInstrumentSelect(indexNew) {
            if(indexNew < 0 || indexNew >= this.instruments.length) { return;}
            this.instrumentCurrentIndex = indexNew;
            this.instrumentCurrent = this.instruments[this.instrumentCurrentIndex];
        },
        handleInstrumentNew() {
            const instrumentsMax = Math.pow(2, MASK_CELL_INSTRUMENT_WIDTH);
            if(this.instruments.length >= instrumentsMax) { return;}
            const instrumentNew = createBlankInstrument();
            this.instruments.push(instrumentNew);
            this.instrumentCurrent = instrumentNew;
            this.instrumentCurrentIndex = this.instruments.length-1;
        },
        handleInstrumentDelete() {
            this.instruments.splice(this.instrumentCurrentIndex, 1);
            if(!this.instruments.length) {
                this.instruments.push(createBlankInstrument());
            }
            if(this.instrumentCurrentIndex >= this.instruments.length) {
                this.instrumentCurrentIndex = this.instruments.length - 1;
            }
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
        notifySave() {
            this.newData = true;
        },
        save() {
            this.newData = false;
        },
        async songPlay() {
            await this.processor.messageSend(ACTION_SONG, this.songCompile());
            await this.processor.messageSend(ACTION_PLAYBACK_PLAY, {/* Currently empty */});
        },
        async songStop() {
            await this.processor.messageSend(ACTION_PLAYBACK_STOP, {/* Currently empty */});
            
        },
    },
    watch: {
        volume: 'notifySave',
        beatsPerSecond: 'notifySave',
        ticksPerBeat: 'notifySave',
        patterns: {
            deep: true,
            handler: 'notifySave',
        },
        instruments: {
            deep: true,
            handler: 'notifySave',
        },
    },
});

//-- Utilities -----------------------------------
function createBlankPattern() {
    return {
        name: 'New Pattern',
        data: new Uint32Array(CHANNELS_NUMBER*32),
    };
}
function createBlankInstrument() {
    return {
        name: "New Instrument",
        sustain: 0,
        loopStart: undefined,
        loopEnd: undefined,
        envelopeVolume: [0.5],
        envelopeDuration: [0],
    };
}
