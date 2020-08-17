

//==============================================================================

//-- Dependencies --------------------------------
import {
    cell,
    cellParse,
    CHANNELS_NUMBER,
} from '../processor.js';
import Row from './row.js';

//------------------------------------------------
export default class Pattern {
    constructor() {
        this.element = document.createElement('tbody');
        this.rows = [];
    }
    fillData(patternData) {
        this.data = patternData;
        const patternLength = patternData.length / CHANNELS_NUMBER;
        let rowsDifference = patternLength - this.rows.length;
        if(rowsDifference < 0) {
            const rowsDead = this.rows.splice(patternLength, -rowsDifference);
            for(let row of rowsDead) {
                row.dispose();
            }
        }
        else if(rowsDifference > 0) {
            while(rowsDifference) {
                rowsDifference--;
                this.rows.push(
                    new Row(this.element, this.rows.length)
                );
            }
        }
        for(let indexRow = 0; indexRow < patternLength; indexRow++) {
            let row = this.rows[indexRow];
            let rowData = patternData.slice(
                indexRow*CHANNELS_NUMBER,
                (indexRow+1)*CHANNELS_NUMBER,
            );
            row.fillData(rowData);
        }
    }
    editCell(row, channel, cellData) {
        this.rows[row].editCell(channel, cellData);
    }
    highlightRow(indexRow, scroll) {
        if(Number.isFinite(this.highlightRowIndexCurrent)) {
            this.rows[this.highlightRowIndexCurrent].highlight(false);
        }
        this.highlightRowIndexCurrent = indexRow;
        this.rows[indexRow].highlight(true, scroll);
    }
    editCell(row, channel, cellData) {
        const indexCell = row*CHANNELS_NUMBER + channel;
        this.data[indexCell] = cellData;
        pattern.editCell(row, channel, cellData);
    }
    editCellNote(row, channel, note) {
        const indexCell = row*CHANNELS_NUMBER + channel;
        let cellData = cellParse(this.data[indexCell]);
        cellData = cell(note, cellData[1], cellData[2], cellData[3]);
        editCell(row, channel, cellData);
    }
    editCellInstrument(row, channel, instrument) {
        const indexCell = row*CHANNELS_NUMBER + channel;
        let cellData = cellParse(this.data[indexCell]);
        cellData = cell(cellData[0], instrument, cellData[2], cellData[3]);
        editCell(row, channel, cellData);
    }
    editCellVolume(row, channel, volume) {
        const indexCell = row*CHANNELS_NUMBER + channel;
        let cellData = cellParse(this.data[indexCell]);
        cellData = cell(cellData[0], cellData[1], volume, cellData[3]);
        editCell(row, channel, cellData);
    }
    editCellEffects(row, channel, effects) {
        const indexCell = row*CHANNELS_NUMBER + channel;
        let cellData = cellParse(this.data[indexCell]);
        cellData = cell(cellData[0], cellData[1], cellData[2], effects);
        editCell(row, channel, cellData);
    }
}
