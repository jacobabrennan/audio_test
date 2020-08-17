

//==============================================================================

//-- Dependencies --------------------------------
import {
    CHANNELS_NUMBER,
    cellParse,
    MASK_CELL_FLAG_DATA,
} from './processor.js';

//-- Module State --------------------------------
let pattern;

//------------------------------------------------
export async function setup(containerId) {
    const container = document.getElementById(containerId);
    pattern = new Pattern(container);
}
export function fillData(patternData) {
    pattern.fillData(patternData);
}

//------------------------------------------------
class Pattern {
    constructor(elementContainer) {
        this.element = document.createElement('div');
        this.element.className = 'pattern_pattern';
        this.rows = [];
        elementContainer.append(this.element);
    }
    fillData(patternData) {
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
}
class Row {
    constructor(elementContainer, rowNumber) {
        this.element = document.createElement('div');
        this.element.className = 'pattern_row';
        this.lineIndicator = document.createElement('div');
        this.lineIndicator.className = 'pattern_row_indicator';
        this.lineIndicator.innerHTML = rowNumber.toString(16).padStart(2, '0');
        this.element.append(this.lineIndicator);
        this.cells = new Array(CHANNELS_NUMBER);
        for(let indexCell = 0; indexCell < CHANNELS_NUMBER; indexCell++) {
            let cellNew = new Cell(this.element);
            this.cells[indexCell] = cellNew;
        }
        elementContainer.append(this.element);
    }
    dispose() {
        this.element.remove();
    }
    fillData(rowData) {
        for(let indexCell = 0; indexCell < CHANNELS_NUMBER; indexCell++) {
            let cellIndexed = this.cells[indexCell];
            cellIndexed.fillData(rowData[indexCell]);
        }
    }
}
class Cell {
    constructor(elementContainer) {
        this.element = document.createElement('div');
        this.element.className = 'pattern_cell';
        //
        this.elementNote = document.createElement('span');
        this.elementInstrument = document.createElement('span');
        this.elementVolume = document.createElement('span');
        this.elementEffects = document.createElement('span');
        this.element.append(
            this.elementNote,
            this.elementInstrument,
            this.elementVolume,
            this.elementEffects,
        );
        //
        elementContainer.append(this.element);
    }
    fillData(cellUInt32) {
        //
        if(!(cellUInt32 & MASK_CELL_FLAG_DATA)) {
            this.element.classList.remove('full');
            this.elementNote.innerHTML = '---';
            this.elementInstrument.innerHTML = '-';
            this.elementVolume.innerHTML = '--';
            this.elementEffects.innerHTML = '---';
            return;
        }
        //
        const cellData = cellParse(cellUInt32);
        //
        this.element.classList.add('full');
        this.elementNote.innerHTML = noteNumberToName(cellData[0]);
        this.elementInstrument.innerHTML = cellData[1].toString(16);
        this.elementVolume.innerHTML = cellData[2].toString(16).padStart(2, '0');
        this.elementEffects.innerHTML = cellData[3].toString(16).padStart(3, '0');
    }
}

//------------------------------------------------
const noteLetters = ['A','Bb','B','C','C#','D','Eb','E','F','F#','G','Ab'];
function noteNameToNumber() {}
function noteNumberToName(note) {
    const letter = noteLetters[note%12];
    const octave = Math.floor(note/12);
    return letter.padEnd(2,' ') + octave.toString();
}