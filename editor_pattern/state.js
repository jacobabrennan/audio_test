

//== Module State ==============================================================

//-- Song Data -----------------------------------
let volume = 16;
let beatsPerSecond = BPS_DEFAULT;
let ticksPerBeat = TPB_DEFAULT;
const patterns = [];

//-- Editor State --------------------------------
let patternCurrent;
let posDownX;
let posDownY;
let clipBoard;
let scrollY = 0;
let cursorX = 0;
let cursorY = 0;
let selection;

//-- House Keeping -------------------------------
//
let adjusterVolume;
let adjusterBPS;
let adjusterTPB;
//
let patternSelector;
let lengthAdjuster;
let patternCountAdjuster;
//
let patternGrid = [];
let drawWaiting = false;
let heightCanvas = DISPLAY_HEIGHT;
