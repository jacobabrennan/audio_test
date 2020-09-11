

//==============================================================================

//-- Dependencies --------------------------------
import Vue from '../libraries/vue.esm.browser.js';

//------------------------------------------------
Vue.component('button-bar', {
    template: (`
        <div class="button-bar">
            <button
                v-for="data in actions"
                :key="data.label"
                @click="data.action"
            >
                {{ data.label }}
            </button>
        </div>
    `),
    props: {
        actions: {
            type: Array,
            required: true,
        },
    },
});
