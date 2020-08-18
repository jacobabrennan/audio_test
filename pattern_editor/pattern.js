

//==============================================================================

//-- Dependencies --------------------------------
import {
    cell,
    cellParse,
    CHANNELS_NUMBER,
    MASK_CELL_VOLUME_WIDTH,
    MASK_CELL_NOTE_WIDTH,
    MASK_CELL_NOTE_OFFSET,
} from '../processor.js';

//------------------------------------------------
export default class Pattern {
    rowHighlight = 0
    constructor() {
        this.fillData(new Uint32Array(16*CHANNELS_NUMBER));
    }
    fillData(patternData) {
        this.data = patternData;
    }
    editCell(row, channel, cellData) {
        this.data[(row*CHANNELS_NUMBER)+channel] = cellData;
    }
    editCellNote(row, channel, note) {
        const indexCell = row*CHANNELS_NUMBER + channel;
        let cellData = cellParse(this.data[indexCell]);
        note &= Math.pow(2, MASK_CELL_NOTE_WIDTH)-1;
        cellData = cell(note, cellData[1], cellData[2], cellData[3]);
        this.data[indexCell] = cellData;
        this.editCell(row, channel, cellData);
    }
    editCellInstrument(row, channel, instrument) {
        const indexCell = row*CHANNELS_NUMBER + channel;
        let cellData = cellParse(this.data[indexCell]);
        cellData = cell(cellData[0], instrument, cellData[2], cellData[3]);
        this.editCell(row, channel, cellData);
    }
    editCellVolume(row, channel, volume) {
        const volumeMax = Math.pow(2, MASK_CELL_VOLUME_WIDTH)-1;
        volume = Math.max(0, Math.min(volumeMax, volume));
        const indexCell = row*CHANNELS_NUMBER + channel;
        let cellData = cellParse(this.data[indexCell]);
        cellData = cell(cellData[0], cellData[1], volume, cellData[3]);
        this.data[indexCell] = cellData;
        this.editCell(row, channel, cellData);
    }
    editCellEffects(row, channel, effects) {
        const indexCell = row*CHANNELS_NUMBER + channel;
        let cellData = cellParse(this.data[indexCell]);
        cellData = cell(cellData[0], cellData[1], cellData[2], effects);
        this.data[indexCell] = cellData;
        this.editCell(row, channel, cellData);
    }
}
