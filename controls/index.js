

//==============================================================================

//------------------------------------------------
import { setupControls as setupEditor } from '../editor_pane.js';
import { setup as setupButtons } from './test_buttons.js';
import { setup as setupPattern } from '../editor_pattern/control_pattern.js';

//------------------------------------------------
export async function setup() {
    const controls = document.createElement('div');
    controls.id = 'controls';
    controls.append(await setupEditor());
    controls.append(await setupButtons());
    controls.append(await setupPattern());
    return controls;
}
