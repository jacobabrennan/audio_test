

//==============================================================================

//-- Dependencies --------------------------------
import Vue from '../libraries/vue.esm.browser.js';
import './canvas.js';
import { EVENT_RADIO_SELECT } from '../controls/radio.js';
import { EVENT_ADJUST } from '../controls/adjuster.js';
// import { setup as setupCanvas, instrumentDraw } from './canvas.js';
// import { setup as setupControlStrip } from './control_strip.js';

//-- Constants -----------------------------------
const SUSTAIN_ON = 0;
const SUSTAIN_LOOP = 1;
const SUSTAIN_OFF = 2;

//------------------------------------------------
Vue.component('editor-instrument', {
    template: (`
        <div class="instrument_editor">
            <div class="instrument_controls">
                <value-radio
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
                        @${EVENT_ADJUST}=""
                    />
                    <value-adjuster
                        v-if="Number.isFinite(instrument.sustain)"
                        label="Sustain"
                        :value="instrument.sustain"
                        :max="instrument.envelopeVolume.length-1"
                        :width="12"
                        @${EVENT_ADJUST}=""
                    />
                    <value-adjuster
                        v-if="Number.isFinite(instrument.loopStart)"
                        label="L.Start"
                        :value="instrument.loopStart"
                        :max="instrument.envelopeVolume.length-1"
                        :width="12"
                        @${EVENT_ADJUST}=""
                    />
                    <value-adjuster
                        v-if="Number.isFinite(instrument.loopEnd)"
                        label="L.End"
                        :value="instrument.loopEnd"
                        :max="instrument.envelopeVolume.length-1"
                        :width="12"
                        @${EVENT_ADJUST}=""
                    />
                </div>
            </div>
            <editor-envelope :instrument="instrument" />
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
            sustype: SUSTAIN_ON,
        };
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
        }
    },
});
