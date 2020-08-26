

//==============================================================================

//-- Dependencies --------------------------------
import Vue from '../libraries/vue.esm.browser.js';

//------------------------------------------------
Vue.component('button-action', {
    template: '<button @click="action">{{label}}</button>',
    props: {
        label: {
            type: String, 
            required: true,
        },
        action: {
            type: Function,
            required: true,
        },
    },
});

//------------------------------------------------
Vue.component('button-bar', {
    template: (
        `<div>
            <button
                type="button"
                v-for="data in actions"
                :key="data.label"
                @click="data.action"
            >{{data.label}}</button>
        </div>`
    ),
    props: {
        actions: {
            type: Object,
            required: true,
        },
    },
});
