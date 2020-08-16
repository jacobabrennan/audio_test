

//==============================================================================

//-- Dependencies --------------------------------
import {
    CHANNELS_NUMBER,
} from './processor.js';

//-- Module State --------------------------------
let patternEditor;
let pattern;

//------------------------------------------------
export async function setup(containerId) {
    const container = document.getElementById(containerId);
    patternEditor = document.createElement('div');
    patternEditor.id = 'patternEditor';
    pattern = new Pattern(patternEditor);
    container.append(patternEditor);
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
        patternLength = patternData.length / CHANNELS_NUMBER;
        const rowsDifference = patternLength - this.rows.length;
        if(rowsDifference < 0) {
            const rowsDead = this.rows.splice(patternLength, -rowsDifference);
            for(let row of rowsDead) {
                row.dispose();
            }
        }
        else if(rowsDifference > 0) {
            while(rowsDifference) {
                rowsDifferent--;
                this.rows.push(new Row(this.element));
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
    constructor(elementContainer) {
        this.element = document.createElement('div');
        this.element.className = 'pattern_row';
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
        elementContainer.append(this.element);
    }
    fillData(cellData) {
        this.element.innerHTML = cellData;
    }
}