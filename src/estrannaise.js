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
import Papa from 'papaparse';

// This is used to determine whether to refresh after each input event
// Only refresh when a row goes from invalid to valid or vis-versa
const rowValidity = new Map();

let global_daysAsIntervals = true;
let global_currentColorScheme = 'day';

let resizeTimeout;
let previousWindowWidth = window.innerWidth;

// Will serve to tweak the plot styling to increase visibility
let isSmallScreen = window.matchMedia('(max-width: 768px)').matches;

// Will serve to lighten the computational burden on mobile devices
const isMobileOrTablet = (window.matchMedia('(pointer: coarse), (pointer: none)').matches || /Mobi|Android/i.test(navigator.userAgent));

window.addEventListener('DOMContentLoaded', () => {

    setupUnitsDropdown()
    setupDaysInputEvents();

    setupPresetsDropdown();

    setupMenstrualCycleButtonEvent();
    setupTargetRangeButtonEvent();
    setupResetLocalStorageButtonEvent();
    setupShareURLButtonEvent();

    setupCustomDoseButtonsEvents();
    setupSteadyStateButtonsEvents();
    
    attachTipjarsEvent();
    
    setupDragNDropImport();
    setupResizeRefresh();
    
    themeSetup();

    if (!loadFromURL() && !loadFromLocalStorage()) {
        initializeDefaultPreset();
    }

    refresh();
});

function refresh() {
    let graph = plotCurves(
        getDataset(),
        getCurrentPlottingOptions(),
        false);

    let plot = document.getElementById('plot-region');
    plot.innerHTML = '';
    plot.append(graph);
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

    if (isSmallScreen) {
        fontSize = "1.6rem";
        aspectRatio = 0.55;
        strokeWidth = 4;
        pointCloudSize = 2.1;
    }

    if (isMobileOrTablet) {
        pointCloudSize = 3.5;
        /* And let's ease off a bit on the
           computational burden when on mobile.
           It was a bit sluggish on my Pixel 5 */
        numberOfCloudPoints = 900;
    }

    return generatePlottingOptions({
        menstrualCycleVisible: menstrualCycleVisible,
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

function setColorScheme(scheme, refreshAfter = true) {
    let rootStyle = getComputedStyle(document.documentElement);
    let s = document.documentElement.style

    if (scheme == 'night') {
        s.setProperty('--background-color', rootStyle.getPropertyValue('--background-color-night'));
        s.setProperty('--standout-background-color', rootStyle.getPropertyValue('--standout-background-color-night'));
        s.setProperty('--soft-foreground', rootStyle.getPropertyValue('--soft-foreground-night'));
        s.setProperty('--strong-foreground', rootStyle.getPropertyValue('--strong-foreground-night'));
        global_currentColorScheme = 'night';

        /* This is to make sure the switch is in the right state
           when it's the OS that triggers the change and not a
           manual change from the user. */
        document.getElementById('nightday-state').checked = false;

    } else if (scheme == 'day') {
        s.setProperty('--background-color', rootStyle.getPropertyValue('--background-color-day'));
        s.setProperty('--standout-background-color', rootStyle.getPropertyValue('--standout-background-color-day'));
        s.setProperty('--soft-foreground', rootStyle.getPropertyValue('--soft-foreground-day'));
        s.setProperty('--strong-foreground', rootStyle.getPropertyValue('--strong-foreground-day'));
        global_currentColorScheme = 'day';
        document.getElementById('nightday-state').checked = true;
    }

    /* You actually need it because the tooltips don't behave */
    refreshAfter && refresh();
}

function allUnique(list) {
    return list.length === new Set(list).size;
}

function guessDaysAsIntervals() {
    let mdtimes = getCustomDoses(false, false).entries.map(entry => entry.time);
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
                    deleteAllRows('customdose-table');
                    results.data.forEach(([dose, time, model]) => {
                        let delivtype = findIntersecting(Object.keys(modelList), model);
                        if (isValidInput(dose, time, delivtype)) {
                            addDTMRow('customdose-table', parseFloat(dose), parseFloat(time), delivtype);
                        }
                    });
                    guessDaysAsIntervals();
                    addRowIfNeeded('customdose-table');
                    refresh();
                    saveToLocalStorage();
                }
            });
        };

        reader.readAsText(file);
    }
}

