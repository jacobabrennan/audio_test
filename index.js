

//==============================================================================

//-- Dependencies --------------------------------
import AudioMessageInterface, {
    ACTION_SONG,
    ACTION_PLAYBACK_PLAY,
    ACTION_PLAYBACK_STOP,
    RESPONSE_PATTERN_ROW,
    RESPONSE_SONG_END,
} from '/libraries/apu.single.js';
import Vue from '/libraries/vue.esm.browser.js';
import './view-main.js';
import './view-save-modal.js';
import {
    Song,
    loadFont,
} from './utilities.js';
import { songSave, songLoad } from './file_management/controls.js';

//------------------------------------------------
export default Vue.component('song-editor', {
    template: (`
        <div v-if="fontLoaded" class="editor">
            <view-save-modal
                v-if="saveModalOpen"
                :song="song"
                @cancel="saveModalOpen = false"
            />
            <editor-main v-else
                :song="song"
                :highlightRow="highlightRow"
                :highlightPattern="highlightPattern"
                @play="songPlay"
                @stop="songStop"
                @save="saveModalOpen = true"
            />
        </div>
    `),
    data: function () {
        return {
            fontLoaded: false,
            song: new Song(),
            saveModalOpen: false,
            highlightRow: null,
            highlightPattern: null,
        };
    },
    props: {
        apu: {
            type: String,
            required: true,
        },
    },
    created() {
        this.processor = new AudioMessageInterface((action, data) => {
            this.handleMessageAudio(action, data);
        }, this.apu);
        loadFont().then(
            () => this.fontLoaded = true
        );
    },
    methods: {
        // Use splice when dealing with patterns, to ensure Vue watchers fire
        songCompile() {
            return {
                volume: this.song.volume,
                bps: this.song.beatsPerSecond,
                tpb: this.song.ticksPerBeat,
                patterns: this.song.patterns.map(pattern => pattern.data),
                instruments: this.song.instruments,
            };
        },
        handleMessageAudio(action, data) {
            switch(action) {
                case RESPONSE_PATTERN_ROW: {
                    this.highlightPattern = data.patternId;
                    this.highlightRow = data.row;
                    break;
                }
                case RESPONSE_SONG_END: {
                    this.highlightPattern = null;
                    this.highlightRow = null;
                    break;
                }
            }
        },
        async songPlay() {
            await this.processor.messageSend(ACTION_SONG, this.songCompile());
            await this.processor.messageSend(ACTION_PLAYBACK_PLAY, {/* Currently empty */});
        },
        async songStop() {
            await this.processor.messageSend(ACTION_PLAYBACK_STOP, {/* Currently empty */});
        },
    },
});
