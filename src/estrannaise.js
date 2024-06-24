
import { plotCurves } from './plotting.js';

import { methodList } from './models.js';

import { Presets } from './presets.js';

const rowValidity = new Map();
export let conversionFactor = 1.0;
export let units = 'pg/mL';
export let daysAsIntervals = false;
export let menstrualCycleVisible = false;
let targetRangeVisible = false;
export let currentColorScheme = 'night';

let dropDownMethodHTML = (
    '<select class="dropdown-method"> \
    <option value="EV im" title="Estradiol valerate in oil (intramuscular)">ev im</option> \
    <option value="EEn im" title="Estradiol enanthate in sunflower oil (intramuscular)">een im</option> \
    <option value="EC im" title="Estradiol cypionate in oil (intramuscular)">ec im</option> \
    <option value="EB im" title="Estradiol benzoate in oil (intramuscular)">eb im</option> \
    <option value="EUn im" title="Estradiol undecylate in castor oil (intramuscular)">eun im</option> \
    <option value="EUn casubq" title="Estradiol undecylate in castor oil (subcutaneous)">eun casubq</option> \
    <option value="patch tw" title="Transdermal estradiol patch (twice-weekly) doses are in mg/day">patch tw</option> \
    <option value="patch ow" title="Transdermal estradiol patch (once-weekly) doses are in mg/day">patch ow</option> \
    </select>'
)

window.addEventListener('DOMContentLoaded', () => {

    initializeDefaultPreset();

    attachDragNDropImport();

    attachOptionsEvents();

    attachPresetsDropdown();

    attachMultidoseButtonsEvents();
    attachSteadyStateButtonsEvents();

    menstrualCycleButtonAttachOnOff();
    targetRangeButtonAttachOnOff();

    themeSetup();

    if (!loadFromURL()) {
        loadFromLocalStorage();
    }

    refresh();
});

/**
 * Re-draw the graph
 * @param {boolean} save 
 */
export function refresh(save = false) {
    if (save) {
        saveToLocalStorage();
    }
    let graph = plotCurves(
        readRow(document.getElementById('multidose-table').rows[1], true),
        getTDMs('multidose-table', true),
        getTDMs('steadystate-table', true),
        {
            conversionFactor: conversionFactor,
            currentColorScheme: currentColorScheme,
            daysAsIntervals: daysAsIntervals,
            menstrualCycleVisible: menstrualCycleVisible,
            targetRangeVisible: targetRangeVisible,
            units: units
    });
    let plot = document.getElementById('plot-region');
    plot.innerHTML = '';
    plot.append(graph);
}

// Find the first element in list that contains str or is contained in str (case insensitive)
function findIntersecting(list, str) {
    return list.find(el => el.toLowerCase().includes(str.toLowerCase()) || str.toLowerCase().includes(el.toLowerCase()));
}

function setColorScheme(scheme = 'night') {
    let rootStyle = getComputedStyle(document.documentElement);
    if (scheme == 'night') {
        document.documentElement.style.setProperty('--background-color', rootStyle.getPropertyValue('--background-color-night'));
        document.documentElement.style.setProperty('--standout-background-color', rootStyle.getPropertyValue('--standout-background-color-night'));
        document.documentElement.style.setProperty('--strong-foreground', rootStyle.getPropertyValue('--strong-foreground-night'));
        document.documentElement.style.setProperty('--light-foreground', rootStyle.getPropertyValue('--light-foreground-night'));
        currentColorScheme = 'night';
    } else if (scheme == 'day') {
        document.documentElement.style.setProperty('--background-color', rootStyle.getPropertyValue('--background-color-day'));
        document.documentElement.style.setProperty('--standout-background-color', rootStyle.getPropertyValue('--standout-background-color-day'));
        document.documentElement.style.setProperty('--strong-foreground', rootStyle.getPropertyValue('--strong-foreground-day'));
        document.documentElement.style.setProperty('--light-foreground', rootStyle.getPropertyValue('--light-foreground-day'));
        currentColorScheme = 'day';
    }
    refresh();
}

function allUnique(list) {
    return list.length === new Set(list).size;
}

