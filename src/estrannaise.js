
import { 
    plotCurves,
    generatePlottingOptions
 } from './plotting.js';

import { modelList } from './models.js';

import { Presets } from './presets.js';

// This is used to determine whether to refresh after each input event
// Only refresh when a row goes from invalid to valid or vis-versa
const rowValidity = new Map();

let global_conversionFactor = 1.0;
let global_units = 'pg/mL';
let global_daysAsIntervals = true;
let global_menstrualCycleVisible = false;
let global_targetRangeVisible = false;
let global_currentColorScheme = 'day';

const NB_LINE_POINTS = 900;
const NB_CLOUD_POINTS = 3500;
const CLOUD_POINT_SIZE = 1.3;
const CLOUD_POINT_OPACITY = 0.4;

window.addEventListener('DOMContentLoaded', () => {

    attachDragNDropImport();

    attachOptionsEvents();
    
    attachPresetsDropdown();
    
    attachMultidoseButtonsEvents();
    attachSteadyStateButtonsEvents();
    
    attachMenstrualCycleButtonEvent();
    attachTargetRangeButtonEvent();

    themeSetup();

    if (!loadFromURL()) {
        initializeDefaultPreset();
    }

    refresh();
});

export function getCurrentPlottingOptions() {
    let rootStyle = getComputedStyle(document.documentElement);
    let backgroundColor = rootStyle.getPropertyValue('--background-color');
    let lightForegroundColor = rootStyle.getPropertyValue('--light-foreground');
    let strongForegroundColor = rootStyle.getPropertyValue('--strong-foreground');

    return generatePlottingOptions(
        global_conversionFactor, 
        global_currentColorScheme, 
        global_menstrualCycleVisible, 
        global_targetRangeVisible, 
        global_units,
        NB_LINE_POINTS,
        NB_CLOUD_POINTS,
        CLOUD_POINT_SIZE,
        CLOUD_POINT_OPACITY,
        backgroundColor,
        lightForegroundColor,
        strongForegroundColor
        );
}

/**
 * Re-draw the graph
 * @param {boolean} save save current state to local storage
 */
function refresh(save = false) {
    
    if (save) {
        saveToLocalStorage();
    }

    let graph = plotCurves(
        getTDMs(),
        getCurrentPlottingOptions(),
        false);
    let plot = document.getElementById('plot-region');
    plot.innerHTML = '';
    plot.append(graph);
}

// Find the first element in list that contains str or is contained in str (case insensitive)
function findIntersecting(list, str) {
    return list.find(el => el.toLowerCase().includes(str.toLowerCase()) || str.toLowerCase().includes(el.toLowerCase()));
}

function setColorScheme(scheme = 'night', refreshAfter = true) {
    let rootStyle = getComputedStyle(document.documentElement);
    if (scheme == 'night') {
        document.documentElement.style.setProperty('--background-color', rootStyle.getPropertyValue('--background-color-night'));
        document.documentElement.style.setProperty('--standout-background-color', rootStyle.getPropertyValue('--standout-background-color-night'));
        document.documentElement.style.setProperty('--strong-foreground', rootStyle.getPropertyValue('--strong-foreground-night'));
        document.documentElement.style.setProperty('--light-foreground', rootStyle.getPropertyValue('--light-foreground-night'));
        global_currentColorScheme = 'night';
    } else if (scheme == 'day') {
        document.documentElement.style.setProperty('--background-color', rootStyle.getPropertyValue('--background-color-day'));
        document.documentElement.style.setProperty('--standout-background-color', rootStyle.getPropertyValue('--standout-background-color-day'));
        document.documentElement.style.setProperty('--strong-foreground', rootStyle.getPropertyValue('--strong-foreground-day'));
        document.documentElement.style.setProperty('--light-foreground', rootStyle.getPropertyValue('--light-foreground-day'));
        global_currentColorScheme = 'day';
    }

    refreshAfter && refresh();
}

function allUnique(list) {
    return list.length === new Set(list).size;
}

function guessDaysAsIntervals() {
    let mdtimes = getMultiDoses().entries.map(entry => entry.time);
    if (allUnique(mdtimes)) {
        document.getElementById('dropdown-daysinput').value = 'absolute';
        global_daysAsIntervals = false;
    } else {
        document.getElementById('dropdown-daysinput').value = 'intervals';
        global_daysAsIntervals = true;
    }
}

