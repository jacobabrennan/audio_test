

//==============================================================================

//-- Dependencies --------------------------------
import Vue from '../libraries/vue.esm.browser.js';
import {
    FONT_SIZE,
    FONT_FAMILY,
    COLOR_BG,
} from '../utilities.js';

//-- Constants -----------------------------------
export const EVENT_OPTION_SELECT = 'option-select';

// <!-- Option derp is a hack to get around the lack of css option colors -->
//------------------------------------------------
Vue.component('option-selector', {
    template: (`
        <select
            class="selector"
            :size="height"
            @change="select"
            :style="style"
        >
            <option
                v-for="(label, index) in options"
                :key="index"
                :class="{ selected: index === value }"
                :value="index"
            >
                {{label}}
            </option>
        </select>
    `),
    props: {
        value: {
            type: Number,
            require: true,
        },
        height: {
            type: Number,
            required: true,
        },
        width: {
            type: Number,
            default: 15,
        },
        options: {
            type: Array,
            require: true,
        },
    },
    data: function () {
        return {
            style: {
                width: `${this.width*FONT_SIZE}px`,
                fontFamily: FONT_FAMILY,
                fontSize: FONT_SIZE+'px',
                background: COLOR_BG,
            },
        };
    },
    mounted() {
        this.$el.value = null;
    },
    methods: {
        select() {
            for(let option of this.$el.selectedOptions) {
                option.blur();
            }
            this.$el.blur();
            this.$emit(EVENT_OPTION_SELECT, parseInt(this.$el.value));
            this.$el.value = null;
        }
    }
});
