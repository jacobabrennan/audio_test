

//==============================================================================

//-- Dependencies --------------------------------
import Vue from '../libraries/vue.esm.browser.js';
import '../controls/button.js';
import { songSave, songLoad } from '../file_management/controls.js';

//------------------------------------------------
const template = `<div>
    <button-bar :actions="actions" />
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
export default Vue.component('client-controls', {
    template: template,
    data() {
        return { actions: actions};
    },
});
