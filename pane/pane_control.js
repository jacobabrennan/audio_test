

//==============================================================================

import Vue from '../libraries/vue.esm.browser.js';
import '../controls/button.js';
import { songSave, songLoad } from '../file_management/controls.js';

//------------------------------------------------
const template = `<div>
    <button-bar actions="this.actions" />
</div>`;

//------------------------------------------------
Vue.component('client-controls', {
    template: template,
    data: {
        actions: {
            ['Save']: songSave,
            ['Load']: songLoad,
        }
    }
});
