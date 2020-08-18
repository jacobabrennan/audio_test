

//==============================================================================

//-- Dependencies --------------------------------
import { messageSend } from '../worklet_interface.js';
import {
    ACTION_SONG,
    ACTION_PLAYBACK_PLAY,
    ACTION_PLAYBACK_STOP,
} from '../processor.js';
import {
    patternDataCompile,
} from '../pattern_editor/index.js';

//------------------------------------------------
export async function setup() {
    //
    const containerGroup = document.createElement('div');
    containerGroup.className = 'control_group';
    //
    const title = document.createElement('h2');
    title.innerText = 'Playback';
    containerGroup.append(title);
    //
    const buttonPlay = document.createElement('button');
    const buttonStop = document.createElement('button');
    buttonPlay.innerText = 'Play';
    buttonStop.innerText = 'Stop';
    buttonPlay.addEventListener('click', async function () {
        await messageSend(ACTION_SONG, {
            patterns: patternDataCompile(),
            instruments: [
                [100,200,0.5,2000, true],
                [25,25,1,500, false],
                [25,75,1,1000, false],
            ],
        });
        await messageSend(ACTION_PLAYBACK_PLAY, {derp: 'herp'});
    });
    buttonStop.addEventListener('click', function () {
        messageSend(ACTION_PLAYBACK_STOP, {derp: 'herp'});
    });
    containerGroup.append(buttonPlay, buttonStop);
    return containerGroup;
}
