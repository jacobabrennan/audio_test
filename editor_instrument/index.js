

//==============================================================================

//-- Dependencies --------------------------------
import Vue from '/libraries/vue.esm.browser.js';
import {
    EVENT_RADIO_SELECT,
    EVENT_ADJUST,
} from '../base_components/index.js';
import { EVENT_UPDATE_ENVELOPES } from './canvas.js';

//-- Constants -----------------------------------
const SUSTAIN_ON = 0;
const SUSTAIN_LOOP = 1;
const SUSTAIN_OFF = 2;

//------------------------------------------------
Vue.component('editor-instrument', {
    template: (`
        <div class="instrument_editor">
            <div class="controls_bar">
                <div class="manager">
                    <div class="manager_buttons">
                        <button @click="$emit('new')">New</button>
                        <button @click="$emit('delete')">Del</button>
                    </div>
                    <input
                        type="text"
                        maxlength="14"
                        :value="instrument.name"
                        @change="handleInstrumentName"
                    />
                </div>
                <radio-selector
                    :options="['Sustain', 'Loop', 'No Sustain']"
                    :value="sustype"
                    :width="12"
                    @${EVENT_RADIO_SELECT}="handleSustype"
                />
                <div class="adjuster_group">
                    <value-adjuster
                        label="Nodes"
                        :value="instrument.envelopeVolume.length"
                        :max="16"
                        :min="1"
                        :width="12"
                        @${EVENT_ADJUST}="handleSetNodeCount"
                    />
                    <value-adjuster
                        v-if="Number.isFinite(instrument.sustain)"
                        label="Sustain"
                        :value="instrument.sustain"
                        :max="instrument.envelopeVolume.length-1"
                        :width="12"
                        @${EVENT_ADJUST}="handleSetSustain"
                    />
                    <value-adjuster
                        v-if="Number.isFinite(instrument.loopStart)"
                        label="L.Start"
                        :value="instrument.loopStart"
                        :max="instrument.envelopeVolume.length-1"
                        :width="12"
                        @${EVENT_ADJUST}="handleSetLoopStart"
                    />
                    <value-adjuster
                        v-if="Number.isFinite(instrument.loopEnd)"
                        label="L.End"
                        :value="instrument.loopEnd"
                        :max="instrument.envelopeVolume.length-1"
                        :width="12"
                        @${EVENT_ADJUST}="handleSetLoopEnd"
                    />
                </div>
            </div>
            <editor-envelope
                :instrument="instrument"
                @${EVENT_UPDATE_ENVELOPES}="handleUpdateEnvelopes"
            />
        </div>
    `),
    props: {
        instrument: {
            type: Object,
            required: true,
        },
    },
    data: function () {
        return {
            sustype: SUSTAIN_OFF,
        };
    },
    created() {
        if(this.instrument.sustain !== undefined) {
            this.sustype = SUSTAIN_ON;
        }
        else if(this.instrument.loopStart !== undefined) {
            this.sustype = SUSTAIN_LOOP;
        }
        else {
            this.sustype = SUSTAIN_OFF;
        }
    },
    methods: {
        handleSustype(sustype) {
            this.sustype = sustype;
            switch(sustype) {
                case SUSTAIN_ON:
                    if(this.instrument.sustain) { return;}
                    this.instrument.sustain = 0;
                    this.instrument.loopStart = undefined;
                    this.instrument.loopEnd = undefined;
                    break;
                case SUSTAIN_OFF:
                    if(!Number.isFinite(this.instrument.sustain) && !Number.isFinite(this.instrument.loopStart)) {
                        return;
                    }
                    this.instrument.sustain = undefined
                    this.instrument.loopStart = undefined
                    this.instrument.loopEnd = undefined
                    break;
                case SUSTAIN_LOOP:
                    if(Number.isFinite(this.instrument.loopStart)) { return;}
                    this.instrument.loopStart = 0;
                    this.instrument.loopEnd = 0;
                    this.instrument.sustain = undefined;
                    break;
            }
        },
        handleUpdateEnvelopes(envelopes) {
            this.instrument.envelopeDuration = envelopes.duration;
            this.instrument.envelopeVolume = envelopes.volume;
        },
        handleSetNodeCount(nodeCount) {
            const delta = nodeCount - this.instrument.envelopeVolume.length;
            if(delta < 0) {
                this.instrument.envelopeVolume.splice(delta);
                this.instrument.envelopeDuration.splice(delta);
                return;
            }
            while(this.instrument.envelopeVolume.length < nodeCount) {
                this.instrument.envelopeVolume.push(0.5);
                this.instrument.envelopeDuration.push(1024);
            }
        },
        handleSetSustain(indexSustain) {
            this.instrument.sustain = indexSustain;
        },
        handleSetLoopStart(indexStart) {
            this.instrument.loopStart = indexStart;
            this.instrument.loopEnd = Math.max(this.instrument.loopEnd, indexStart);
        },
        handleSetLoopEnd(indexEnd) {
            this.instrument.loopEnd = indexEnd;
            this.instrument.loopStart = Math.min(this.instrument.loopStart, indexEnd);
        },
        handleInstrumentName(eventChange) {
            const valueNew = eventChange.target.value;
            this.instrument.name = valueNew;
        }
    },
});
