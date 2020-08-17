

//==============================================================================

//-- Dependencies --------------------------------
import {
    cell,
    cellParse,
    CHANNELS_NUMBER,
    MASK_CELL_FLAG_DATA,
    MASK_CELL_NOTE_WIDTH,
    MASK_CELL_INSTRUMENT_WIDTH,
    MASK_CELL_VOLUME_WIDTH,
} from './processor.js';

//-- Module State --------------------------------
let pattern;
let currentPattern;

//------------------------------------------------
export async function setup(containerId) {
    const container = document.getElementById(containerId);
    pattern = new Pattern(container);
}
export function fillData(patternData) {
    pattern.fillData(patternData);
}
export function patternGet() {
    return currentPattern;
}
function editCell(row, channel, cellData) {
    const indexCell = row*CHANNELS_NUMBER + channel;
    currentPattern[indexCell] = cellData;
    pattern.editCell(row, channel, cellData);
}
function editCellNote(row, channel, note) {
    const indexCell = row*CHANNELS_NUMBER + channel;
    let cellData = cellParse(currentPattern[indexCell]);
    cellData = cell(note, cellData[1], cellData[2], cellData[3]);
    editCell(row, channel, cellData);
}
function editCellInstrument(row, channel, instrument) {
    const indexCell = row*CHANNELS_NUMBER + channel;
    let cellData = cellParse(currentPattern[indexCell]);
    cellData = cell(cellData[0], instrument, cellData[2], cellData[3]);
    editCell(row, channel, cellData);
}
function editCellVolume(row, channel, volume) {
    const indexCell = row*CHANNELS_NUMBER + channel;
    let cellData = cellParse(currentPattern[indexCell]);
    cellData = cell(cellData[0], cellData[1], volume, cellData[3]);
    editCell(row, channel, cellData);
}
function editCellEffects(row, channel, effects) {
    const indexCell = row*CHANNELS_NUMBER + channel;
    let cellData = cellParse(currentPattern[indexCell]);
    cellData = cell(cellData[0], cellData[1], cellData[2], effects);
    editCell(row, channel, cellData);
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
        currentPattern = patternData;
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
            let cellNew = new Cell(this.element, rowNumber, indexCell);
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
    editCell(channel, cellData) {
        this.cells[channel].fillData(cellData);
    }
}
class Cell {
    constructor(elementContainer, indexRow, indexChannel) {
        this.indexRow = indexRow;
        this.indexChannel = indexChannel;
        //
        this.element = document.createElement('div');
        this.element.className = 'pattern_cell';
        //
        this.elementNote = document.createElement('input');
        this.elementInstrument = document.createElement('input');
        this.elementVolume = document.createElement('input');
        this.elementEffects = document.createElement('input');
        this.element.append(
            this.elementNote,
            this.elementInstrument,
            this.elementVolume,
            this.elementEffects,
        );
        //
        this.elementNote.setAttribute('maxlength', '3');
        this.elementInstrument.setAttribute('maxlength', '1');
        this.elementVolume.setAttribute('maxlength', '2');
        this.elementEffects.setAttribute('maxlength', '3');
        // this.elementNote.pattern = /[a-z][#,' ']?[0-9]?/gi;
        // this.elementInstrument.pattern = /[0-9]|[a-f]/gi;
        // this.elementVolume.pattern = /[0-9]|[a-f]/gi;
        // this.elementEffects.pattern = 3;
        //
        this.elementNote.addEventListener('change', () => this.validateNote());
        this.elementNote.addEventListener('blur', () => this.validateNote());
        this.elementNote.addEventListener('focus', () => this.elementNote.value = '');
        this.elementInstrument.addEventListener('change', () => this.validateInstrument());
        this.elementInstrument.addEventListener('blur', () => this.validateInstrument());
        this.elementInstrument.addEventListener('focus', () => this.elementInstrument.value = '');
        this.elementVolume.addEventListener('change', () => this.validateVolume());
        this.elementVolume.addEventListener('blur', () => this.validateVolume());
        this.elementVolume.addEventListener('focus', () => this.elementVolume.value = '');
        //
        elementContainer.append(this.element);
    }
    fillData(cellUInt32) {
        this.cellUInt32 = cellUInt32;
        //
        if(!(cellUInt32 & MASK_CELL_FLAG_DATA)) {
            this.element.classList.remove('full');
            this.elementNote.value = '---';
            this.elementInstrument.value = '-';
            this.elementVolume.value = '--';
            this.elementEffects.value = '---';
            return;
        }
        //
        const cellData = cellParse(cellUInt32);
        //
        this.element.classList.add('full');
        this.elementNote.value = noteNumberToName(cellData[0]);
        this.elementInstrument.value = cellData[1].toString(16);
        this.elementVolume.value = cellData[2].toString(16).padStart(2, '0');
        this.elementEffects.value = cellData[3].toString(16).padStart(3, '0');
        this.elementNote.placeholder = this.elementNote.value;
        this.elementInstrument.placeholder = this.elementInstrument.value;
        this.elementVolume.placeholder = this.elementVolume.value;
        this.elementEffects.placeholder = this.elementEffects.value;
    }
    validateNote() {
        let note = this.elementNote.value;
        if(!note) {
            this.fillData(this.cellUInt32);
            return;
        }
        note = noteFormatName(note);
        let noteNumber = noteNameToNumber(note);
        if(noteNumber === false) {
            this.fillData(this.cellUInt32);
            return;
        }
        editCellNote(this.indexRow, this.indexChannel, noteNumber);
    }
    validateInstrument() {
        const instrument = parseInt(this.elementInstrument.value, 16);
        if(!(instrument >= 0 && instrument < Math.pow(2, MASK_CELL_INSTRUMENT_WIDTH))) {
            this.fillData(this.cellUInt32);
            return;
        }
        editCellInstrument(this.indexRow, this.indexChannel, instrument);
    }
    validateVolume() {
        const volume = parseInt(this.elementVolume.value, 16);
        if(!(volume >= 0 && volume < Math.pow(2, MASK_CELL_VOLUME_WIDTH))) {
            this.fillData(this.cellUInt32);
            return;
        }
        editCellVolume(this.indexRow, this.indexChannel, volume);
    }
    validateEffects() {}
}