function exportCSV() {
    let table = document.getElementById('customdose-table');
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
    downloadLink.download = 'customdose-table.csv';

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

    let customdoseTable = getCustomDoses();
    let sortedEntries = customdoseTable.entries.sort((a, b) => a.time - b.time);

    deleteAllRows('customdose-table');
    sortedEntries.forEach(entry => {
        addDTMRow('customdose-table', entry.dose, entry.time, entry.model);
    });

    let previousTime = null;
    Array.from(document.getElementById('customdose-table').rows).slice(1).forEach(row => {
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
    Array.from(document.getElementById('customdose-table').rows).slice(1).forEach(row => {
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

function customDosesVisibilities() {
    let customdoseTable = document.getElementById('customdose-table');
    let firstRowEntry = readRow(customdoseTable.rows[1], true, true);
    return [firstRowEntry.curveVisible, firstRowEntry.uncertaintyVisible]
}

function getCustomDoses(keepInvalid = false, passColor = true) {
    let customDoses = {};

    let customdoseTable = document.getElementById('customdose-table');

    [customDoses.curveVisible, customDoses.uncertaintyVisible] = customDosesVisibilities();

    customDoses.daysAsIntervals = global_daysAsIntervals;
    if (passColor) { customDoses.color = wongPalette(4); }

    // Read entries, ignore visibilities
    customDoses.entries = Array.from(customdoseTable.rows).slice(1)
                              .map(row => readRow(row, false, keepInvalid))
                              .filter(entry => entry !== null);

    return customDoses
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

export function getDataset(keepInvalid = false, passColor = true) {
    return {
        customdoses: getCustomDoses(keepInvalid, passColor),
        steadystates: getSteadyStates(keepInvalid, passColor)
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


function addDTMRow(tableID, dose = null, time = null, model = null, curveVisible = true, uncertaintyVisible = true) {

    let table = document.getElementById(tableID);
    let row = table.insertRow(-1);

    row.className = tableID + '-input-row';

    rowValidity.set(row, isValidInput(dose, time, model));

    let visibilityCell = row.insertCell(0);
    visibilityCell.className = 'visibility-cell';

    let uncertaintyCell = row.insertCell(1);
    uncertaintyCell.className = 'uncertainty-cell';

    if (tableID == 'steadystate-table' || ((tableID == 'customdose-table') && (table.rows.length == 2))) {

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

        if (tableID == 'customdose-table') {
            visibilityCustomCheckbox.style.backgroundColor = (visibilityCheckboxState.checked) ? wongPalette(4) : '';
        } else if (tableID == 'steadystate-table') {
            visibilityCustomCheckbox.style.backgroundColor = (visibilityCheckboxState.checked) ? wongPalette(4 + row.rowIndex) : '';
        }

        visibilityCustomCheckbox.title = "Turn the visibility of the curve on/off";
        visibilityCustomCheckbox.onmousedown = function() {
            visibilityCheckboxState.checked = !visibilityCheckboxState.checked;
            if (tableID == 'customdose-table') {
                visibilityCustomCheckbox.style.backgroundColor = (visibilityCheckboxState.checked) ? wongPalette(4) : '';
            } else if (tableID == 'steadystate-table') {
                visibilityCustomCheckbox.style.backgroundColor = (visibilityCheckboxState.checked) ? wongPalette(4 + row.rowIndex) : '';
            }
            (rowValidity.get(row) || (tableID == 'customdose-table' && row.rowIndex == 1)) && (refresh(), saveToLocalStorage());
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

        if (tableID == 'customdose-table') {
            uncertaintyCustomCheckbox.style.backgroundColor = (uncertaintyCheckboxState.checked) ? wongPalette(4) : '';
        } else if (tableID == 'steadystate-table') {
            uncertaintyCustomCheckbox.style.backgroundColor = (uncertaintyCheckboxState.checked) ? wongPalette(4 + row.rowIndex) : '';
        }

        uncertaintyCustomCheckbox.title = 'Turn the visibility of the uncertainty cloud on/off';
        uncertaintyCustomCheckbox.onmousedown = function() {
            uncertaintyCheckboxState.checked = !uncertaintyCheckboxState.checked;
            if (tableID == 'customdose-table') {
                uncertaintyCustomCheckbox.style.backgroundColor = uncertaintyCheckboxState.checked ? wongPalette(4) : '';
            } else if (tableID == 'steadystate-table') {
                uncertaintyCustomCheckbox.style.backgroundColor = uncertaintyCheckboxState.checked ? wongPalette(4 + row.rowIndex) : '';
            }
            (rowValidity.get(row) || (tableID == 'customdose-table' && row.rowIndex == 1)) && (refresh(), saveToLocalStorage());
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
    doseInput.type = 'number';
    doseInput.min = 0;

    doseInput.addEventListener('input', function() {

        let myRow = this.parentElement.parentElement;
        let previousValidity = rowValidity.get(myRow);
        let currentValidity = Boolean(isValidRow(myRow));

        if ((currentValidity !== previousValidity) || currentValidity) {
            rowValidity.set(myRow, currentValidity);
            refresh();
            saveToLocalStorage();
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
    timeInput.type = 'number';

    if (tableID == 'customdose-table') {
        timeInput.classList.add('time-input-customdose');
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
            saveToLocalStorage();
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
            saveToLocalStorage();
        }
    });
    //////////////////////////

    //////////////////////////
    ///// Delete button //////
    //////////////////////////
    let deleteCell = row.insertCell(5);
    // if (tableID == 'steadystate-table' || (tableID == 'customdose-table' && table.rows.length > 2)) {

        let deleteButton = document.createElement('button');
        deleteButton.classList.add('flat-button', 'delete-button');
        deleteButton.setAttribute('title', 'Delete this entry');
        deleteButton.textContent = '—';

        deleteCell.appendChild(deleteButton);

        deleteButton.addEventListener('click', function() {
            let myRow = this.parentNode.parentNode;
            let myTable = myRow.parentNode.parentNode;

            rowValidity.delete(myRow);
            if (tableID == 'customdose-table' && myRow.rowIndex === 1) {
                myRow.cells[2].querySelector('input').value = '';
                myRow.cells[3].querySelector('input').value = '';
            } else {
                myRow.className = '';
                myRow.remove();
            }

            if (myTable.rows.length < 2) {
                addDTMRow(myTable.id);
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
            saveToLocalStorage();
        });
    // }
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

    let timeInputs = document.querySelectorAll('.time-input-customdose');
    timeInputs.forEach(input => {
        input.placeholder = 'since last';
    });

    refreshPlot && (refresh(), saveToLocalStorage());
}

function setDaysAsAbsolute(refreshPlot = true) {
    global_daysAsIntervals = false;
    document.getElementById('dropdown-daysinput').value = 'absolute';

    let timeInputs = document.querySelectorAll('.time-input-customdose');
    timeInputs.forEach(input => {
        input.placeholder = 'since first';
    });

    refreshPlot && (refresh(), saveToLocalStorage());
}

function turnMenstrualCycleOn(refreshPlot = true) {
    let mcButton = document.getElementById('menstrual-cycle-button');
    mcButton.classList.add('button-on');
    refreshPlot && (refresh(), saveToLocalStorage());
}

function turnMenstrualCycleOff(refreshPlot = true) {
    let mcButton = document.getElementById('menstrual-cycle-button');
    mcButton.classList.remove('button-on');
    refreshPlot && (refresh(), saveToLocalStorage());
}

function turnTargetRangeOn(refreshPlot = true) {
    let trButton = document.getElementById('target-range-button');
    trButton.classList.add('button-on');
    refreshPlot && (refresh(), saveToLocalStorage());
}

function turnTargetRangeOff(refreshPlot = true) {
    let trButton = document.getElementById('target-range-button');
    trButton.classList.remove('button-on');
    refreshPlot && (refresh(), saveToLocalStorage());
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

function setupResetLocalStorageButtonEvent() {
    let resetButton = document.getElementById('reset-button');
    resetButton.addEventListener('mousedown', (event) => {
        event.preventDefault();
        resetButton.classList.add('button-on');
        localStorage.removeItem('states');
        localStorage.removeItem('data');
        localStorage.removeItem('force-color-scheme');
        initializeDefaultPreset();
        refresh()
        setTimeout(() => {
            resetButton.classList.remove('button-on');
        }, 200);
    });
}

function setupShareURLButtonEvent() {
    let shareButton = document.getElementById('share-button');

    shareButton.addEventListener('mousedown', (event) => {
        event.preventDefault();
        
        navigator.clipboard.writeText(generateSanerShareURL());

        shareButton.classList.add('button-on');
        shareButton.innerHTML = '&nbsp;copied!&nbsp;';

        setTimeout(() => {
            shareButton.classList.remove('button-on');
            shareButton.innerHTML = 'share url';
        }, 700);
    });
}

function setupCustomDoseButtonsEvents() {

    let guessButton = document.getElementById('guess-button');

    guessButton.addEventListener('mousedown', (event) => {
        event.preventDefault();
        let guess = guessNextRow('customdose-table');

        if (guess) {
            guessButton.classList.add('button-on');
            setRowParameters('customdose-table', -1, guess.dose, guess.time, guess.model);
            refresh();
            saveToLocalStorage();
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

    clearDoseButton.addEventListener('mousedown', (event) => {
        event.preventDefault();
        clearDoseButton.classList.add('button-on');
        deleteAllRows('customdose-table');
        addDTMRow('customdose-table');
        refresh();
        saveToLocalStorage();
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

    clearSteadyStateButton.addEventListener('mousedown', (event) => {
        event.preventDefault();
        clearSteadyStateButton.classList.add('button-on');
        deleteAllRows('steadystate-table');
        addDTMRow('steadystate-table');
        refresh();
        saveToLocalStorage();
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

        /* catch switch to small screen on desktop/laptop */
        isSmallScreen = window.matchMedia('(max-width: 768px)').matches;

        /* iOS is weird an will trigger resize
           events when scrolling. */
        let currentWindowWidth = window.innerWidth;
        if (currentWindowWidth === previousWindowWidth) {
            return;
        }

        // Doesn't appear to be necessary and I don't
        // understand how come, but just in case
        previousWindowWidth = currentWindowWidth;

        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }
        resizeTimeout = setTimeout(() => {
            refresh();
        }, 100);
    });
}

function themeSetup() {

    if (localStorage.getItem('force-color-scheme')) {
        setColorScheme(localStorage.getItem('force-color-scheme'), false);
    } else {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setColorScheme('night', false);
        } else {
            setColorScheme('day', false);
        }
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
        if (!localStorage.getItem('force-color-scheme')) {
            if (event.matches) {
                setColorScheme('night');
            } else {
                setColorScheme('day');
            }
        }
    });

    document.getElementById('nightday-state').addEventListener('change', (event) => {
        if (event.target.checked) {
            localStorage.setItem('force-color-scheme', 'day');
            setColorScheme('day');
        } else {
            localStorage.setItem('force-color-scheme', 'night');
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
        saveToLocalStorage();
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
        saveToLocalStorage();
    });

}

function changeBackgroundColor(elementId, color1, color2, delay = 150) {
    let element = document.getElementById(elementId);
    element.style.backgroundColor = color1;

    setTimeout(function () {
        element.style.backgroundColor = color2;
    }, delay);
}

function attachTipjarsEvent() {
    ['xmr', 'btc', 'ltc', 'eth'].forEach(crypto => {
        document.getElementById(`copy-${crypto}`).addEventListener('mousedown', function() {

            let rootStyle = getComputedStyle(document.documentElement);
            let softForegroundColor = rootStyle.getPropertyValue('--strong-foreground');

            navigator.clipboard.writeText(this.innerText);

            let tipjarHeader = document.getElementById(`tipjars-header`);
            tipjarHeader.innerHTML = `tipjars (${crypto} address copied, thank you!)`;

            setTimeout(() => {
                tipjarHeader.innerHTML = 'tipjars';
            }, 350);

            changeBackgroundColor(`copy-${crypto}`, softForegroundColor, null, 150);
        });
    });
}


function generateStateString() {

    let [unitsMap, modelsMap] = [generateEnum(availableUnits), generateEnum(modelList)];

    let stateString = '';
    stateString += global_daysAsIntervals ? 'i' : 'a';
    stateString += isButtonOn('menstrual-cycle-button') ? 'm' : '';
    stateString += isButtonOn('target-range-button') ? 't' : '';
    stateString += unitsMap[document.getElementById('dropdown-units').value];

    let customdoseString = '';
    let [c, u] = customDosesVisibilities();
    customdoseString += getCustomDoses(true, false).entries.slice(0, -1).map((entry, idx) => (idx == 0 ? (c ? 'c' : '' ) + (u ? 'u' : '') + ',' : '') + dropNaNAndFix(entry.dose) + ',' + dropNaNAndFix(entry.time) + ',' + modelsMap[entry.model]).join('-');

    let steadyStateString = '';
    steadyStateString += getSteadyStates(true, false).entries.slice(0, -1).map(entry => (entry.curveVisible ? 'c' : '') + (entry.uncertaintyVisible ? 'u' : '') + ',' + dropNaNAndFix(entry.dose) + ',' + dropNaNAndFix(entry.time) + ',' + modelsMap[entry.model]).join('-');

    return [stateString, customdoseString, steadyStateString].join('_');

}

function generateSanerShareURL() {
    return window.location.origin + window.location.pathname + '#' + generateStateString();
}

export function saveToLocalStorage() {
    
    localStorage.setItem('data', JSON.stringify(getDataset(true, false)));
    localStorage.setItem('states', JSON.stringify({
            menstrualCycleVisible: isButtonOn('menstrual-cycle-button'),
            targetRangeVisible: isButtonOn('target-range-button'),
            units: document.getElementById('dropdown-units').value,
            daysAsIntervals: global_daysAsIntervals
        }));

}

function loadFromLocalStorage() {

    // if element states exists in localStorage
    // parse it as a JSON and set the states
    // that are present in the object
    // otherwise do nothing

    let unitsMap = generateEnum(availableUnits);

    if (localStorage.getItem('states')) {
        let states = JSON.parse(localStorage.getItem('states'));
        if (states.menstrualCycleVisible) { turnMenstrualCycleOn(false); } else { turnMenstrualCycleOff(false); }
        if (states.targetRangeVisible) { turnTargetRangeOn(false); } else { turnTargetRangeOff(false); }
        if (states.units) { document.getElementById('dropdown-units').value = states.units; }
    }

    // if the element entries exists in localStorage
    // parse it as a JSON otherwise set it to null
    if (localStorage.getItem('data')) {
        let data = JSON.parse(localStorage.getItem('data'));
        if (data.customdoses) {
            deleteAllRows('customdose-table');
            if (data.customdoses.daysAsIntervals) { setDaysAsIntervals(false); } else { setDaysAsAbsolute(false); }
            data.customdoses.entries.forEach(entry => {
                addDTMRow('customdose-table', entry.dose, entry.time, entry.model, data.customdoses.curveVisible, data.customdoses.uncertaintyVisible);
            });
        }

        if (data.steadystates) {
            deleteAllRows('steadystate-table');
            data.steadystates.entries.forEach(entry => {
                addDTMRow('steadystate-table', entry.dose, entry.time, entry.model, entry.curveVisible, entry.uncertaintyVisible);
            });
        };
        return true;
    }

    return false
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

    let [state, customdose, steadyState] = stateString.split('_');
    state.includes('i') ? setDaysAsIntervals(false) : setDaysAsAbsolute(false);
    state.includes('m') ? turnMenstrualCycleOn(false) : turnMenstrualCycleOff(false);
    state.includes('t') ? turnTargetRangeOn(false) : turnTargetRangeOff(false);
    if (state.slice(-1) in unitsMap) {
        document.getElementById('dropdown-units').value = unitsMap[state.slice(-1)];
    }

    let mdEntries = customdose.split('-');
    deleteAllRows('customdose-table');
    let [cu, dose, time, model] = mdEntries[0].split(',');
    addDTMRow('customdose-table', dose, time, modelsMap[model], cu.includes('c') ? true : false, cu.includes('u') ? true : false);
    for (let entry of mdEntries.slice(1)) {
        [dose, time, model] = entry.split(',');
        addDTMRow('customdose-table', dose, time, modelsMap[model]);
    }

    let ssEntries = steadyState.split('-');
    deleteAllRows('steadystate-table');
    for (let entry of ssEntries) {
        let [ssVisibilities, dose, time, model] = entry.split(',');
        addDTMRow('steadystate-table', dose, time, modelsMap[model], ssVisibilities.includes('c') ? true : false, ssVisibilities.includes('u') ? true : false);
    }

    return true
}

function loadFromZalgoIncantation() {

    let hashString = window.location.hash.substring(1);

    let dataLoaded = false;

    if (isValidBase64(hashString)) {

        let hashParams = new URLSearchParams(atob(hashString));

        let customdoseTable = JSON.parse(hashParams.get('customdoseTable'));
        let steadyStateTable = JSON.parse(hashParams.get('steadyStateTable'));

        if (customdoseTable) {
            deleteAllRows('customdose-table');
            for (let i = 0; i < customdoseTable[0].length; i++) {
                addDTMRow('customdose-table', customdoseTable[1][i], customdoseTable[0][i], customdoseTable[2][i], customdoseTable[3][i], customdoseTable[4][i]);
            }
            dataLoaded = true;
        }

        if (steadyStateTable) {
            deleteAllRows('steadystate-table');
            for (let i = 0; i < steadyStateTable[0].length; i++) {
                addDTMRow('steadystate-table', steadyStateTable[1][i], steadyStateTable[0][i], steadyStateTable[2][i], steadyStateTable[3][i], steadyStateTable[4][i]);
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
        addDTMRow(tableID);
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
    deleteAllRows('customdose-table');
    deleteAllRows('steadystate-table');

    presetConfig.menstrualCycle ? turnMenstrualCycleOn(false) : turnMenstrualCycleOff(false);
    presetConfig.intervalDays ? setDaysAsIntervals(false) : setDaysAsAbsolute(false);

    if (presetConfig.steady.length) {
        presetConfig.steady.forEach(steadyDose => {
            addDTMRow('steadystate-table', ...steadyDose);
        });
    } else {
        addDTMRow('steadystate-table');
    }

    if (presetConfig.multi.length) {
        presetConfig.multi.forEach(customdose => {
            addDTMRow('customdose-table', ...customdose, presetConfig.customdosesCurveVisible === true, presetConfig.customdosesUncertaintyVisible === true);
        });
    } else {
        addDTMRow('customdose-table');
    }

    refreshAfter && (refresh(), saveToLocalStorage());
}