function loadCSV(files) {
    if (files.length > 0) {
        let file = files[0];
        let reader = new FileReader();

        reader.onload = (event) => {
            Papa.parse(event.target.result, {
                complete: function (results) {
                    deleteAllRows('multidose-table');
                    results.data.forEach(([dose, time, model]) => {
                        let delivtype = findIntersecting(Object.keys(modelList), model);
                        if (isValidInput(dose, time, delivtype)) {
                            addTDMRow('multidose-table', parseFloat(dose), parseFloat(time), delivtype);
                        }
                    });
                    guessDaysAsIntervals();
                    addRowIfNeeded('multidose-table');
                    refresh();
                }
            });
        };

        reader.readAsText(file);
    }
}

function exportCSV() {
    let table = document.getElementById('multidose-table');
    let rows = Array.from(table.rows);
    let data = [['dose', 'days', 'model']].concat(rows.slice(1).map(row => {
        let doseValue = row.cells[2].querySelector('input').value;
        let timeValue = row.cells[3].querySelector('input').value;
        let modelValue = row.cells[4].querySelector('select').value;
        return [timeValue, doseValue, modelValue];
    }));
    let csvContent = Papa.unparse(data);

    let downloadLink = document.createElement('a');
    downloadLink.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvContent);
    downloadLink.download = 'multidose-table.csv';

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

function isValidInput(dose, time, model) {
    return (
        !isNaN(parseFloat(dose))
     && !isNaN(parseFloat(time))
     && parseFloat(dose) >= 0   // 0 doses are valid after all
     && !!findIntersecting(Object.keys(modelList), model) 
        // We need the !! because JS, in its infinite wisdom,
        // is otherwise returning the string returned by findIntersecting 
        // instead of the result of the boolean expression.
        // Apparently boolean expressions can return strings now.
     );
}

function isValidRow(row) {
    let dose = row.cells[2].querySelector('input').value;
    let time = row.cells[3].querySelector('input').value;
    let model = row.cells[4].querySelector('select').value;
    return isValidInput(dose, time, model);
}

function readRow(row, keepVisibilities = true, keepInvalid = false) {

    let curveVisibleCheckBox = row.cells[0].querySelector('input');
    let curveVisible = curveVisibleCheckBox ? curveVisibleCheckBox.checked : null;
    let uncertaintyVisibleCheckBox = row.cells[1].querySelector('input');
    let uncertaintyVisible = uncertaintyVisibleCheckBox ? uncertaintyVisibleCheckBox.checked : null;

    let dose = row.cells[2].querySelector('input').value;
    let time = row.cells[3].querySelector('input').value;
    let model = row.cells[4].querySelector('select').value;

    if (isValidInput(dose, time, model) || keepInvalid) {
        let rowEntry = { dose: parseFloat(dose) , time: parseFloat(time), model: model };
        if (curveVisible !== null && keepVisibilities) { rowEntry.curveVisible = curveVisible; };
        if (uncertaintyVisible !== null && keepVisibilities) { rowEntry.uncertaintyVisible = uncertaintyVisible; };
        return rowEntry;
    } else {
        return null;
    }
}

function convertEntriesToInvervalDays(refreshAfter = true) {

    let multiDoseTable = getMultiDoses();
    let sortedEntries = multiDoseTable.entries.sort((a, b) => a.time - b.time);

    deleteAllRows('multidose-table');
    sortedEntries.forEach(entry => {
        addTDMRow('multidose-table', entry.dose, entry.time, entry.model);
    });

    let previousTime = null;
    Array.from(document.getElementById('multidose-table').rows).slice(1).forEach(row => {
        if (isValidRow(row)) {
            let time = parseFloat(row.cells[3].querySelector('input').value);
            if (previousTime !== null) {
                row.cells[3].querySelector('input').value = time - previousTime;
            }
            previousTime = time;
        }
    });

    setDaysAsIntervals(false);

    refreshAfter && refresh();
}

