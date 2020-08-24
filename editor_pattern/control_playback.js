

//==============================================================================

//-- Dependencies --------------------------------
import { messageSend } from '../worklet_interface.js';
import {
    ACTION_SONG,
    ACTION_PLAYBACK_PLAY,
    ACTION_PLAYBACK_STOP,
    BPS_DEFAULT,
    TPB_DEFAULT,
} from '../processor.js';
import { patternDataCompile } from '../editor_pattern/pattern.js';
import { instrumentDataCompile } from '../editor_instrument/instrument.js';
import { ButtonBar } from '../controls/button.js';
import Adjuster from '../controls/adjuster.js';

//------------------------------------------------
let adjusterVolume;
let adjusterBPS;
let adjusterTPB;
let beatsPerSecond = BPS_DEFAULT;
let ticksPerBeat = TPB_DEFAULT;
let volume = 16;

//------------------------------------------------
export async function setup() {
    //
    const containerGroup = document.createElement('div');
    containerGroup.className = 'control_group';
    //
    new ButtonBar(containerGroup, {
        'Play': async () => {
            await messageSend(ACTION_SONG, songCompile());
            await messageSend(ACTION_PLAYBACK_PLAY, {/* Current empty */});
        },
        'Stop': () => {
            messageSend(ACTION_PLAYBACK_STOP, {/* Current empty */});
        }
    });
    // Volume control
    adjusterVolume = new Adjuster(containerGroup, 'Volume', 15, volumeSet);
    adjusterVolume.valueSet(volume, true);
    // Time Controls
    adjusterBPS = new Adjuster(containerGroup, 'Rows/Sec.', 15, bpsSet);
    adjusterBPS.valueSet(beatsPerSecond, true);
    adjusterTPB = new Adjuster(containerGroup, 'Ticks/Row', 15, tpbSet);
    adjusterTPB.valueSet(ticksPerBeat, true);
    //
    return containerGroup;
}

//------------------------------------------------
function songCompile() {
    return {
        volume: volume,
        bps: adjusterBPS.valueGet(),
        tpb: adjusterTPB.valueGet(),
        patterns: patternDataCompile(),
        instruments: instrumentDataCompile(),
    };
}

//------------------------------------------------
function volumeSet(volumeNew) {
    volumeNew = Math.max(0, Math.min(63, volumeNew));
    volume = volumeNew;
    return volumeNew;
}
function bpsSet(beatsNew) {
    beatsNew = Math.max(1, Math.min(63, beatsNew));
    beatsPerSecond = beatsNew;
    return beatsNew;
}
function tpbSet(ticksNew) {
    ticksNew = Math.max(1, Math.min(15, ticksNew));
    ticksPerBeat = ticksNew;
    return ticksNew;
}
