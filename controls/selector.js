

//==============================================================================

//-- Dependencies --------------------------------
import {
    FONT_SIZE, FONT_FAMILY, COLOR_BG
} from '../utilities.js';

//------------------------------------------------
export default class Selector {
    constructor(elementParent, width, height, onChange) {
        this.element = document.createElement('select');
        this.element.className = 'selector';
        this.element.setAttribute('size', height);
        this.element.style.width = `${width*FONT_SIZE}px`
        this.element.style.fontFamily = FONT_FAMILY;
        this.element.style.fontSize = FONT_SIZE+'px';
        this.element.style.background = COLOR_BG;
        elementParent.append(this.element);
        //
        this.onChange = onChange;
        this.element.addEventListener('change', () => {
            onChange(Number(this.element.value));
        });
    }
    optionsUpdate(patternList) {
        // Clear old values
        while (this.element.firstChild) {
            this.element.removeChild(this.element.lastChild);
        }
        // Populate with new data
        this.options = [];
        for(let indexPattern = 0; indexPattern < patternList.length; indexPattern++) {
            const option = document.createElement('option');
            option.setAttribute('value', indexPattern);
            option.innerText = patternList.names[indexPattern];
            option.value = indexPattern;
            if(indexPattern == patternList.indexCurrent) {
                option.selected = true;
            }
            this.options.push(option);
            const optionDerp = document.createElement('option');
            optionDerp.setAttribute('value', `${indexPattern}_derp`);
            optionDerp.style.display = 'none';
            this.options.push(optionDerp);
        }
        this.element.append(...this.options);
        this.fixColors();
    }
    fixColors() {
        for(let option of this.options) {
            if(option.value === this.element.value) {
                option.classList.add('selected');
                option.scrollIntoView();
            } else{
                option.classList.remove('selected');
            }
        }
        this.element.value = `${this.element.value}_derp`;
        this.element.blur();
    }
}