function convertEntriesToAbsoluteDays(refreshAfter = true) {
    let previousTime = null;
    Array.from(document.getElementById('multidose-table').rows).slice(1).forEach(row => {
        if (isValidRow(row)) {
            let time = parseFloat(row.cells[3].querySelector('input').value);
            if (previousTime !== null) {
                row.cells[3].querySelector('input').value = time + previousTime;
                previousTime = time + previousTime;
            } else {
                previousTime = time;
            }
        }
    });

    setDaysAsAbsolute(false);

    refreshAfter && refresh();
}


function getMultiDoses(keepInvalid = false) {
    let multiDoses = {};

    let multiDoseTable = document.getElementById('multidose-table');

    let firstRowEntry = readRow(multiDoseTable.rows[1], true, true);
    multiDoses.curveVisible = firstRowEntry.curveVisible
    multiDoses.uncertaintyVisible = firstRowEntry.uncertaintyVisible
    multiDoses.daysAsIntervals = global_daysAsIntervals;

    // Read entries, ignore visibilities
    multiDoses.entries = Array.from(multiDoseTable.rows).slice(1)
                              .map(row => readRow(row, false, keepInvalid))
                              .filter(entry => entry !== null);

    return multiDoses
}

function getSteadyStates(keepInvalid = false) {
    let steadyStates = {};
    
    let steadyStateTable = document.getElementById('steadystate-table');
    steadyStates.entries = Array.from(steadyStateTable.rows).slice(1)
                                .map(row => readRow(row, true, keepInvalid))
                                .filter(entry => entry !== null);

    return steadyStates;
}

export function getTDMs(keepInvalid = false) {

    return { 
        multidoses: getMultiDoses(keepInvalid), 
        steadystates: getSteadyStates(keepInvalid)
    };

}

function guessNextRow(tableID) {
    let table = document.getElementById(tableID);
    if (table.rows.length >= 4 && !global_daysAsIntervals) {
        let beforeLastRow = readRow(table.rows[table.rows.length - 3]);
        let lastRow = readRow(table.rows[table.rows.length - 2]);
        if (beforeLastRow && lastRow) {
            if (table.rows.length >= 5) {
                
                let beforeBeforeLastRow = readRow(table.rows[table.rows.length - 4]);
                if (beforeBeforeLastRow
                    && (lastRow.dose === beforeBeforeLastRow.dose)
                    && (lastRow.dose !== beforeLastRow.dose)) {
                    let dose = beforeLastRow.dose;
                    let timeDifference = beforeLastRow.time - beforeBeforeLastRow.time;
                    let model = beforeLastRow.model;
                    return { dose: dose, time: lastRow.time + timeDifference, model: model };
                }
            }
            if (lastRow.model == beforeLastRow.model) {
                let doseDifference = lastRow.dose - beforeLastRow.dose;
                let timeDifference = lastRow.time - beforeLastRow.time;
                let model = lastRow.model;
                return {dose: lastRow.dose + doseDifference, time: lastRow.time + timeDifference, model: model };
            }
        }
    } else if (table.rows.length >= 3 && global_daysAsIntervals) {
        // if days are given as intervals just repeat the last row
        let lastRow = readRow(table.rows[table.rows.length - 2]);
        return lastRow;
    }
    return null;
}


