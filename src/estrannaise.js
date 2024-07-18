import {
    plotCurves,
    generatePlottingOptions,
    wongPalette,
 } from './plotting.js';

import {
    availableUnits,
    modelList,
 } from './models.js';

import { Presets } from './presets.js';

// This is used to determine whether to refresh after each input event
// Only refresh when a row goes from invalid to valid or vis-versa
const rowValidity = new Map();

let global_daysAsIntervals = true;
let global_currentColorScheme = 'day';
let resizeTimeout;

const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
const isMobile = window.matchMedia('(pointer: coarse), (pointer: none)').matches || /Mobi|Android/i.test(navigator.userAgent);

window.addEventListener('DOMContentLoaded', () => {

    setupUnitsDropdown()
    setupDaysInputEvents();

    setupPresetsDropdown();

    setupMenstrualCycleButtonEvent();
    setupTargetRangeButtonEvent();

    setupShareURLButtonEvent();

    setupMultidoseButtonsEvents();
    setupSteadyStateButtonsEvents();

    setupDragNDropImport();

    setupResizeRefresh();

    themeSetup();

    if (!loadFromURL() && !loadFromLocalStorage()) {
        initializeDefaultPreset();
    }

    refresh();
});

function refresh(save = false) {

    let graph = plotCurves(
        getTDMs(),
        getCurrentPlottingOptions(),
        false);
    let plot = document.getElementById('plot-region');
    plot.innerHTML = '';
    plot.append(graph);

    if (save) {
        saveToLocalStorage();
        console.log(localStorage.getItem('stateString'));
    }

}

export function getCurrentPlottingOptions() {
    let rootStyle = getComputedStyle(document.documentElement);
    let backgroundColor = rootStyle.getPropertyValue('--background-color');
    let strongForegroundColor = rootStyle.getPropertyValue('--strong-foreground');
    let softForegroundColor = rootStyle.getPropertyValue('--soft-foreground');

    let menstrualCycleVisible = isButtonOn('menstrual-cycle-button');
    let targetRangeVisible = isButtonOn('target-range-button');
    let units = document.getElementById('dropdown-units').value;

    let numberOfLinePoints = 1000;
    let numberOfCloudPoints = 3500;
    let pointCloudSize = 1.3;
    let pointCloudOpacity = 0.4;
    let fontSize = "0.9rem";
    let strokeWidth = 2;
    let aspectRatio = 0.43;

    if (isSmallScreen || isMobile) {
        fontSize = "1.6rem";
        aspectRatio = 0.55;
        strokeWidth = 4;
        pointCloudOpacity = 0.4;
        pointCloudSize = 2.1;
    }
    
    if (isMobile) {
        pointCloudSize = 3.5;
        /* And let's ease off a bit on the
           computational burden when on mobile.
           It was a bit sluggish on my Pixel 5 */
        numberOfCloudPoints = 900;
    }

    return generatePlottingOptions(
        {menstrualCycleVisible: menstrualCycleVisible,
        targetRangeVisible: targetRangeVisible,
        units: units,
        strokeWidth: strokeWidth,
        numberOfLinePoints: numberOfLinePoints,
        numberOfCloudPoints: numberOfCloudPoints,
        pointCloudSize: pointCloudSize,
        pointCloudOpacity: pointCloudOpacity,
        currentColorscheme: global_currentColorScheme,
        backgroundColor: backgroundColor,
        strongForegroundColor: strongForegroundColor,
        softForegroundColor: softForegroundColor,
        fontSize: fontSize,
        aspectRatio: aspectRatio
    });
}

// Find the first element in list that contains str or is contained in str (case insensitive)
function findIntersecting(list, str) {
    return list.find(el => el.toLowerCase().includes(str.toLowerCase()) || str.toLowerCase().includes(el.toLowerCase()));
}

function isValidBase64(str) {
    const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
    return !!str && base64Regex.test(str);
}

function dropNaNAndFix(value, precision = 3) {
    if (!isNaN(value)) {
        return parseFloat(value.toFixed(precision));
    } else {
        return '';
    }
}

