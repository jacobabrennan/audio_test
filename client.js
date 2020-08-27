

//==============================================================================

//-- Dependencies --------------------------------
import Vue from './libraries/vue.esm.browser.js';
import './controls/button.js';
import './pane/pane_control.js';
import './pane/pane_editor.js';
import './editor_pattern/index.js';
import {
    DOM_STYLE_DYNAMIC,
    // EDITOR_PANE_PATTERN,
    contextConfigure,
    CHAR_HEART,
    FONT_SIZE,
} from './utilities.js';
// import { setup as setupEditorPattern } from './editor_pattern/index.js';
// import { setup as setupEditorInstrument } from './editor_instrument/index.js';
// import { setup as setupControls } from './pane/pane_control.js';
// import {
//     setup as setupEditor,
//     paneSelect,
// } from './pane/pane_editor.js';

//-- Constants -----------------------------------
const DOM_ID_CLIENT = 'client';

//-- Setup ---------------------------------------
export async function setup() {
    // Load custom font
    await loadFont();
    // Create DOM container
    let client = document.createElement('div');
    client.id = DOM_ID_CLIENT;
    client.innerHTML = `
        <client-editor id="editor"></client-editor>
        <client-controls id="controls"></client-controls>
    `;
    document.body.append(client);
    console.log(client.outerHTML)
    //
    new Vue({
        el: client,
        data: {},
        methods: {},
    });
    // client=  app.$el;
    // // Create Editor and Control Group panes
    // const controls = await setupControls();
    // const editor = await setupEditor();
    // client.append(editor, controls);
    // // Setup Editors
    // await setupEditorPattern();
    // await setupEditorInstrument();
    // // Display default pane
    // paneSelect(EDITOR_PANE_PATTERN);
    // // Return DOM container
}


//== Font Load Checker =========================================================

/* This font loader is necessary due to Chrome's refusal to load fonts until
after an attempt is made to use them. Until FontFace becomes an offical stanard,
a kludge like this will remain necessary. Switch to Firefox, where this just
works. */

//-- Font Loader ---------------------------------
async function loadFont() {
    const elementStyle = document.createElement('style');
    elementStyle.innerText = DOM_STYLE_DYNAMIC;
    document.head.appendChild(elementStyle);
    const canvas = document.createElement('canvas');
    canvas.width = FONT_SIZE;
    canvas.height = FONT_SIZE;
    const context = canvas.getContext('2d');
    contextConfigure(context);
    let runningTotal = 0;
    const timeoutFont = 1000; // Give chrome a second to attempt to load the font.
    return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            const success = checkFontStatus(context);
            if(success) {
                clearInterval(interval);
                resolve();
            }
            runningTotal += 10;
            if(runningTotal > timeoutFont) {
                clearInterval(interval);
                reject();
            }
        }, 10);
    });
}
function checkFontStatus(context) {
    context.fillStyle = '#000';
    context.fillRect(0,0,FONT_SIZE,FONT_SIZE);
    context.fillStyle = '#f00';
    context.fillText(CHAR_HEART, 0, FONT_SIZE);
    const imageData = context.getImageData(0,0,FONT_SIZE,FONT_SIZE).data;
    const posY = 8;
    const colorChannels = 4;
    let success = true;
    for(let posX = 4; posX < FONT_SIZE-4; posX++) {
        const indexRedChannel = ((posY*FONT_SIZE)+posX)*colorChannels;
        const valueRed = imageData[indexRedChannel];
        if(valueRed === 255) { continue;}
        success = false;
    }
    return success;
}