function addTDMRow(tableID, dose = null, time = null, model = null, curveVisible = true, uncertaintyVisible = true) {

    let table = document.getElementById(tableID);
    let row = table.insertRow(-1);

    rowValidity.set(row, isValidInput(dose, time, model));

    // Add visibility and uncertainty checkboxes
    let visibilityCell = row.insertCell(0);
    visibilityCell.className = 'visibility-cell';

    if (tableID == 'steadystate-table' || ((tableID == 'multidose-table') && (table.rows.length == 2))) {
        let visibilityCheckboxState = document.createElement('input');
        visibilityCheckboxState.type = 'checkbox';
        visibilityCheckboxState.className = 'hidden-checkbox-state';
        visibilityCheckboxState.checked = curveVisible;
        visibilityCell.appendChild(visibilityCheckboxState);

        let visibilityCustomCheckbox = document.createElement('div');
        visibilityCustomCheckbox.className = visibilityCheckboxState.checked ? 'custom-checkbox checked-style' : 'custom-checkbox';
        visibilityCustomCheckbox.title = "Turn visibility of curve on/off";
        visibilityCustomCheckbox.onmousedown = function() {
            visibilityCheckboxState.checked = !visibilityCheckboxState.checked;
            this.className = visibilityCheckboxState.checked ? 'custom-checkbox checked-style' : 'custom-checkbox';
            refresh();
        };
        visibilityCell.appendChild(visibilityCustomCheckbox);
    }

    let uncertaintyCell = row.insertCell(1);
    uncertaintyCell.className = 'uncertainty-cell';

    if (tableID == 'steadystate-table' || ((tableID == 'multidose-table') && (table.rows.length == 2))) {

        let uncertaintyCheckboxState = document.createElement('input');
        uncertaintyCheckboxState.type = 'checkbox';
        uncertaintyCheckboxState.className = 'hidden-checkbox-state';
        uncertaintyCheckboxState.checked = uncertaintyVisible;
        uncertaintyCell.appendChild(uncertaintyCheckboxState);

        let uncertaintyCustomCheckbox = document.createElement('div');
        uncertaintyCustomCheckbox.className = uncertaintyCheckboxState.checked ? 'custom-checkbox checked-style' : 'custom-checkbox';
        uncertaintyCustomCheckbox.title = 'Turn visibility of uncertainty cloud on/off';
        uncertaintyCustomCheckbox.onmousedown = function() {
            uncertaintyCheckboxState.checked = !uncertaintyCheckboxState.checked;
            this.className = uncertaintyCheckboxState.checked ? 'custom-checkbox checked-style' : 'custom-checkbox';
            refresh();
        };
        uncertaintyCell.appendChild(uncertaintyCustomCheckbox);
    }

    let doseCell = row.insertCell(2);
    let doseInput = document.createElement('input');
    doseInput.classList.add('flat-input', 'dose-input');
    doseInput.setAttribute('type', 'text');

    doseCell.appendChild(doseInput);
    // Set given dose or empty string as default value (prevents NaNs)
    doseInput.value = dose || '';
    doseInput.addEventListener('input', function() {

        let myRow = this.parentElement.parentElement;
        let previousValidity = rowValidity.get(myRow);
        let currentValidity = Boolean(isValidRow(myRow));

        if ((currentValidity !== previousValidity) || currentValidity) {
            rowValidity.set(myRow, currentValidity);
            refresh();
        }

        addRowIfNeeded(tableID);
    });

    let timeCell = row.insertCell(3);
    let timeInput = document.createElement('input');
    timeInput.classList.add('flat-input')
    timeInput.setAttribute('type', 'text');

    if (tableID == 'multidose-table') {
        timeInput.classList.add('time-input-multidose');
        timeInput.placeholder = global_daysAsIntervals ? 'since -1' : 'since 0';
    }
    else if (tableID == 'steadystate-table') {
        timeInput.classList.add('time-input-steadystate');
        timeInput.placeholder = '# days';
    };

    timeCell.appendChild(timeInput);

    if (time !== null) {
        timeInput.value = time;
    }

    timeInput.addEventListener('input', function() {
        let myRow = this.parentElement.parentElement;
        let previousValidity = rowValidity.get(myRow);
        let currentValidity = Boolean(readRow(myRow, false));

        if ((currentValidity !== previousValidity) || currentValidity) {
            rowValidity.set(myRow, currentValidity);
            refresh();
        }

        addRowIfNeeded(tableID);
    });

    let modelCell = row.insertCell(4);
    let modelSelect = document.createElement('select');
    modelSelect.classList.add('dropdown-model');

    // Fill model dropdown with models
    Object.entries(modelList).forEach(([key, {units, description}]) => {
        let option = document.createElement('option');
        option.value = key;
        option.text = key.toLowerCase();
        option.title = description;
        modelSelect.appendChild(option);
    });
    modelCell.appendChild(modelSelect);

    if (model !== null) {
        modelSelect.value = model;
    } else {
        // If no model is specified and there are
        // more than one row in the table, add
        // the same model as the one before
        if (table.rows.length > 2) {
            model = table.rows[table.rows.length - 2].cells[4].querySelector('select').value;
            modelSelect.value = model;
        }
    }

    doseInput.placeholder = modelList[modelSelect.value].units;

    modelSelect.addEventListener('change', function() {

        let newModel = this.value;
        let newUnits = modelList[newModel].units;
        doseInput.placeholder = newUnits;

        if (readRow(row)) {
            refresh();
        }
    });

    let deleteCell = row.insertCell(5);
    if (tableID == 'steadystate-table' || (tableID == 'multidose-table' && table.rows.length > 2)) {

        let deleteButton = document.createElement('button');
        deleteButton.classList.add('flat-button', 'delete-button');
        deleteButton.setAttribute('title', 'Delete this entry');
        deleteButton.textContent = '-';

        deleteCell.appendChild(deleteButton);

        deleteButton.addEventListener('click', function() {
            let myRow = this.parentNode.parentNode;
            let myTable = myRow.parentNode.parentNode;

            rowValidity.delete(myRow);
            myRow.remove();

            if (myTable.rows.length < 2) {
                addTDMRow(myTable.id);
            }

            addRowIfNeeded(tableID);

            refresh();
        });
    }

    // Run addRowIfNeeded() after this row has been added
    setTimeout(() => {addRowIfNeeded(tableID)});

    return row;
}

