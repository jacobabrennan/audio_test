

//==============================================================================

//-- Dependencies --------------------------------
import {
    ACTION_SONG,
    ACTION_PLAYBACK_PLAY,
    ACTION_PLAYBACK_STOP,
    BPS_DEFAULT,
    TPB_DEFAULT,
    BPS_MAX,
    TPB_MAX,
    VOLUME_MAX,
} from '../processor.js';
import { patternDataCompile } from '../editor_pattern/pattern.js';
import { messageSend } from '../worklet_interface.js';
import { ButtonBar } from '../controls/button.js';
import Adjuster from '../controls/adjuster.js';
import { instrumentDataCompile } from '../editor_instrument/instrument.js';

//-- Setup ---------------------------------------
export async function setup() {
    //
    const containerGroup = document.createElement('div');
    containerGroup.className = 'control_group';
    //
    new ButtonBar(containerGroup, {
        'Play': async () => {
            await messageSend(ACTION_SONG, songCompile());
            await messageSend(ACTION_PLAYBACK_PLAY, {/* Currently empty */});
        },
        'Stop': () => {
            messageSend(ACTION_PLAYBACK_STOP, {/* Currently empty */});
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

//-- Saving / Loading ----------------------------
export function loadFromData(data) {
    volume = data.volume;
    beatsPerSecond = data.bps;
    ticksPerBeat = data.tpb;
    adjusterVolume.valueSet(volume, true);
    adjusterBPS.valueSet(beatsPerSecond, true);
    adjusterTPB.valueSet(ticksPerBeat, true);
}

//-- Playback Metrics Querying -------------------
export function volumeGet() { return volume;}
export function bpsGet() { return beatsPerSecond;}
export function tpbGet() { return ticksPerBeat;}

//-- Interaction Handlers ------------------------
function volumeSet(volumeNew) {
    volumeNew = Math.max(0, Math.min(VOLUME_MAX, volumeNew));
    volume = volumeNew;
    return volumeNew;
}
function bpsSet(beatsNew) {
    beatsNew = Math.max(1, Math.min(BPS_MAX, beatsNew));
    beatsPerSecond = beatsNew;
    return beatsNew;
}
function tpbSet(ticksNew) {
    ticksNew = Math.max(1, Math.min(TPB_MAX, ticksNew));
    ticksPerBeat = ticksNew;
    return ticksNew;
}
function songCompile() {
    return {
        volume: volume,
        bps: adjusterBPS.valueGet(),
        tpb: adjusterTPB.valueGet(),
        patterns: patternDataCompile(),
        instruments: instrumentDataCompile(),
    };
}
