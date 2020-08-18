

//==============================================================================

//-- Dependencies --------------------------------
import {
    cellParse,
    MASK_CELL_FLAG_DATA,
    MASK_CELL_NOTE_WIDTH,
    MASK_CELL_INSTRUMENT_WIDTH,
    MASK_CELL_VOLUME_WIDTH,
} from '../processor.js';
import {
    editCellEffects,
    editCellNote,
    editCellInstrument,
    editCellVolume,
} from './index.js';

//------------------------------------------------
export default class Cell {
    constructor(elementContainer, indexRow, indexChannel) {
        this.indexRow = indexRow;
        this.indexChannel = indexChannel;
        //
        this.element = document.createElement('td');
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
        editCellNote(undefined, this.indexRow, this.indexChannel, noteNumber);
    }
    validateInstrument() {
        const instrument = parseInt(this.elementInstrument.value, 16);
        if(!(instrument >= 0 && instrument < Math.pow(2, MASK_CELL_INSTRUMENT_WIDTH))) {
            this.fillData(this.cellUInt32);
            return;
        }
        editCellInstrument(undefined, this.indexRow, this.indexChannel, instrument);
    }
    validateVolume() {
        const volume = parseInt(this.elementVolume.value, 16);
        if(!(volume >= 0 && volume < Math.pow(2, MASK_CELL_VOLUME_WIDTH))) {
            this.fillData(this.cellUInt32);
            return;
        }
        editCellVolume(undefined, this.indexRow, this.indexChannel, volume);
    }
    validateEffects() {}
}