function guessDaysAsIntervals() {
    if (allUnique(getTDMs('multidose-table')[0])) {
        document.getElementById('dropdown-daysinput').value = 'absolute';
        daysAsIntervals = false;
    } else {
        document.getElementById('dropdown-daysinput').value = 'intervals';
        daysAsIntervals = true;
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
                    results.data.forEach((csvrow) => {
                        if (csvrow.length >= 3) {
                            let delivtype = findIntersecting(methodList, csvrow[2]);
                            if (isValidInput(csvrow[1], csvrow[0], delivtype)) {
                                addTDMRow('multidose-table', csvrow[0], parseFloat(csvrow[1]), delivtype);
                            }
                        }
                    });
                    addRowIfNeeded('multidose-table');
                    guessDaysAsIntervals();
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
    let data = [['dose (mg)', 'time (days)', 'method']].concat(rows.slice(1).map(row => {
        let timeValue = row.cells[2].querySelector('input').value;
        let doseValue = row.cells[3].querySelector('input').value;
        let methodValue = row.cells[4].querySelector('select').value;
        return [timeValue, doseValue, methodValue];
    }));
    let csvContent = Papa.unparse(data);

    let downloadLink = document.createElement('a');
    downloadLink.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvContent);
    downloadLink.download = 'multidose-table.csv';

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

function isValidInput(dose, time, method) {
    return (!isNaN(parseFloat(dose)) && !isNaN(parseFloat(time)) && parseFloat(dose) > 0 && findIntersecting(methodList, method));
}

export function readRow(row, keepInvalid = false) {

    let dose = row.cells[2].querySelector('input').value;
    let time = row.cells[3].querySelector('input').value;
    let method = row.cells[4].querySelector('select').value;

    let cv = row.cells[0].querySelector('input');
    let cVisibility = cv ? cv.checked : null;
    let uv = row.cells[1].querySelector('input');
    let uVisibility = uv ? uv.checked : null;

    if (isValidInput(dose, time, method) || keepInvalid) {
        return { time: parseFloat(time), dose: parseFloat(dose), method: method, cVisibility: cVisibility, uVisibility: uVisibility };
    } else {
        return null;
    }
}

function getTDMs(tableId, getVisibility = false, keepInvalid = false) {
    let doseTable = document.getElementById(tableId),
        times = [],
        doses = [],
        methods = [],
        cVisibilities = [],
        uVisibilities = [];

    for (let i = 1; i < doseTable.rows.length; i++) {
        let row = doseTable.rows[i];
        let rowData = readRow(row, keepInvalid);
        if (rowData) {
            times.push(rowData.time);
            doses.push(rowData.dose);
            methods.push(rowData.method);
            if (getVisibility) {
                cVisibilities.push(rowData.cVisibility);
                uVisibilities.push(rowData.uVisibility);
            }
        }
    };

    if (getVisibility) {
        return [times, doses, methods, cVisibilities, uVisibilities];
    }
    return [times, doses, methods];
}

function guessNextRow(tableID) {
    let table = document.getElementById(tableID);
    if (table.rows.length >= 4 && !daysAsIntervals) {
        let beforeLastRow = readRow(table.rows[table.rows.length - 3]);
        let lastRow = readRow(table.rows[table.rows.length - 2]);
        if (beforeLastRow && lastRow) {
            if (table.rows.length >= 5) {
                let beforeBeforeLastRow = readRow(table.rows[table.rows.length - 4]);
                if (beforeBeforeLastRow
                    && (lastRow.dose === beforeBeforeLastRow.dose)
                    && (lastRow.dose !== beforeLastRow.dose)) {
                    let timeDifference = beforeLastRow.time - beforeBeforeLastRow.time;
                    let dose = beforeLastRow.dose;
                    let method = beforeLastRow.method;
                    return { time: lastRow.time + timeDifference, dose: dose, method: method };
                }
            }
            if (lastRow.method == beforeLastRow.method) {
                let timeDifference = lastRow.time - beforeLastRow.time;
                let doseDifference = lastRow.dose - beforeLastRow.dose;
                let method = lastRow.method;
                return { time: lastRow.time + timeDifference, dose: lastRow.dose + doseDifference, method: method };
            }
        }
    } else if (table.rows.length >= 3 && daysAsIntervals) {
        // if days are given as intervals just repeat the last row
        let lastRow = readRow(table.rows[table.rows.length - 2]);
        return lastRow;
    }
    return null;
}


function addTDMRow(tableID, time = null, dose = null, method = null, cvisible = true, uvisible = true) {

    let table = document.getElementById(tableID);
    let row = table.insertRow(-1);

    rowValidity.set(row, true);

    // Add visibility and uncertainty checkboxes
    let visibilityCell = row.insertCell(0);
    visibilityCell.className = 'visibility-cell';
    visibilityCell.width = '1.7em';
    visibilityCell.height = '1.7em';

    if (tableID == 'steadystate-table' || ((tableID == 'multidose-table') && (table.rows.length == 2))) {
        let visibilityCheckbox = document.createElement('input');
        visibilityCheckbox.type = 'checkbox';
        visibilityCheckbox.className = 'hidden-checkbox checked-style';
        visibilityCheckbox.checked = cvisible;
        visibilityCell.appendChild(visibilityCheckbox);

        let visibilityCustomCheckbox = document.createElement('div');
        visibilityCustomCheckbox.className = visibilityCheckbox.checked ? 'custom-checkbox checked-style' : 'custom-checkbox';
        visibilityCustomCheckbox.title = "Turn visibility of curve on/off";
        visibilityCustomCheckbox.onmousedown = function() {
            visibilityCheckbox.checked = !visibilityCheckbox.checked;
            this.className = visibilityCheckbox.checked ? 'custom-checkbox checked-style' : 'custom-checkbox';
            refresh();
        };
        visibilityCell.appendChild(visibilityCustomCheckbox);
    }

    let uncertaintyCell = row.insertCell(1);
    uncertaintyCell.className = 'uncertainty-cell';
    uncertaintyCell.width = '1.7em';
    uncertaintyCell.height = '1.7em';

    if (tableID == 'steadystate-table' || ((tableID == 'multidose-table') && (table.rows.length == 2))) {

        let uncertaintyCheckbox = document.createElement('input');
        uncertaintyCheckbox.type = 'checkbox';
        uncertaintyCheckbox.className = 'hidden-checkbox checked-style';
        uncertaintyCheckbox.checked = uvisible;
        uncertaintyCell.appendChild(uncertaintyCheckbox);

        let uncertaintyCustomCheckbox = document.createElement('div');
        uncertaintyCustomCheckbox.className = uncertaintyCheckbox.checked ? 'custom-checkbox checked-style' : 'custom-checkbox';
        uncertaintyCustomCheckbox.title = 'Turn visibility of uncertainty cloud on/off';
        uncertaintyCustomCheckbox.onmousedown = function() {
            uncertaintyCheckbox.checked = !uncertaintyCheckbox.checked;
            this.className = uncertaintyCheckbox.checked ? 'custom-checkbox checked-style' : 'custom-checkbox';
            refresh();
        };
        uncertaintyCell.appendChild(uncertaintyCustomCheckbox);
    }

    let timeCell = row.insertCell(2);
    timeCell.innerHTML = '<input type="text" class="flat-input time-cell">';
    if (time !== null) {
        timeCell.querySelector('input').value = time;
    }
    timeCell.querySelector('input').addEventListener('input', function() {
        let myRow = this.parentElement.parentElement;
        let currentValidity = Boolean(readRow(myRow, false));

        if ((currentValidity !== rowValidity.get(myRow)) || currentValidity) {
            rowValidity.set(myRow, currentValidity);
            refresh();
        }

        addRowIfNeeded(tableID);
    });

    let doseCell = row.insertCell(3);
    doseCell.innerHTML = '<input type="text" class="flat-input dose-cell">';

    // Set given dose or empty string as default value (prevents NaNs)
    doseCell.querySelector('input').value = dose || '';
    doseCell.querySelector('input').addEventListener('input', function() {

        let myRow = this.parentElement.parentElement;
        let currentValidity = Boolean(readRow(myRow, false));

        if ((currentValidity !== rowValidity.get(myRow)) || currentValidity) {
            rowValidity.set(myRow, currentValidity);
            refresh();
        }

        addRowIfNeeded(tableID);
    });


    let methodCell = row.insertCell(4);
    methodCell.innerHTML = dropDownMethodHTML;
    if (method !== null) {
        methodCell.querySelector('select').value = method;
    } else {
        // If no method is specified and there are
        // more than one row in the table, add
        // the same method as the one before
        if (table.rows.length > 2) {
            method = table.rows[table.rows.length - 2].cells[4].querySelector('select').value;
            methodCell.querySelector('select').value = method;
        }
    }

    methodCell.querySelector('select').addEventListener('change', function() {
        if (readRow(this.parentElement.parentElement)) {
            refresh();
        }
    });

    let deleteCell = row.insertCell(5);
    if (tableID == 'steadystate-table' || (tableID == 'multidose-table' && table.rows.length > 2)) {
        deleteCell.innerHTML = '<button class="flat-button delete-button" title="Delete this entry">-</button>';
        deleteCell.querySelector('.delete-button').addEventListener('click', function() {
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
    } else {
        // yo this is janky, but it's the only way I found to keep
        // the table looking good because I suck at CSS
        deleteCell.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;';
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

function setDaysAsIntervals(refreshPlot = true) {
    daysAsIntervals = true;
    document.getElementById('dropdown-daysinput').value = 'intervals';
    refreshPlot && refresh();
}

function setDaysAsAbsolute(refreshPlot = true) {
    daysAsIntervals = false;
    document.getElementById('dropdown-daysinput').value = 'absolute';
    refreshPlot && refresh();
}


function turnMenstrualCycleOn() {
    let mcButton = document.getElementById('menstrual-cycle-button');
    mcButton.style.setProperty('background-color', 'var(--light-foreground)');
    mcButton.style.setProperty('color', 'var(--standout-background-color)');
    mcButton.style.setProperty('font-weight', 'bold');
    menstrualCycleVisible = true;
}

function turnMenstrualCycleOff() {
    let mcButton = document.getElementById('menstrual-cycle-button');
    mcButton.style.setProperty('background-color', 'var(--standout-background-color)');
    mcButton.style.setProperty('color', 'var(--light-foreground)');
    mcButton.style.setProperty('font-weight', 'normal');
    menstrualCycleVisible = false;
}

function menstrualCycleButtonAttachOnOff() {
    let mcButton = document.getElementById('menstrual-cycle-button');

    mcButton.addEventListener('mousedown', () => {
        if (menstrualCycleVisible) {
            turnMenstrualCycleOff();
        } else {
            turnMenstrualCycleOn();
        }
        refresh();
    });
}

function targetRangeButtonAttachOnOff() {
    let button = document.getElementById('target-range-button');
    button.addEventListener('mousedown', () => {
        if (targetRangeVisible) {
            button.style.setProperty('background-color', 'var(--standout-background-color)');
            button.style.setProperty('color', 'var(--light-foreground)');
            button.style.setProperty('font-weight', 'normal');
            targetRangeVisible = false;
        } else {
            button.style.setProperty('background-color', 'var(--light-foreground)');
            button.style.setProperty('color', 'var(--standout-background-color)');
            button.style.setProperty('font-weight', 'bold');
            targetRangeVisible = true;
        }
        refresh();
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

    document.getElementById('guess-button').addEventListener('mousedown', () => {
        let guess = guessNextRow('multidose-table');
        if (guess) {
            setRowParameters('multidose-table', -1, guess.time, guess.dose, guess.method);
            refresh();
        } else {
            document.getElementById('guess-button').innerHTML = '&nbsp;?._.)&nbsp;&nbsp;';

            setTimeout(() => {
                document.getElementById('guess-button').innerHTML = 'autofill';
            }, 500);
        }
    });

    document.getElementById('clear-doses-button').addEventListener('mousedown', () => {
        deleteAllRows('multidose-table');
        addTDMRow('multidose-table');
        refresh();
    });

    document.getElementById('share-button').addEventListener('mousedown', () => {
        navigator.clipboard.writeText(getShareURL());

        document.getElementById('share-button').innerHTML = 'copied!';

        setTimeout(() => {
            document.getElementById('share-button').innerHTML = 'share url';
        }, 1000);
    });

    document.getElementById('save-csv-button').addEventListener('mousedown', () => {
        exportCSV();
    });
    document.getElementById('import-csv-dialog').addEventListener('mousedown', () => {
        document.getElementById('csv-file').click();
    });
    document.getElementById('csv-file').addEventListener('change', (e) => {
        loadCSV(e.target.files);
    });
}

function attachSteadyStateButtonsEvents() {
    document.getElementById('clear-steadystates-button').addEventListener('mousedown', () => {
        deleteAllRows('steadystate-table');
        addTDMRow('steadystate-table');
        refresh();
    });
}

function themeSetup() {

    let currentHour = new Date().getHours();

    if (currentHour >= 6 && currentHour < 18) {
        document.getElementById('nightday-slider').checked = true;
        setColorScheme('day');
    } else {
        document.getElementById('nightday-slider').checked = false;
        setColorScheme('night');
    }

    document.getElementById('nightday-slider').addEventListener('change', (event) => {
        if (event.target.checked) {
            setColorScheme('day');
        } else {
            setColorScheme('night');
        }
    });

}

function attachOptionsEvents() {
    document.querySelector('.dropdown-units').addEventListener('change', (event) => {
        units = event.target.value;
        if (units === 'pg/mL') {
            conversionFactor = 1.0;
        } else if (units === 'pmol/L') {
            conversionFactor = 3.6713;
        }
        refresh();
    });

    document.querySelector('.dropdown-daysinput').addEventListener('change', (event) => {
        (event.target.value === 'intervals') ? setDaysAsIntervals() : setDaysAsAbsolute();
    });
}

function saveToLocalStorage() {
    let multiDoseTable = getTDMs('multidose-table', true, true);
    let steadyStateTable = getTDMs('steadystate-table', true, true);

    localStorage.setItem('multiDoseTable', JSON.stringify(multiDoseTable));
    localStorage.setItem('steadyStateTable', JSON.stringify(steadyStateTable));
}

function loadFromLocalStorage() {

    let multiDoseTable = JSON.parse(localStorage.getItem('multiDoseTable'));
    let steadyStateTable = JSON.parse(localStorage.getItem('steadyStateTable'));

    if (multiDoseTable) {
        deleteAllRows('multidose-table');
        for (let i = 0; i < multiDoseTable[0].length; i++) {
            addTDMRow('multidose-table', multiDoseTable[0][i], multiDoseTable[1][i], multiDoseTable[2][i], multiDoseTable[3][i], multiDoseTable[4][i]);
        }
    }

    if (steadyStateTable) {
        deleteAllRows('steadystate-table');
        for (let i = 0; i < steadyStateTable[0].length; i++) {
            addTDMRow('steadystate-table', steadyStateTable[0][i], steadyStateTable[1][i], steadyStateTable[2][i], steadyStateTable[3][i], steadyStateTable[4][i]);
        }
    }
}

function deleteLocalStorage() {
    localStorage.clear();
}

function getShareURL() {
    let multiDoseTable = getTDMs('multidose-table', true, true);
    let steadyStateTable = getTDMs('steadystate-table', true, true);

    let params = new URLSearchParams();
    params.set('multiDoseTable', JSON.stringify(multiDoseTable));
    params.set('steadyStateTable', JSON.stringify(steadyStateTable));

    return window.location.origin + window.location.pathname + '#' + btoa(params.toString());
}

function isValidBase64(str) {
    const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
    return base64Regex.test(str);
}

function loadFromURL() {

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
            guessDaysAsIntervals();
            dataLoaded = true;
        }

        if (steadyStateTable) {
            deleteAllRows('steadystate-table');
            for (let i = 0; i < steadyStateTable[0].length; i++) {
                addTDMRow('steadystate-table', steadyStateTable[1][i], steadyStateTable[0][i], steadyStateTable[2][i], steadyStateTable[3][i], steadyStateTable[4][i]);
            }
            dataLoaded = true;
        }
    }
    return dataLoaded;
}

function addRowIfNeeded(tableID) {
    let table = document.getElementById(tableID);
    let lastRow = readRow(table.rows[table.rows.length - 1]);

    // Add new row if the last row is valid
    if(lastRow !== null) {
        addTDMRow(tableID);
    }
}

function setRowParameters(tableID, number, time, dose, method) {
    let table = document.getElementById(tableID);

    // Treat negative numbers as reverse order
    let rowNumber = number;
    if(number < 0) {
        rowNumber = table.rows.length + number;
    }

    let row = table.rows[rowNumber];

    let doseInput = row.cells[2].querySelector('input');
    let timeInput = row.cells[3].querySelector('input');
    let methodInput = row.cells[4].querySelector('select');

    timeInput.value = time;
    doseInput.value = dose;
    methodInput.value = method;

    addRowIfNeeded(tableID);
}

/**
 * At startup, apply the "default" preset defined so the user isn't presented
 * with a blank slate and can see what's possible.
 */
function initializeDefaultPreset() {
    applyPreset(Presets.default);
}

/**
 * Provide an event handler whenever the user selects a preset
 */
function attachPresetsDropdown() {
    let presetDropdown = document.getElementById('dropdown-presets');

    presetDropdown.addEventListener('change', function() {
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
function applyPreset(presetConfig) {
    deleteAllRows('multidose-table');
    deleteAllRows('steadystate-table');

    presetConfig.menstrualCycle ? turnMenstrualCycleOn() : turnMenstrualCycleOff();
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

    refresh();
}