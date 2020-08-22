

//==============================================================================

//-- Dependencies --------------------------------
import { messageSend } from '../worklet_interface.js';
import {
    ACTION_SONG,
    ACTION_PLAYBACK_PLAY,
    ACTION_PLAYBACK_STOP,
} from '../processor.js';
import { patternDataCompile } from '../editor_pattern/pattern.js';
import { instrumentDataCompile } from '../editor_instrument/instrument.js';
import { ButtonBar } from '../controls/button.js';
import Adjuster from '../controls/adjuster.js';

//------------------------------------------------
export async function setup() {
    //
    const containerGroup = document.createElement('div');
    containerGroup.className = 'control_group';
    //
    new ButtonBar(containerGroup, {
        'Play': async () => {
            await messageSend(ACTION_SONG, {
                patterns: patternDataCompile(),
                instruments: instrumentDataCompile(),
            });
            await messageSend(ACTION_PLAYBACK_PLAY, {/* Current empty */});
        },
        'Stop': () => {
            messageSend(ACTION_PLAYBACK_STOP, {/* Current empty */});
        }
    });
    //
    // let bps = new Adjuster(containerGroup, 'Row/Sec.', 15, (valueNew) => {
    //     return valueNew
    // });
    // bps.valueSet(1, true);
    //
    return containerGroup;
}
