

//==============================================================================

//-- Dependencies --------------------------------
// Framework
import Vue from './libraries/vue.esm.browser.js';
// Standard Components (must be preloaded)
import './controls/adjuster.js';
import './controls/button.js';
import './client.js';
// Font Loading Utilities
import {
    contextConfigure,
    CHAR_HEART,
    DOM_STYLE_DYNAMIC,
    FONT_SIZE,
} from './utilities.js';

//-- Initialize Project --------------------------
(async function () {
    // Load custom font
    await loadFont();
    // Create DOM container
    let client = document.createElement('song-editor');
    document.body.append(client);
    new Vue({
        el: client,
    });
})();


//== Font Load Checker =========================================================

/* This font loader is necessary due to Chrome's refusal to load fonts until
after an attempt is made to use them. This is too late for a call to the canvas
2D drawing functions. Until FontFace becomes an offical stanard, a kludge like
this will remain necessary. Switch to Firefox, where this just works. */

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

//-- Load Status Checker -------------------------
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