function deleteAllRows(tableID) {
    let table = document.getElementById(tableID);
    while (table.rows.length > 1) {
        rowValidity.delete(table.rows[table.rows.length - 1]);
        table.deleteRow(-1);
    }
}

function setUnits(units, refreshPlot = true) {
    if (units === 'pg/mL') {
        global_units = units
        global_conversionFactor = 1.0;
        document.getElementById('dropdown-units').value = 'pg/mL';
    } else if (units === 'pmol/L') {
        global_units = units
        global_conversionFactor = 3.6713;
        document.getElementById('dropdown-units').value = 'pmol/L';
    }
    refreshPlot && refresh();
}

function setDaysAsIntervals(refreshPlot = true) {
    global_daysAsIntervals = true;
    document.getElementById('dropdown-daysinput').value = 'intervals';

    let timeInputs = document.querySelectorAll('.time-input-multidose');
    timeInputs.forEach(input => {
        input.placeholder = 'since -1';
    });

    refreshPlot && refresh();
}

function setDaysAsAbsolute(refreshPlot = true) {
    global_daysAsIntervals = false;
    document.getElementById('dropdown-daysinput').value = 'absolute';

    let timeInputs = document.querySelectorAll('.time-input-multidose');
    timeInputs.forEach(input => {
        input.placeholder = 'since 0';
    });

    refreshPlot && refresh();
}

function turnMenstrualCycleOn(refreshPlot = true) {
    let mcButton = document.getElementById('menstrual-cycle-button');
    mcButton.classList.add('button-on');
    global_menstrualCycleVisible = true;
    refreshPlot && refresh();
}

function turnMenstrualCycleOff(refreshPlot = true) {
    let mcButton = document.getElementById('menstrual-cycle-button');
    mcButton.classList.remove('button-on');
    global_menstrualCycleVisible = false;
    refreshPlot && refresh();
}

function turnTargetRangeOn(refreshPlot = true) {
    let trButton = document.getElementById('target-range-button');
    trButton.classList.add('button-on');
    global_targetRangeVisible = true;
    refreshPlot && refresh();
}

function turnTargetRangeOff(refreshPlot = true) {
    let trButton = document.getElementById('target-range-button');
    trButton.classList.remove('button-on');
    global_targetRangeVisible = false;
    refreshPlot && refresh();
}

function attachMenstrualCycleButtonEvent() {
    let mcButton = document.getElementById('menstrual-cycle-button');

    mcButton.addEventListener('mousedown', () => {
        if (global_menstrualCycleVisible) {
            turnMenstrualCycleOff();
        } else {
            turnMenstrualCycleOn();
        }
    });
}

function attachTargetRangeButtonEvent() {
    let button = document.getElementById('target-range-button');
    button.addEventListener('mousedown', () => {
        if (global_targetRangeVisible) {
            turnTargetRangeOff();
        } else {
            turnTargetRangeOn();
        }
    });
}