//------------------------------------------------
const noteLetters = ['A','Bb','B','C','C#','D','Eb','E','F','F#','G','Ab'];
function noteFormatName(note) {
    let letter = note[0].toUpperCase();
    let octave = 4;
    if(note.length === 1) { // 'b' => 'B 4'
        return letter+' '+octave;
    }
    if(note.length === 3) { // 'bb2' => 'Bb2'
        return letter+note[1]+note[2];
    }
    if(note[1] === '#' || note[1] === 'b') { // 'bb' => 'Bb4'
        return letter+note[1]+octave;
    }
    return letter+' '+note[1]; // 'b4' => 'B 4'
}
function noteNameToNumber(note) {
    let letter = note[0];
    if(note[1] !== ' ') {
        letter = note[0]+note[1];
    }
    let noteOffset = noteLetters.indexOf(letter);
    let octave = parseInt(note[2]);
    if(noteOffset > 2) { octave--}
    if(noteOffset === -1) { return false;}
    noteOffset += octave*12;
    if(!Number.isFinite(noteOffset)) { return false;}
    if(noteOffset > (Math.pow(2, MASK_CELL_NOTE_WIDTH)-1)) { return false;}
    if(noteOffset < 0) { return false;}
    return noteOffset;
}
function noteNumberToName(note) {
    let letter = noteLetters[note%12];
    let octave = Math.floor(note/12);
    if(note%12 > 2) {
        octave++;
    }
    return letter.padEnd(2,' ') + octave.toString();
}
