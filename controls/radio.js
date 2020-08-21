

//==============================================================================

//-- Dependencies --------------------------------
import {
    contextConfigure,
    FONT_SIZE,
    COLOR_BG,
    COLOR_FG,
    COLOR_BG_HIGHLIGHT,
    COLOR_FG_HIGHLIGHT
} from '../utilities.js';

//-- Constants -----------------------------------
const LINE_HEIGHT = FONT_SIZE+2;

//------------------------------------------------
export default class Radio {
    constructor(elementParent, width, options, onChange) {
        this.element = document.createElement('canvas');
        this.element.className = 'radio';
        elementParent.append(this.element);
        //
        this.onChange = onChange;
        this.element.addEventListener(
            'click',
            (eventClick) => this.handleClick(eventClick),
        );
        //
        this.options = options;
        this.value = options[0];
        //
        this.width = width;
        this.height = options.length;
        this.element.width = this.width * FONT_SIZE;
        this.element.height = this.height * LINE_HEIGHT;
        //
        this.context = this.element.getContext('2d');
        contextConfigure(this.context);
    }
    valueSet(valueNew, override) {
        if(override) {
            this.value = valueNew;
            this.draw();
            return;
        }
        this.value = this.onChange(valueNew);
    }
    draw() {
        this.context.fillStyle = COLOR_BG;
        this.context.fillRect(0, 0, this.width*FONT_SIZE, this.height*LINE_HEIGHT);
        this.context.fillStyle = COLOR_FG;
        for(let indexOption = 0; indexOption < this.options.length; indexOption++) {
            this.context.fillStyle = COLOR_FG;
            const option = this.options[indexOption];
            this.context.fillText(option, FONT_SIZE*2, -2+LINE_HEIGHT*(indexOption+1));
            if(option === this.value) {
                this.context.fillStyle = COLOR_BG_HIGHLIGHT;
                this.context.fillText('Œ-', 0, -2+LINE_HEIGHT*(indexOption+1));
                // The character "Œ" is a heart in the "presst start k" font
            }
        }
    }
    handleClick(eventClick) {
        const clientRect = eventClick.target.getClientRects()[0];
        let posY = eventClick.clientY - clientRect.top;
        posY = Math.max(0, Math.min(this.options.length, Math.floor(posY/LINE_HEIGHT)));
        const selectedOption = this.options[posY];
        this.valueSet(selectedOption);
        this.draw();
    }
}
