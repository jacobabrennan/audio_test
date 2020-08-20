

//==============================================================================

//-- Dependencies --------------------------------
import {
    DOM_STYLE_DYNAMIC,
    EDITOR_PANE_PATTERN,
} from './utilities.js';
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
    // Load custom font by appending dynamic style sheet
    const elementStyle = document.createElement('style');
    elementStyle.innerText = DOM_STYLE_DYNAMIC;
    document.head.appendChild(elementStyle);
    // Create DOM container
    const client = document.createElement('div');
    client.id = DOM_ID_CLIENT;
    // Create Editor and Control Group panes
    const controls = await setupControls();
    const editor = await setupEditor();
    client.append(editor, controls);
    // Setup Editors
    await setupEditorPattern();
    await setupEditorInstrument();
    // Display default pane
    paneSelect(EDITOR_PANE_PATTERN);
    // Return DOM container
    document.body.append(client);
}