function setColorScheme(scheme = 'night', refreshAfter = false) {
    let rootStyle = getComputedStyle(document.documentElement);
    let s = document.documentElement.style

    if (scheme == 'night') {
        s.setProperty('--background-color', rootStyle.getPropertyValue('--background-color-night'));
        s.setProperty('--standout-background-color', rootStyle.getPropertyValue('--standout-background-color-night'));
        s.setProperty('--soft-foreground', rootStyle.getPropertyValue('--soft-foreground-night'));
        s.setProperty('--strong-foreground', rootStyle.getPropertyValue('--strong-foreground-night'));
        global_currentColorScheme = 'night';
    } else if (scheme == 'day') {
        s.setProperty('--background-color', rootStyle.getPropertyValue('--background-color-day'));
        s.setProperty('--standout-background-color', rootStyle.getPropertyValue('--standout-background-color-day'));
        s.setProperty('--soft-foreground', rootStyle.getPropertyValue('--soft-foreground-day'));
        s.setProperty('--strong-foreground', rootStyle.getPropertyValue('--strong-foreground-day'));
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

function generateEnum(object) {
    let enumObject = {};
    Object.keys(object).forEach((key, idx) => {
        enumObject[enumObject[idx] = key] = idx;
    });
    return enumObject
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
        return [doseValue, timeValue, modelValue];
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

function isButtonOn(buttonID) {
    let button = document.getElementById(buttonID);
    return button.classList.contains('button-on');
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
    };
}

function convertEntriesToInvervalDays() {

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

    // no need to refresh
    setDaysAsIntervals(false);

}

function convertEntriesToAbsoluteDays() {
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

    // no need to refresh
    setDaysAsAbsolute(false);

}

function multiDosesVisibilities() {
    let multiDoseTable = document.getElementById('multidose-table');
    let firstRowEntry = readRow(multiDoseTable.rows[1], true, true);
    return [firstRowEntry.curveVisible, firstRowEntry.uncertaintyVisible]
}

function getMultiDoses(keepInvalid = false, passColor = true) {
    let multiDoses = {};

    let multiDoseTable = document.getElementById('multidose-table');

    [multiDoses.curveVisible, multiDoses.uncertaintyVisible] = multiDosesVisibilities();

    multiDoses.daysAsIntervals = global_daysAsIntervals;
    if (passColor) { multiDoses.color = wongPalette(4); }

    // Read entries, ignore visibilities
    multiDoses.entries = Array.from(multiDoseTable.rows).slice(1)
                              .map(row => readRow(row, false, keepInvalid))
                              .filter(entry => entry !== null);

    return multiDoses
}

function getSteadyStates(keepInvalid = false, passColor = true) {
    let steadyStates = {};

    let steadyStateTable = document.getElementById('steadystate-table');
    steadyStates.entries = Array.from(steadyStateTable.rows).slice(1)
                                .map((row, idx) => {
                                    let entry = readRow(row, true, keepInvalid);
                                    if (entry && passColor) { entry.color = wongPalette(5 + idx); }
                                    return entry;
                                }).filter(entry => entry !== null);

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

    row.className = tableID + '-input-row';

    rowValidity.set(row, isValidInput(dose, time, model));

    let visibilityCell = row.insertCell(0);
    visibilityCell.className = 'visibility-cell';

    let uncertaintyCell = row.insertCell(1);
    uncertaintyCell.className = 'uncertainty-cell';

    if (tableID == 'steadystate-table' || ((tableID == 'multidose-table') && (table.rows.length == 2))) {

        //////////////////////////
        /// Visibility checkbox //
        //////////////////////////
        let visibilityCheckboxState = document.createElement('input');
        visibilityCheckboxState.type = 'checkbox';
        visibilityCheckboxState.className = 'hidden-checkbox-state';
        visibilityCheckboxState.checked = curveVisible;
        visibilityCell.appendChild(visibilityCheckboxState);

        let visibilityCustomCheckbox = document.createElement('div');
        visibilityCustomCheckbox.className = 'custom-checkbox';

        if (tableID == 'multidose-table') {
            visibilityCustomCheckbox.style.backgroundColor = (visibilityCheckboxState.checked) ? wongPalette(4) : '';
        } else if (tableID == 'steadystate-table') {
            visibilityCustomCheckbox.style.backgroundColor = (visibilityCheckboxState.checked) ? wongPalette(4 + row.rowIndex) : '';
        }

        visibilityCustomCheckbox.title = "Turn visibility of curve on/off";
        visibilityCustomCheckbox.onmousedown = function() {
            visibilityCheckboxState.checked = !visibilityCheckboxState.checked;
            if (tableID == 'multidose-table') {
                visibilityCustomCheckbox.style.backgroundColor = (visibilityCheckboxState.checked) ? wongPalette(4) : '';
            } else if (tableID == 'steadystate-table') {
                visibilityCustomCheckbox.style.backgroundColor = (visibilityCheckboxState.checked) ? wongPalette(4 + row.rowIndex) : '';
            }
            (rowValidity.get(row) || (tableID == 'multidose-table' && row.rowIndex == 1)) && refresh();
        };
        visibilityCell.appendChild(visibilityCustomCheckbox);

        //////////////////////////
        // Uncertainty checkbox //
        //////////////////////////
        let uncertaintyCheckboxState = document.createElement('input');
        uncertaintyCheckboxState.type = 'checkbox';
        uncertaintyCheckboxState.className = 'hidden-checkbox-state';
        uncertaintyCheckboxState.checked = uncertaintyVisible;
        uncertaintyCell.appendChild(uncertaintyCheckboxState);

        let uncertaintyCustomCheckbox = document.createElement('div');
        uncertaintyCustomCheckbox.className = 'custom-checkbox';

        if (tableID == 'multidose-table') {
            uncertaintyCustomCheckbox.style.backgroundColor = (uncertaintyCheckboxState.checked) ? wongPalette(4) : '';
        } else if (tableID == 'steadystate-table') {
            uncertaintyCustomCheckbox.style.backgroundColor = (uncertaintyCheckboxState.checked) ? wongPalette(4 + row.rowIndex) : '';
        }

        uncertaintyCustomCheckbox.title = 'Turn visibility of uncertainty cloud on/off';
        uncertaintyCustomCheckbox.onmousedown = function() {
            uncertaintyCheckboxState.checked = !uncertaintyCheckboxState.checked;
            if (tableID == 'multidose-table') {
                uncertaintyCustomCheckbox.style.backgroundColor = uncertaintyCheckboxState.checked ? wongPalette(4) : '';
            } else if (tableID == 'steadystate-table') {
                uncertaintyCustomCheckbox.style.backgroundColor = uncertaintyCheckboxState.checked ? wongPalette(4 + row.rowIndex) : '';
            }
            (rowValidity.get(row) || (tableID == 'multidose-table' && row.rowIndex == 1)) && refresh();
        };
        uncertaintyCell.appendChild(uncertaintyCustomCheckbox);
    }

    //////////////////////////
    ////// Dose input ////////
    //////////////////////////
    let doseCell = row.insertCell(2);
    let doseInput = document.createElement('input');
    doseInput.classList.add('flat-input', 'dose-input');
    doseInput.setAttribute('type', 'text');

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

    doseCell.appendChild(doseInput);

    if (dose !== null) {
        doseInput.value = dose;
    }

    //////////////////////////
    ////// Time input ////////
    //////////////////////////
    let timeCell = row.insertCell(3);
    let timeInput = document.createElement('input');
    timeInput.classList.add('flat-input')
    timeInput.setAttribute('type', 'text');

    if (tableID == 'multidose-table') {
        timeInput.classList.add('time-input-multidose');
        timeInput.placeholder = global_daysAsIntervals ? 'since last' : 'since first';
    }
    else if (tableID == 'steadystate-table') {
        timeInput.classList.add('time-input-steadystate');
        timeInput.placeholder = 'num of days';
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


    //////////////////////////
    ///// Model dropdown /////
    //////////////////////////
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
    //////////////////////////

    //////////////////////////
    ///// Delete button //////
    //////////////////////////
    let deleteCell = row.insertCell(5);
    if (tableID == 'steadystate-table' || (tableID == 'multidose-table' && table.rows.length > 2)) {

        let deleteButton = document.createElement('button');
        deleteButton.classList.add('flat-button', 'delete-button');
        deleteButton.setAttribute('title', 'Delete this entry');
        deleteButton.textContent = '—';

        deleteCell.appendChild(deleteButton);

        deleteButton.addEventListener('click', function() {
            let myRow = this.parentNode.parentNode;
            let myTable = myRow.parentNode.parentNode;

            rowValidity.delete(myRow);
            myRow.className = '';
            myRow.remove();

            if (myTable.rows.length < 2) {
                addTDMRow(myTable.id);
            }

            addRowIfNeeded(tableID);

            // Reassign the right colors to the checkboxes
            if (tableID == 'steadystate-table') {
                let steadyStateRows = document.querySelectorAll('.steadystate-table-input-row');
                steadyStateRows.forEach(function(r) {
                    let curveCheckbox = r.cells[0].querySelector('.custom-checkbox');
                    let curveState = r.cells[0].querySelector('.hidden-checkbox-state');
                    curveCheckbox.style.backgroundColor = curveState.checked ? wongPalette(4 + r.rowIndex) : '';

                    let uncertCheckbox = r.cells[1].querySelector('.custom-checkbox');
                    let uncertState = r.cells[1].querySelector('.hidden-checkbox-state');
                    uncertCheckbox.style.backgroundColor = uncertState.checked ? wongPalette(4 + r.rowIndex) : '';
                });
            };

            refresh();
        });
    }
    //////////////////////////

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

function setDaysAsIntervals(refreshPlot = true) {
    global_daysAsIntervals = true;
    document.getElementById('dropdown-daysinput').value = 'intervals';

    let timeInputs = document.querySelectorAll('.time-input-multidose');
    timeInputs.forEach(input => {
        input.placeholder = 'since last';
    });

    refreshPlot && refresh();
}

function setDaysAsAbsolute(refreshPlot = true) {
    global_daysAsIntervals = false;
    document.getElementById('dropdown-daysinput').value = 'absolute';

    let timeInputs = document.querySelectorAll('.time-input-multidose');
    timeInputs.forEach(input => {
        input.placeholder = 'since first';
    });

    refreshPlot && refresh();
}

function turnMenstrualCycleOn(refreshPlot = true) {
    let mcButton = document.getElementById('menstrual-cycle-button');
    mcButton.classList.add('button-on');
    refreshPlot && refresh();
}

function turnMenstrualCycleOff(refreshPlot = true) {
    let mcButton = document.getElementById('menstrual-cycle-button');
    mcButton.classList.remove('button-on');
    refreshPlot && refresh();
}

function turnTargetRangeOn(refreshPlot = true) {
    let trButton = document.getElementById('target-range-button');
    trButton.classList.add('button-on');
    refreshPlot && refresh();
}

function turnTargetRangeOff(refreshPlot = true) {
    let trButton = document.getElementById('target-range-button');
    trButton.classList.remove('button-on');
    refreshPlot && refresh();
}

function setupMenstrualCycleButtonEvent() {
    let button = document.getElementById('menstrual-cycle-button');
    button.addEventListener('mousedown', () => {
        if (isButtonOn('menstrual-cycle-button')) {
            turnMenstrualCycleOff();
        } else {
            turnMenstrualCycleOn();
        }
    });
}

function setupTargetRangeButtonEvent() {
    let button = document.getElementById('target-range-button');
    button.addEventListener('mousedown', () => {
        if (isButtonOn('target-range-button')) {
            turnTargetRangeOff();
        } else {
            turnTargetRangeOn();
        }
    });
}

function setupDragNDropImport() {

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

function setupShareURLButtonEvent() {
    let shareButton = document.getElementById('share-button');

    shareButton.addEventListener('mousedown', () => {
        navigator.clipboard.writeText(generateSanerShareURL());

        shareButton.classList.add('button-on');
        shareButton.innerHTML = '&nbsp;copied!&nbsp;';

        setTimeout(() => {
            shareButton.classList.remove('button-on');
            shareButton.innerHTML = 'share url';
        }, 700);
    });
}

function setupMultidoseButtonsEvents() {

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

function setupSteadyStateButtonsEvents() {

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

/*
 Debounce and refresh on resize so that we send
 the new set of plotting options with new point size
 and curve stroke widths when the screen goes
 from big to small or vis-versa.
*/
function setupResizeRefresh() {
    window.addEventListener('resize', () => {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }
        resizeTimeout = setTimeout(() => {
            refresh();
        }, 100);
    });
}

function themeSetup() {

    let currentHour = new Date().getHours();

    if (currentHour >= 6 && currentHour < 18) {
        document.getElementById('nightday-state').checked = true;
        setColorScheme('day');
    } else {
        document.getElementById('nightday-state').checked = false;
        setColorScheme('night');
    }

    document.getElementById('nightday-state').addEventListener('change', (event) => {
        if (event.target.checked) {
            setColorScheme('day');
        } else {
            setColorScheme('night');
        }
    });

}

function setupUnitsDropdown() {

    let dropdown = document.getElementById('dropdown-units');

    Object.keys(availableUnits).forEach(units => {
        let option = document.createElement('option');
        option.value = units;
        option.text = units;
        dropdown.appendChild(option);
    });

    dropdown.addEventListener('change', () => {
        refresh();
    });

}

function setupDaysInputEvents() {

    let dropdownDaysInput = document.getElementById('dropdown-daysinput');

    dropdownDaysInput.addEventListener('change', (event) => {
        if (event.target.value === 'convert') {
            (global_daysAsIntervals) ? convertEntriesToAbsoluteDays() : convertEntriesToInvervalDays();
        } else {
            (event.target.value === 'intervals') ? setDaysAsIntervals() : setDaysAsAbsolute();
        }
    });

}

function generateStateString() {

    let [unitsMap, modelsMap] = [generateEnum(availableUnits), generateEnum(modelList)];

    let stateString = '';
    stateString += global_daysAsIntervals ? 'i' : 'a';
    stateString += isButtonOn('menstrual-cycle-button') ? 'm' : '';
    stateString += isButtonOn('target-range-button') ? 't' : '';
    stateString += unitsMap[document.getElementById('dropdown-units').value];

    let multiDoseString = '';
    let [c, u] = multiDosesVisibilities();
    multiDoseString += getMultiDoses(true, false).entries.slice(0, -1).map((entry, idx) => (idx == 0 ? (c ? 'c' : '' ) + (u ? 'u' : '') + ',' : '') + dropNaNAndFix(entry.dose) + ',' + dropNaNAndFix(entry.time) + ',' + modelsMap[entry.model]).join('-');

    let steadyStateString = '';
    steadyStateString += getSteadyStates(true, false).entries.slice(0, -1).map(entry => (entry.curveVisible ? 'c' : '') + (entry.uncertaintyVisible ? 'u' : '') + ',' + dropNaNAndFix(entry.dose) + ',' + dropNaNAndFix(entry.time) + ',' + modelsMap[entry.model]).join('-');

    return [stateString, multiDoseString, steadyStateString].join('_');

}

function generateSanerShareURL() {
    return window.location.origin + window.location.pathname + '#' + generateStateString();
}

function saveToLocalStorage() {
    let stateString = generateStateString();
    localStorage.setItem('stateString', stateString);
}

function loadFromLocalStorage() {
    let stateString = localStorage.getItem('stateString');
    if (stateString) {
        return loadFromStateString(stateString);
    } else {
        return false;
    }
}

function loadFromURL() {

    let hashString = window.location.hash.substring(1);

    if (!hashString) {
        return false;
    }

    if (isValidBase64(hashString)) {
        return loadFromZalgoIncantation()
    } else if (hashString.split('_').length === 3) {
        return loadFromSanerURL();
    } else {
        return false
    }
}

function loadFromSanerURL() {
    let hashString = window.location.hash.substring(1);
    return loadFromStateString(hashString);
}


function loadFromStateString(stateString) {

    let [unitsMap, modelsMap] = [generateEnum(availableUnits), generateEnum(modelList)];

    let [state, multiDose, steadyState] = stateString.split('_');
    state.includes('i') ? setDaysAsIntervals(false) : setDaysAsAbsolute(false);
    state.includes('m') ? turnMenstrualCycleOn(false) : turnMenstrualCycleOff(false);
    state.includes('t') ? turnTargetRangeOn(false) : turnTargetRangeOff(false);
    if (state.slice(-1) in unitsMap) {
        document.getElementById('dropdown-units').value = unitsMap[state.slice(-1)];
    }

    let mdEntries = multiDose.split('-');
    deleteAllRows('multidose-table');
    let [cu, dose, time, model] = mdEntries[0].split(',');
    addTDMRow('multidose-table', dose, time, modelsMap[model], cu.includes('c') ? true : false, cu.includes('u') ? true : false);
    for (let entry of mdEntries.slice(1)) {
        [dose, time, model] = entry.split(',');
        addTDMRow('multidose-table', dose, time, modelsMap[model]);
    }

    let ssEntries = steadyState.split('-');
    deleteAllRows('steadystate-table');
    for (let entry of ssEntries) {
        let [ssVisibilities, dose, time, model] = entry.split(',');
        addTDMRow('steadystate-table', dose, time, modelsMap[model], ssVisibilities.includes('c') ? true : false, ssVisibilities.includes('u') ? true : false);
    }

    return true
}

function loadFromZalgoIncantation() {

    let hashString = window.location.hash.substring(1);

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

        if (hashParams.has('units')) {
            document.getElementById('dropdown-units').value = hashParams.get('units');
        } else {
            document.getElementById('dropdown-units').value = 'pg/mL'
        };

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
    applyPreset(Presets._default, false);
}

/**
 * Provide an event handler whenever the user selects a preset
 */
function setupPresetsDropdown() {
    let presetDropdown = document.getElementById('dropdown-presets');

    for (let preset in Presets) {
        if (!preset.startsWith('_')) {
            let option = document.createElement('option');
            option.value = preset;
            option.innerHTML = '&nbsp;&nbsp;' + Presets[preset].label;
            presetDropdown.appendChild(option);
        } else {
            if (typeof Presets[preset].hidden === 'undefined') {
                let option = document.createElement('option');
                option.disabled = true;
                option.innerHTML = Presets[preset].label;
                presetDropdown.appendChild(option);
            };
        };
    }

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