function attachDragNDropImport() {

    let dragNDropZone = document.getElementById('dragndrop-zone');

    dragNDropZone.addEventListener('dragenter', () => {
        dragNDropZone.classList.add('overlay');
    });

    dragNDropZone.addEventListener('dragleave', (event) => {
        if (event.relatedTarget === null || !dragNDropZone.contains(event.relatedTarget)) {
            dragNDropZone.classList.remove('overlay');
        }
    });

    dragNDropZone.addEventListener('dragover', (event) => {
        event.preventDefault();
    });

    dragNDropZone.addEventListener('drop', (event) => {
        event.preventDefault();
        dragNDropZone.classList.remove('overlay');
        let files = event.dataTransfer.files;
        loadCSV(files);
    });

}

function attachMultidoseButtonsEvents() {

    let guessButton = document.getElementById('guess-button');

    guessButton.addEventListener('mousedown', () => {
        let guess = guessNextRow('multidose-table');

        if (guess) {
            guessButton.classList.add('button-on');
            setRowParameters('multidose-table', -1, guess.dose, guess.time, guess.model);
            refresh();
        } else {
            guessButton.innerHTML = '&nbsp;?._.)&nbsp;&nbsp;';

            setTimeout(() => {
                guessButton.innerHTML = 'autofill';
                guessButton.classList.remove('button-on');
            }, 500);
        }
    });
    guessButton.addEventListener('mouseup', () => {
        guessButton.classList.remove('button-on');
    });

    let clearDoseButton = document.getElementById('clear-doses-button');

    clearDoseButton.addEventListener('mousedown', () => {
        clearDoseButton.classList.add('button-on');
        deleteAllRows('multidose-table');
        addTDMRow('multidose-table');
        refresh();
    });
    clearDoseButton.addEventListener('mouseup', () => {
        clearDoseButton.classList.remove('button-on');
    });

    let shareButton = document.getElementById('share-button');

    shareButton.addEventListener('mousedown', () => {
        navigator.clipboard.writeText(generateShareURL());

        shareButton.classList.add('button-on');
        shareButton.innerHTML = '&nbsp;copied!&nbsp;<div class="floating-text small-text" style="color: black">Praise Zalgo!</div>';

        setTimeout(() => {
            shareButton.classList.remove('button-on');
            shareButton.innerHTML = 'share url';
        }, 500);
    });

    let exportCSVButton = document.getElementById('export-csv-button');

    exportCSVButton.addEventListener('mousedown', () => {
        exportCSVButton.classList.add('button-on');
        exportCSV();
    });
    exportCSVButton.addEventListener('mouseup', () => {
        exportCSVButton.classList.remove('button-on');
    });

    // No toggle-on/off style. Makes it compatible with safari
    // and the dialog acts as feedback anyway so it's ok.
    let importCSVButton = document.getElementById('import-csv-dialog')

    importCSVButton .addEventListener('mousedown', () => {
        document.getElementById('csv-file').click();
    });

    document.getElementById('csv-file').addEventListener('change', (e) => {
        loadCSV(e.target.files);
    });
}

function attachSteadyStateButtonsEvents() {

    let clearSteadyStateButton = document.getElementById('clear-steadystates-button')

    clearSteadyStateButton.addEventListener('mousedown', () => {
        clearSteadyStateButton.classList.add('button-on');
        deleteAllRows('steadystate-table');
        addTDMRow('steadystate-table');
        refresh();
    });

    clearSteadyStateButton.addEventListener('mouseup', () => {
        clearSteadyStateButton.classList.remove('button-on');
    });
}

function themeSetup() {

    let currentHour = new Date().getHours();

    if (currentHour >= 6 && currentHour < 18) {
        document.getElementById('nightday-state').checked = true;
        setColorScheme('day', false);
    } else {
        document.getElementById('nightday-state').checked = false;
        setColorScheme('night', false);
    }

    document.getElementById('nightday-state').addEventListener('change', (event) => {
        if (event.target.checked) {
            setColorScheme('day', false);
        } else {
            setColorScheme('night', false);
        }
    });

}

