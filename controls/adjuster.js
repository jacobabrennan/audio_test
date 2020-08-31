

//==============================================================================

//-- Dependencies --------------------------------
import Vue from '../libraries/vue.esm.browser.js';
import {
    contextConfigure,
    FONT_SIZE,
    COLOR_BG,
    COLOR_FG,
    COLOR_BG_HIGHLIGHT,
    COLOR_FG_HIGHLIGHT
} from '../utilities.js';

//-- Constants -----------------------------------
export const EVENT_ADJUST = 'adjust';

//------------------------------------------------
Vue.component('value-adjuster', {
    template: `<canvas
        class="adjuster"
        @blur="handleBlur"
        @focus="handleFocus"
        @click="handleClick"
    />`,
    props: {
        label: {
            type: String,
            required: true,
        },
        width: {
            type: Number,
            required: true,
        },
        value: {
            type: Number,
            require: true,
        },
    },
    data: function() {
        return {
            focus: false,
        };
    },
    mounted() {
        this.$el.width = this.width*FONT_SIZE;
        this.$el.height = FONT_SIZE;
        this.context = this.$el.getContext('2d');
        contextConfigure(this.context);
        this.draw();
    },
    methods: {
        valueChange(valueNew) {
            this.$emit(EVENT_ADJUST, valueNew);
        },
        handleClick(eventClick) {
            const clientRect = eventClick.target.getClientRects()[0];
            let posX = eventClick.clientX - clientRect.left;
            posX = Math.floor(posX/FONT_SIZE);
            if(posX === this.width-1) {
                this.valueChange(this.value+1);
            } else if(posX === this.width-2) {
                this.valueChange(this.value-1);
            }
        },
        handleBlur() {
            this.focus = false;
        },
        handleFocus() {
            this.focus = true;
        },
        draw() {
            this.context.fillStyle = COLOR_BG;
            this.context.fillRect(0, 0, this.width*FONT_SIZE, FONT_SIZE);
            this.context.fillStyle = COLOR_FG;
            this.context.fillText(this.label, 0, FONT_SIZE);
            this.context.fillText('-', (this.width-2)*FONT_SIZE, FONT_SIZE);
            this.context.fillText('+', (this.width-1)*FONT_SIZE, FONT_SIZE);
            const valueWidth = this.value.toString().length;
            const valueOffset = (this.width-2)-valueWidth;
            if(this.focus) {
                this.context.fillStyle = COLOR_BG_HIGHLIGHT;
                this.context.fillRect(valueOffset*FONT_SIZE, 0, valueWidth*FONT_SIZE, FONT_SIZE);
                this.context.fillStyle = COLOR_FG_HIGHLIGHT;
            }
            this.context.fillText(this.value, valueOffset*FONT_SIZE, FONT_SIZE);
        }
    },
    watch: {
        value: 'draw',
        focus: 'draw',
        label: 'draw',
        width: function (valueNew) {
            this.context.canvas.width = valueNew*FONT_SIZE;
            contextConfigure(this.context);
            this.draw();
        },
    }
});
