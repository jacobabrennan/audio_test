

//==============================================================================

//-- Dependencies --------------------------------
import { EDITOR_PANE_PATTERN } from './utilities.js';
import { setup as setupEditorPattern } from './editor_pattern/index.js';
import { setup as setupEditorInstrument } from './editor_instrument/index.js';
import { setup as setupControls } from './pane_control.js';
import {
    setup as setupEditor,
    paneSelect,
} from './pane_editor.js';

//-- Constants -----------------------------------
const DOM_ID_CLIENT = 'client';

//-- Setup ---------------------------------------
export async function setup() {
    // Create DOM container
    const client = document.createElement('div');
    client.id = DOM_ID_CLIENT;
    // Create Editor and Control Group panes
    const editor = await setupEditor();
    const controls = await setupControls();
    client.append(editor, controls);
    // Setup Editors
    await setupEditorPattern();
    await setupEditorInstrument();
    // Display default pane
    paneSelect(EDITOR_PANE_PATTERN);
    // Return DOM container
    document.body.append(client);
}
