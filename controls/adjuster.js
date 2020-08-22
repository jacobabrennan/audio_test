

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

//------------------------------------------------
export default class Adjuster {
    value = 0
    focus = false
    constructor(elementParent, label, width, onChange) {
        this.element = document.createElement('canvas');
        this.element.className = 'adjuster';
        if(elementParent) {
            elementParent.append(this.element);
        }
        //
        this.onChange = onChange;
        this.element.addEventListener('blur', () => this.handleBlur());
        this.element.addEventListener('focus', () => this.handleFocus());
        this.element.addEventListener(
            'click',
            (eventClick) => this.handleClick(eventClick),
        );
        //
        this.label = label;
        this.width = width;
        this.element.width = this.width*FONT_SIZE;
        this.element.height = FONT_SIZE;
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
    handleClick(eventClick) {
        const clientRect = eventClick.target.getClientRects()[0];
        let posX = eventClick.clientX - clientRect.left;
        posX = Math.floor(posX/FONT_SIZE);
        if(posX === this.width-1) {
            // console.log('Higher', this.value+1)
            this.valueSet(this.value+1);
        } else if(posX === this.width-2) {
            // console.log('Lower', this.value-1)
            this.valueSet(this.value-1);
        }
        this.draw();
    }
    handleBlur() {
        this.focus = false;
        this.draw();
    }
    handleFocus() {
        this.focus = true;
        this.draw();
    }
}
