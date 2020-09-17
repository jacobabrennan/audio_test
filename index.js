

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
import {
    Song,
    loadFont,
} from './utilities.js';

//------------------------------------------------
export default Vue.component('song-editor', {
    template: (`
        <div v-if="fontLoaded" class="editor">
            <!-- Space reserved for other modal views -->
            <editor-main
                :song="song"
                :highlightRow="highlightRow"
                :highlightPattern="highlightPattern"
                @play="songPlay"
                @stop="songStop"
                @save="save"
                @load="load"
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
        save() {
            //
            const songString = JSON.stringify(this.song.toJSON())
            const songData = new Blob(
                [songString],
                {type : 'application/json'},
            );
            //
            const link = document.createElement('a');
            link.download = `${this.song.name}.json`;
            link.href = URL.createObjectURL(songData);
            //
            link.click();
            //
            this.newData = false;
        },
        load() {
            //
            const reader = new FileReader();
            reader.addEventListener('loadend', () => {
                const songJSON = JSON.parse(reader.result);
                this.song = new Song(songJSON);
            })
            //
            const fileSelector = document.createElement('input');
            fileSelector.type = 'file';
            fileSelector.click();
            fileSelector.addEventListener('change', () => {
                reader.readAsText(fileSelector.files[0]);
            });
        }
    },
});
