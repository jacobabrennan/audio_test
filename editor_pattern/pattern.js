

//==============================================================================

//-- Dependencies --------------------------------
import {
    cell,
    cellParse,
    CHANNELS_NUMBER,
    MASK_CELL_VOLUME_WIDTH,
    MASK_CELL_NOTE_WIDTH,
    CHANNEL_NOISE,
    NOTE_NOISE_MAX,
    MASK_CELL_NOTE_STOP,
} from '../node_modules/@jacobabrennan/apu/apu.single.js';

//-- Cell Data Editing ---------------------------
export function cellGet(indexRow, indexChannel) {
    const compoundIndex = indexRow*CHANNELS_NUMBER+indexChannel;
    return this.pattern[compoundIndex];
}
export function cellEdit(row, channel, cellData) {
    this.$emit('cell-edit', {
        row: row,
        channel: channel,
        value: cellData,
    });
}
export function cellEditNote(row, channel, noteNew) {
    const indexCell = row*CHANNELS_NUMBER + channel;
    let [noteOld, instrument, volume, effects] = cellParse(this.pattern[indexCell]);
    if(noteNew !== MASK_CELL_NOTE_STOP) {
        if(channel === CHANNEL_NOISE) {
            noteNew = Math.max(0, Math.min(NOTE_NOISE_MAX, noteNew));
        }
        if(instrument === undefined) {
            instrument = this.instrument;
        }
    }
    noteNew &= Math.pow(2, MASK_CELL_NOTE_WIDTH)-1;
    const cellData = cell(noteNew, instrument, volume, effects);
    this.cellEdit(row, channel, cellData);
}
export function cellEditInstrument(row, channel, instrument) {
    const indexCell = row*CHANNELS_NUMBER + channel;
    let cellData = cellParse(this.pattern[indexCell]);
    cellData = cell(cellData[0], instrument, cellData[2], cellData[3]);
    this.cellEdit(row, channel, cellData);
}
export function cellEditVolume(row, channel, volume) {
    const volumeMax = Math.pow(2, MASK_CELL_VOLUME_WIDTH)-1;
    volume = Math.max(0, Math.min(volumeMax, volume));
    const indexCell = row*CHANNELS_NUMBER + channel;
    let cellData = cellParse(this.pattern[indexCell]);
    cellData = cell(cellData[0], cellData[1], volume, cellData[3]);
    this.cellEdit(row, channel, cellData);
}
export function cellEditEffects(row, channel, effects) {
    const indexCell = row*CHANNELS_NUMBER + channel;
    let cellData = cellParse(this.pattern[indexCell]);
    cellData = cell(cellData[0], cellData[1], cellData[2], effects);
    this.cellEdit(row, channel, cellData);
}
