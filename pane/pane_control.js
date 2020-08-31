

//==============================================================================

//-- Dependencies --------------------------------
import Vue from '../libraries/vue.esm.browser.js';
import { songSave, songLoad } from '../file_management/controls.js';

//------------------------------------------------
const template = `<div>
    <button-bar :actions="actions" />
    <slot />
</div>`;
const actions = [
    {
        label: 'Save',
        action: songSave
    },
    {
        label: 'Load',
        action: songLoad,
    },
];

//------------------------------------------------
Vue.component('client-controls', {
    template: template,
    data() {
        return { actions: actions};
    },
});
