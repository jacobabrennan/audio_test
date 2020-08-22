

//==============================================================================

//------------------------------------------------
export default class Button {
    constructor(elementParent, label, onClick) {
        this.element = document.createElement('button');
        this.element.innerText = label;
        this.element.addEventListener('click', onClick);
        elementParent.append(this.element);
    }
}

//------------------------------------------------
export class ButtonBar {
    constructor(elementParent, buttons) {
        this.buttons = {};
        this.element = document.createElement('div');
        this.element.className = 'button_group';
        for(let label in buttons) {
            const buttonNew = new Button(this.element, label, buttons[label]);
            this.buttons[label] = buttonNew;
        }
        if(elementParent) {
            elementParent.append(this.element);
        }
    }
    buttonGet(label) {
        return this.buttons[label];
    }
}