function attachOptionsEvents() {

    document.getElementById('dropdown-units').addEventListener('change', (event) => {
        setUnits(event.target.value)
    });

    document.getElementById('dropdown-daysinput').addEventListener('change', (event) => {
        if (event.target.value === 'convert') {
            (global_daysAsIntervals) ? convertEntriesToAbsoluteDays() : convertEntriesToInvervalDays();
        } else {
            (event.target.value === 'intervals') ? setDaysAsIntervals() : setDaysAsAbsolute();
        }
    });

}

export function saveToLocalStorage() {

    localStorage.setItem('estrannaiseOptions', JSON.stringify({
        menstrualCycleVisible: global_menstrualCycleVisible,
        targetRangeVisible: global_targetRangeVisible,
        units: global_units,
        daysAsIntervals: global_daysAsIntervals
    }));
    localStorage.setItem('estrannaiseDataset', JSON.stringify(getTDMs(true, true)));

}

export function loadFromLocalStorage() {

    let options = JSON.parse(localStorage.getItem('estrannaiseOptions'));
    let dataset = JSON.parse(localStorage.getItem('estrannaiseDataset'));

    if (options) {
        setUnits(options.units, false);
        options.menstrualCycleVisible ? turnMenstrualCycleOn(false) : turnMenstrualCycleOff(false);
        options.targetRangeVisible ? turnTargetRangeOn(false) : turnTargetRangeOff(false);
        options.daysAsIntervals ? setDaysAsIntervals(false) : setDaysAsAbsolute(false);
    }

    if (dataset) {
        deleteAllRows('multidose-table');
        dataset.multidoses.entries.forEach((entry, i) => {
            addTDMRow('multidose-table', entry.dose, entry.time, entry.model, dataset.multidoses.curveVisible, dataset.multidoses.uncertaintyVisible);
        });

        deleteAllRows('steadystate-table');
        dataset.steadystates.entries.forEach(entry => {
            addTDMRow('steadystate-table', entry.dose, entry.time, entry.model, entry.curveVisible, entry.uncertaintyVisible);
        });

    }
    
    (options || dataset) && refresh();

}

export function deleteLocalStorage() {
    localStorage.clear();
}

function generateShareURL() {

    let multiDoseTable = getMultiDoses(true, true);
    let steadyStateTable = getSteadyStates(true, true);

    let mdCurveVisibleColumn = multiDoseTable.entries.map(entry => null);
    mdCurveVisibleColumn[0] = multiDoseTable.curveVisible;
    let mdUncertaintyVisibleColumn = multiDoseTable.entries.map(entry => null);
    mdUncertaintyVisibleColumn[0] = multiDoseTable.uncertaintyVisible;
    let mdDoseColumn = multiDoseTable.entries.map(entry => entry.dose);
    let mdTimeColumn = multiDoseTable.entries.map(entry => entry.time);
    let mdMethodColumn = multiDoseTable.entries.map(entry => entry.model);

    multiDoseTable = [mdTimeColumn, mdDoseColumn, mdMethodColumn, mdCurveVisibleColumn, mdUncertaintyVisibleColumn];

    let ssCurveVisibleColumn = steadyStateTable.entries.map(entry => entry.curveVisible);
    let ssUncertaintyVisibleColumn = steadyStateTable.entries.map(entry => entry.uncertaintyVisible);
    let ssDoseColumn = steadyStateTable.entries.map(entry => entry.dose);
    let ssTimeColumn = steadyStateTable.entries.map(entry => entry.time);
    let ssMethodColumn = steadyStateTable.entries.map(entry => entry.model);

    steadyStateTable = [ssTimeColumn, ssDoseColumn, ssMethodColumn, ssCurveVisibleColumn, ssUncertaintyVisibleColumn];

    let params = new URLSearchParams();
    params.set('multiDoseTable', JSON.stringify(multiDoseTable));
    params.set('steadyStateTable', JSON.stringify(steadyStateTable));
    params.set('menstrualCycleVisible', global_menstrualCycleVisible);
    params.set('targetRangeVisible', global_targetRangeVisible);
    params.set('units', global_units);
    params.set('daysAsIntervals', global_daysAsIntervals);

    return window.location.origin + window.location.pathname + '#' + btoa(params.toString());
}

function isValidBase64(str) {
    const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
    return !!str && base64Regex.test(str);
}

