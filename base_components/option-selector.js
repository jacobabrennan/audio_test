

//==============================================================================
/*
    There are various kludgy solutions in this component, designed to get around
    default behavior in the <select> element that can't currently be overridden
    via CSS. The currently selected <option> will always display with system
    defined colors. In order to display custom colors, the option is deselected
    and blurred after selection; value management and styles are handled
    manually. This has the side effect of scrolling the <select> to y=0. For
    this reason, scrolling after selection is also handled manually.
*/

//-- Dependencies --------------------------------
import Vue from '/libraries/vue.esm.browser.js';
import {
    FONT_SIZE,
    FONT_FAMILY,
    COLOR_BG,
} from '../utilities.js';

//-- Constants -----------------------------------
export const EVENT_OPTION_SELECT = 'option-select';

//------------------------------------------------
Vue.component('option-selector', {
    template: (`
        <select
            class="option-selector"
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
        this.scrollTopOld = this.$el.scrollTop;
    },
    updated() {
        const heightLine = this.$el.clientHeight / this.height;
        const scrollPosSelected = this.value * heightLine;
        if(this.$el.scrollTop > scrollPosSelected) {
            this.$el.scrollTo(0, scrollPosSelected);
        }
        else if(this.$el.scrollTop+this.$el.clientHeight < (this.value+1)*heightLine) {
            this.$el.scrollTo(0, (scrollPosSelected-this.$el.clientHeight)+heightLine);
        }
    },
    methods: {
        select() {
            const scrollTopOld = this.$el.scrollTop;
            for(let option of this.$el.selectedOptions) {
                option.blur();
            }
            this.$el.blur();
            const value = this.$el.value;
            this.$el.value = null;
            this.$emit(EVENT_OPTION_SELECT, parseInt(value));
            this.$el.scrollTop = scrollTopOld;
        }
    },
});
