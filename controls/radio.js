

//==============================================================================

//-- Dependencies --------------------------------
import Vue from '../libraries/vue.esm.browser.js';
import {
    contextConfigure,
    CHAR_HEART,
    COLOR_BG,
    COLOR_FG,
    COLOR_BG_HIGHLIGHT,
    FONT_SIZE,
} from '../utilities.js';

//-- Constants -----------------------------------
export const EVENT_RADIO_SELECT = 'radio-select';
const LINE_HEIGHT = FONT_SIZE+2;

//------------------------------------------------
Vue.component('value-radio', {
    template: (`
        <canvas
            class="radio"
            @click="handleClick"
        />
    `),
    props: {
        width: {
            type: Number,
            default: 15,
        },
        options: {
            type: Array,
            required: true,
        },
        value: {
            type: Number,
            required: true,
        },
    },
    watch: {
        width: 'draw',
        options: 'draw',
        value: 'draw',
    },
    mounted() {
        //
        const canvas = this.$el;
        canvas.width = this.width*FONT_SIZE;
        canvas.height = this.options.length * LINE_HEIGHT;
        //
        this.context = canvas.getContext('2d');
        contextConfigure(this.context);
        this.draw();
    },
    methods: {
        handleClick(eventClick) {
            const clientRect = eventClick.target.getClientRects()[0];
            let posY = eventClick.clientY - clientRect.top;
            posY = Math.max(0,
                Math.min(this.options.length-1,
                    Math.floor((posY-4)/LINE_HEIGHT)));
            // const selectedOption = this.options[posY];
            this.$emit(EVENT_RADIO_SELECT, posY);
        },
        draw() {
            this.context.fillStyle = COLOR_BG;
            this.context.fillRect(0, 0, this.width*FONT_SIZE, this.options.length*LINE_HEIGHT);
            this.context.fillStyle = COLOR_FG;
            for(let indexOption = 0; indexOption < this.options.length; indexOption++) {
                this.context.fillStyle = COLOR_FG;
                const option = this.options[indexOption];
                this.context.fillText(option, FONT_SIZE*2, -2+LINE_HEIGHT*(indexOption+1));
                if(indexOption === this.value) {
                    this.context.fillStyle = COLOR_BG_HIGHLIGHT;
                    this.context.fillText(CHAR_HEART, 0, -2+LINE_HEIGHT*(indexOption+1));
                }
            }
        }
    },
});
