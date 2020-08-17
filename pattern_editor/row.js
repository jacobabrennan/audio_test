

//==============================================================================

//-- Dependencies --------------------------------
import {
    CHANNELS_NUMBER,
} from '../processor.js';
import Cell from './cell.js';

//------------------------------------------------
export default class Row {
    constructor(elementContainer, rowNumber) {
        this.element = document.createElement('tr');
        this.element.className = 'pattern_row';
        this.lineIndicator = document.createElement('td');
        this.lineIndicator.className = 'pattern_row_indicator';
        this.lineIndicator.innerHTML = rowNumber.toString(16).padStart(2, '0');
        this.element.append(this.lineIndicator);
        this.cells = new Array(CHANNELS_NUMBER);
        for(let indexCell = 0; indexCell < CHANNELS_NUMBER; indexCell++) {
            let cellNew = new Cell(this.element, rowNumber, indexCell);
            this.cells[indexCell] = cellNew;
        }
        this.element.addEventListener('click', () => patternHighlightRow(rowNumber));
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
    highlight(state, scroll) {
        if(state) {
            this.element.classList.add('highlight');
            if(scroll) {
                this.element.scrollIntoView(true)
            }
        } else {
            this.element.classList.remove('highlight');
        }
    }
}
