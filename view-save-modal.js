

//==============================================================================

//-- Dependencies --------------------------------
import Vue from '/libraries/vue.esm.browser.js';

//------------------------------------------------
Vue.component('view-save-modal', {
    template: (`
        <div>
            File Name
            {{error}}
            <div style="display: flex;">
                <input :disabled="loading" type="text" style="flex-grow: 1;" />
                <button :disabled="loading" @click="save">Save</button>
                <button :disabled="loading" @click="$emit('cancel')">Cancel</button>
            </div>
        </div>
    `),
    props: {
        song: {
            type: Object,
            required: true,
        },
    },
    data: function () {
        return {
            loading: false,
            error: null,
        };
    },
    methods: {
        async save() {
            // Set loading state
            this.loading = true;
            this.error = null;
            // Submit song, retrieve response
            let saveData;
            try {
                const response = await fetch('http://localhost:7231/data/song', {
                    method: 'post',
                    headers: {
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify(this.song.toJSON()),
                });
                saveData = await response.json();
            }
            // Handle network errors
            catch(error) {
                console.log(error)
                this.error = 'Error: The server couldn\'t be contacted.';
                return;
            }
            // Reset loading state
            finally {
                this.loading = false;
            }
            // Handle client errors
            if(saveData.error) {
                this.error = saveData.error;
                return;
            }
            // Do something with the data, I don't know
            console.log(saveData)
        },
    },
});