function loadFromURL() {

    let hashString = window.location.hash.substring(1);

    if (!hashString) {
        return false;
    }

    let dataLoaded = false;

    if (isValidBase64(hashString)) {

        let hashParams = new URLSearchParams(atob(hashString));

        let multiDoseTable = JSON.parse(hashParams.get('multiDoseTable'));
        let steadyStateTable = JSON.parse(hashParams.get('steadyStateTable'));

        if (multiDoseTable) {
            deleteAllRows('multidose-table');
            for (let i = 0; i < multiDoseTable[0].length; i++) {
                addTDMRow('multidose-table', multiDoseTable[1][i], multiDoseTable[0][i], multiDoseTable[2][i], multiDoseTable[3][i], multiDoseTable[4][i]);
            }
            dataLoaded = true;
        }

        if (steadyStateTable) {
            deleteAllRows('steadystate-table');
            for (let i = 0; i < steadyStateTable[0].length; i++) {
                addTDMRow('steadystate-table', steadyStateTable[1][i], steadyStateTable[0][i], steadyStateTable[2][i], steadyStateTable[3][i], steadyStateTable[4][i]);
            }
            dataLoaded = true;
        }

        if (hashParams.get('menstrualCycleVisible') === 'true') {
            turnMenstrualCycleOn(false);
        } else {
            turnMenstrualCycleOff(false);
        }

        if (hashParams.get('targetRangeVisible') === 'true') {
            turnTargetRangeOn(false);
        } else {
            turnTargetRangeOff(false);
        }

        if (hashParams.has('daysAsIntervals')) {
            if (hashParams.get('daysAsIntervals') === 'true') {
                setDaysAsIntervals(false);
            } else {
                setDaysAsAbsolute(false);
            };
        } else {
            guessDaysAsIntervals();
        }

        hashParams.has('units') && setUnits(hashParams.get('units'), false);

    }
    return dataLoaded;
}

function addRowIfNeeded(tableID) {
    let table = document.getElementById(tableID);
    // Add new row if the last row is valid
    if (isValidRow(table.rows[table.rows.length - 1])) {
        addTDMRow(tableID);
    }
}

function setRowParameters(tableID, number, dose, time, model) {
    let table = document.getElementById(tableID);

    // Treat negative numbers as reverse order
    let rowNumber = number;
    if (number < 0) {
        rowNumber = table.rows.length + number;
    }

    let row = table.rows[rowNumber];

    let doseInput = row.cells[2].querySelector('input');
    let timeInput = row.cells[3].querySelector('input');
    let modelInput = row.cells[4].querySelector('select');

    doseInput.value = dose;
    timeInput.value = time;
    modelInput.value = model;

    addRowIfNeeded(tableID);
}

/**
 * At startup, apply the "default" preset defined so the user isn't presented
 * with a blank slate and can see what's possible.
 */
function initializeDefaultPreset() {
    applyPreset(Presets.default, false);
}

/**
 * Provide an event handler whenever the user selects a preset
 */
function attachPresetsDropdown() {
    let presetDropdown = document.getElementById('dropdown-presets');

    presetDropdown.addEventListener('change', function(event) {
        if(!Presets[this.value]) {
            console.error('Found an unknown preset value!');
            return;
        }
        applyPreset(Presets[this.value]);
    });
}

/**
 * Apply the preset configuration to the tables, and refresh the graph
 * @param {Object} presetConfig
 */
function applyPreset(presetConfig, refreshAfter = true) {
    deleteAllRows('multidose-table');
    deleteAllRows('steadystate-table');

    presetConfig.menstrualCycle ? turnMenstrualCycleOn(false) : turnMenstrualCycleOff(false);
    presetConfig.intervalDays ? setDaysAsIntervals(false) : setDaysAsAbsolute(false);

    if (presetConfig.steady.length) {
        presetConfig.steady.forEach(steadyDose => {
            addTDMRow('steadystate-table', ...steadyDose);
        });
    } else {
        addTDMRow('steadystate-table');
    }

    if (presetConfig.multi.length) {
        presetConfig.multi.forEach(multiDose => {
            addTDMRow('multidose-table', ...multiDose);
        });
    } else {
        addTDMRow('multidose-table');
    }

    refreshAfter && refresh();
}