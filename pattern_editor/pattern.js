

//==============================================================================

//-- Dependencies --------------------------------
import {
    cell,
    cellParse,
    CHANNELS_NUMBER,
} from '../processor.js';

//------------------------------------------------
export default class Pattern {
    constructor() {
        this.fillData(new Uint32Array(16*CHANNELS_NUMBER));
    }
    fillData(patternData) {
        this.data = patternData;
    }
    editCell(row, channel, cellData) {
        this.data[(row*CHANNELS_NUMBER)+channel] = cellData;
    }
    highlightRow(indexRow, scroll) {
        // if(Number.isFinite(this.highlightRowIndexCurrent)) {
        //     let rowOld = this.rows[this.highlightRowIndexCurrent]
        //     if(rowOld) {
        //         rowOld.highlight(false);
        //     }
        // }
        // this.highlightRowIndexCurrent = indexRow;
        // this.rows[indexRow].highlight(true, scroll);
    }
    editCellNote(row, channel, note) {
        const indexCell = row*CHANNELS_NUMBER + channel;
        let cellData = cellParse(this.data[indexCell]);
        cellData = cell(note, cellData[1], cellData[2], cellData[3]);
        this.data[indexCell] = cellData;
        this.editCell(row, channel, cellData);
    }
    editCellInstrument(row, channel, instrument) {
        const indexCell = row*CHANNELS_NUMBER + channel;
        let cellData = cellParse(this.data[indexCell]);
        cellData = cell(cellData[0], instrument, cellData[2], cellData[3]);
        this.data[indexCell] = cellData;
        this.editCell(row, channel, cellData);
    }
    editCellVolume(row, channel, volume) {
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
