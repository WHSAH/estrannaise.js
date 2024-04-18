import Papa from 'papaparse';

// FIXME: circular import
import { plotCurves } from './plotting';
import { methodList } from './models';

const rowValidity = new Map();
export let conversionFactor = 1.0;
export let units = 'pg/mL';
export let daysAsIntervals = false;
export let menstrualCycleVisible = false;
export let currentColorScheme = 'night';

export function refresh(save = false) {
    if (save) {
        saveToLocalStorage();
    }
    plotCurves();
}

// Find the first element in list that contains str or is contained in str (case insensitive)
export function findIntersecting(list, str) {
    return list.find(el => el.toLowerCase().includes(str.toLowerCase()) || str.toLowerCase().includes(el.toLowerCase()));
}

// For our purposes, a valid date string
// is a string that contains at least year-month-day
// and can be parsed into a valid date object
// This is so we can mix dates and offsets
// when we sort and plot the dose table.
export function isValidDateString(dateString) {
    if (typeof dateString !== 'string') {
        return false;
    }
    let date = new Date(dateString);
    if (isNaN(date)) {
        return false;
    }
    let dateParts = dateString.split('-');
    return dateParts.length >= 3;
}

export function findEarliestDate(dates) {
    return dates.reduce((earliest, current) => {
        let current_date = isNaN(current) ? new Date(current) : new Date(earliest.getTime() + current * 24 * 60 * 60 * 1000);
        return current_date < earliest ? current_date : earliest;
    }, new Date());
}

export function transformToDayOffets(dates) {
    let earliestDate = findEarliestDate(dates);
    return dates.map(date => {
        if (!isValidDateString(date)) {
            return date;
        }
        let currentDate = new Date(date);
        let differenceInTime = currentDate.getTime() - earliestDate.getTime();
        return differenceInTime / (1000 * 3600 * 24);  // Convert milliseconds to days
    });
}

export function sortDatesAndOffsets(dates) {
    let offsets = transformToDayOffets(dates);
    return dates
        .map((date, index) => ({ date, offset: offsets[index] }))
        .sort((a, b) => a.offset - b.offset)
        .map(item => item.date);
}

export function isArraySorted(arr) {
    for(let i = 0; i < arr.length - 1; i++) {
        if(arr[i] > arr[i + 1]) {
            return false;
        }
    }
    return true;
}


export function getMonospaceWidth() {
    let element = document.createElement('pre');
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.fontFamily = 'monospace';
    element.textContent = '_';  // 'm' is often used because it's wide
    document.body.appendChild(element);

    // Measure the width of a single monospace character
    let charWidth = element.getBoundingClientRect().width;

    // Remove the off-screen element
    document.body.removeChild(element);

    let regionWidth = document.getElementById('e2d3-plot').clientWidth;

    // Calculate and log the width of the window in monospace characters
    return Math.floor(regionWidth / charWidth);
}


export function numberToDayHour(number, precision = 0) {
    let days = Math.floor(number);
    let hours = (Math.round((number - days) * 24)).toFixed(precision);
    return `${days}d ${hours}h`;
}

export function convertHexToRGBA(hex, alpha = 1.0) {
    if (hex.startsWith('#')) { hex = hex.slice(1); }
    let r = parseInt(hex.slice(0, 2), 16);
    let g = parseInt(hex.slice(2, 4), 16);
    let b = parseInt(hex.slice(4, 6), 16);
    let rgb = `${r}, ${g}, ${b}`;
    return `rgba(${rgb}, ${alpha})`;
}

export function convertCustomCSSVarToRGBA(varName, alpha = 1.0) {
    let rootStyle = getComputedStyle(document.documentElement);
    let color = rootStyle.getPropertyValue(varName);
    let rgb = '';
    if (color.startsWith('#')) {
        rgb = color;
        let r = parseInt(rgb.slice(1, 3), 16);
        let g = parseInt(rgb.slice(3, 5), 16);
        let b = parseInt(rgb.slice(5, 7), 16);
        rgb = `${r}, ${g}, ${b}`;
    } else {
        rgb = color.substring(4, color.length - 1);
    }
    return `rgba(${rgb}, ${alpha})`;
}

export function colorTheBlue(alpha = 1.0) { return convertCustomCSSVarToRGBA('--the-blue', alpha); }
export function colorThePink(alpha = 1.0) { return convertCustomCSSVarToRGBA('--the-pink', alpha); }
export function colorBackground(alpha = 1.0) { return convertCustomCSSVarToRGBA('--background-color', alpha); }
export function colorStandout(alpha = 1.0) { return convertCustomCSSVarToRGBA('--standout-color', alpha); }

export function setColorScheme(scheme = 'night') {
    let rootStyle = getComputedStyle(document.documentElement);
    if (scheme == 'night') {
        document.documentElement.style.setProperty('--background-color', rootStyle.getPropertyValue('--background-color-night'));
        document.documentElement.style.setProperty('--standout-color', rootStyle.getPropertyValue('--standout-color-night'));
        document.documentElement.style.setProperty('--the-blue', rootStyle.getPropertyValue('--the-blue-night'));
        document.documentElement.style.setProperty('--the-pink', rootStyle.getPropertyValue('--the-pink-night'));
        currentColorScheme = 'night';
    } else if (scheme == 'day') {
        document.documentElement.style.setProperty('--background-color', rootStyle.getPropertyValue('--background-color-day'));
        document.documentElement.style.setProperty('--standout-color', rootStyle.getPropertyValue('--standout-color-day'));
        document.documentElement.style.setProperty('--the-blue', rootStyle.getPropertyValue('--the-blue-day'));
        document.documentElement.style.setProperty('--the-pink', rootStyle.getPropertyValue('--the-pink-day'));
        currentColorScheme = 'day';
    }
    refresh();
}


export function unitStep(x) {
    if (x < 0) {
        return 0;
    } else if (x >= 0) {
        return 1;
    }
}

export function allUnique(list) {
    return list.length === new Set(list).size;
}

export function guessDaysAsIntervals() {
    if (allUnique(getTDEs('multidose-table')[0])) {
        document.getElementById('dropdown-daysinput').value = 'absolute';
        daysAsIntervals = false;
    } else {
        document.getElementById('dropdown-daysinput').value = 'intervals';
        daysAsIntervals = true;
    }
}

export function loadCSV(files) {
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

                            if (delivtype && (isFinite(csvrow[0]) || isValidDate(csvrow[0])) && isFinite(csvrow[1])) {
                                addTDERow('multidose-table', csvrow[0], parseFloat(csvrow[1]), delivtype);
                            }
                        }
                    });
                    guessDaysAsIntervals();
                    refresh();
                }
            });
        };

        reader.readAsText(file);
    }
}

export function exportCSV() {
    let table = document.getElementById('multidose-table');
    let rows = Array.from(table.rows);
    let data = [['time (days)', 'dose (mg)', 'ester']].concat(rows.slice(1).map(row => {
        let timeValue = row.cells[2].querySelector('input').value;
        let doseValue = row.cells[3].querySelector('input').value;
        let esterValue = row.cells[4].querySelector('select').value;
        return [timeValue, doseValue, esterValue];
    }));
    let csvContent = Papa.unparse(data);

    let downloadLink = document.createElement('a');
    downloadLink.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvContent);
    downloadLink.download = 'multidose-table.csv';

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}


export function readRow(row, keepincomplete = false) {

    let time = row.cells[2].querySelector('input').value;
    let dose = row.cells[3].querySelector('input').value;
    let ester = row.cells[4].querySelector('select').value;

    let cv = row.cells[0].querySelector('input');
    let cvisibility = cv ? cv.checked : null;
    let uv = row.cells[1].querySelector('input');
    let uvisibility = uv ? uv.checked : null;

    if ((!isNaN(parseFloat(time)) && !isNaN(parseFloat(dose)) && parseFloat(dose) > 0) || keepincomplete) {
        return { time: parseFloat(time), dose: parseFloat(dose), ester: ester, cvisibility: cvisibility, uvisibility: uvisibility };
    } else {
        return null;
    }
}

export function getTDEs(tableId, getvisibility = false, keepincomplete = false) {
    let doseTable = document.getElementById(tableId);
    let times = [];
    let doses = [];
    let esters = [];

    let cvisibilities = [];
    let uvisibilities = [];

    for (let i = 1; i < doseTable.rows.length; i++) {
        let row = doseTable.rows[i];
        let rowdata = readRow(row, keepincomplete);
        if (rowdata) {
            times.push(rowdata.time);
            doses.push(rowdata.dose);
            esters.push(rowdata.ester);
            if (getvisibility) {
                cvisibilities.push(rowdata.cvisibility);
                uvisibilities.push(rowdata.uvisibility);
            }
        }
    };

    if (getvisibility) {
        return [times, doses, esters, cvisibilities, uvisibilities];
    } else {
        return [times, doses, esters];
    };

}

export function guessNextRow(tableID) {
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
                    let ester = beforeLastRow.ester;
                    return { time: lastRow.time + timeDifference, dose: dose, ester: ester };
                }
            }
            if (lastRow.ester == beforeLastRow.ester) {
                let timeDifference = lastRow.time - beforeLastRow.time;
                let doseDifference = lastRow.dose - beforeLastRow.dose;
                let ester = lastRow.ester;
                return { time: lastRow.time + timeDifference, dose: lastRow.dose + doseDifference, ester: ester };
            }
        }
    } else if (table.rows.length >= 3 && daysAsIntervals) {
        // if days are given as intervals just repeat the last row
        let lastRow = readRow(table.rows[table.rows.length - 2]);
        return lastRow;
    }
    return null;
}


export function addTDERow(tableID, time = null, dose = null, ester = null, cvisible = true, uvisible = true) {

    let table = document.getElementById(tableID);
    let row = table.insertRow(-1);

    rowValidity.set(row, false);

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
        visibilityCustomCheckbox.onmousedown = () => {
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
        uncertaintyCustomCheckbox.onmousedown = () => {
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
    timeCell.querySelector('input').addEventListener('input', () => {
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
    doseCell.querySelector('input').addEventListener('input', () => {

        let myRow = this.parentElement.parentElement;
        let currentValidity = Boolean(readRow(myRow, false));

        if ((currentValidity !== rowValidity.get(myRow)) || currentValidity) {
            rowValidity.set(myRow, currentValidity);
            refresh();
        }

        addRowIfNeeded(tableID);
    });


    let esterCell = row.insertCell(4);
    esterCell.innerHTML = (
        '<select class="dropdown-ester"> \
            <option value="EV im" title="Estradiol valerate in oil (intramuscular)">ev im</option> \
            <option value="EEn im" title="Estradiol enanthate in sunflower oil (intramuscular)">een im</option> \
            <option value="EC im" title="Estradiol cypionate in oil (intramuscular)">ec im</option> \
            <option value="EB im" title="Estradiol benzoate in oil (intramuscular)">eb im</option> \
            <option value="EUn im" title="Estradiol undecylate in castor oil (intramuscular)">eun im</option> \
            <option value="EUn casubq" title="Estradiol undecylate in castor oil (subcutaneous)">eun casubq</option> \
            <option value="patch tw" title="Transdermal estradiol patch (twice-weekly) doses are in mg/day">patch tw</option> \
            <option value="patch ow" title="Transdermal estradiol patch (once-weekly) doses are in mg/day">patch ow</option> \
            </select>');
    if (ester !== null) {
        esterCell.querySelector('select').value = ester;
    } else {
        // If no ester is specified and there are
        // more than one row in the table, add
        // the same ester as the one before
        if (table.rows.length > 2) {
            ester = table.rows[table.rows.length - 2].cells[4].querySelector('select').value;
            esterCell.querySelector('select').value = ester;
        }
    }

    esterCell.querySelector('select').addEventListener('change', () => {
        if (readRow(this.parentElement.parentElement)) {
            refresh();
        }
    });

    let deleteCell = row.insertCell(5);
    if (tableID == 'steadystate-table' || (tableID == 'multidose-table' && table.rows.length > 2)) {
        deleteCell.innerHTML = '<button class="flat-button delete-button" title="Delete this entry">-</button>';
        deleteCell.querySelector('.delete-button').addEventListener('click', () => {
            let myRow = this.parentNode.parentNode;
            let myTable = myRow.parentNode.parentNode;

            rowValidity.delete(myRow);
            myRow.remove();

            if (myTable.rows.length < 2) {
                addTDERow(myTable.id);
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

export function deleteAllRows(tableID) {
    let table = document.getElementById(tableID);
    while (table.rows.length > 1) {
        rowValidity.delete(table.rows[table.rows.length - 1]);
        table.deleteRow(-1);
    }
}

export function setDaysAsIntervals(refreshPlot = true) {
    daysAsIntervals = true;
    document.getElementById('dropdown-daysinput').value = 'intervals';
    refreshPlot && refresh();
}

export function setDaysAsAbsolute(refreshPlot = true) {
    daysAsIntervals = false;
    document.getElementById('dropdown-daysinput').value = 'absolute';
    refreshPlot && refresh();
}


export function turnMenstrualCycleOn() {
    let mcButton = document.getElementById('menstrual-cycle-button');
    mcButton.style.setProperty('background-color', 'var(--the-pink)');
    mcButton.style.setProperty('color', 'var(--standout-color)');
    mcButton.style.setProperty('font-weight', 'bold');
    menstrualCycleVisible = true;
}

export function turnMenstrualCycleOff() {
    let mcButton = document.getElementById('menstrual-cycle-button');
    mcButton.style.setProperty('background-color', 'var(--standout-color)');
    mcButton.style.setProperty('color', 'var(--the-pink)');
    mcButton.style.setProperty('font-weight', 'normal');
    menstrualCycleVisible = false;
}

export function menstrualCycleButtonAttachOnOff() {
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

export function attachDragNDropImport() {

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

export function changeBackgroundColor(elementId, color1, color2, delay = 100) {
    let element = document.getElementById(elementId);
    element.style.backgroundColor = color1;

    setTimeout(() => {
        element.style.backgroundColor = color2;
    }, delay);
}

export function attachMultidoseButtonsEvents() {

    document.getElementById('guess-button').addEventListener('mousedown', () => {
        let guess = guessNextRow('multidose-table');
        if (guess) {
            setRowParameters('multidose-table', -1, guess.time, guess.dose, guess.ester);
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
        addTDERow('multidose-table');
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

export function attachSteadyStateButtonsEvents() {
    document.getElementById('clear-steadystates-button').addEventListener('mousedown', () => {
        deleteAllRows('steadystate-table');
        addTDERow('steadystate-table');
        refresh();
    });
}

export function themeSetup() {

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

export function attachOptionsEvents() {
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

export function attachTipJarEvent() {
    document.getElementById('copy-xmr').addEventListener('mousedown', () => {
        navigator.clipboard.writeText(this.innerText);

        document.getElementById('tipjar-text').innerHTML = 'xmr tip jar address copied, thank you!';

        setTimeout(() => {
            document.getElementById('tipjar-text').innerHTML = 'xmr tip jar';
        }, 350);

        changeBackgroundColor('copy-xmr', colorThePink(), null, 150);
    });
}

export function saveToLocalStorage() {
    let multiDoseTable = getTDEs('multidose-table', true, true);
    let steadyStateTable = getTDEs('steadystate-table', true, true);

    localStorage.setItem('multiDoseTable', JSON.stringify(multiDoseTable));
    localStorage.setItem('steadyStateTable', JSON.stringify(steadyStateTable));
}

export function loadFromLocalStorage() {

    let multiDoseTable = JSON.parse(localStorage.getItem('multiDoseTable'));
    let steadyStateTable = JSON.parse(localStorage.getItem('steadyStateTable'));

    if (multiDoseTable) {
        deleteAllRows('multidose-table');
        for (let i = 0; i < multiDoseTable[0].length; i++) {
            addTDERow('multidose-table', multiDoseTable[0][i], multiDoseTable[1][i], multiDoseTable[2][i], multiDoseTable[3][i], multiDoseTable[4][i]);
        }
    }

    if (steadyStateTable) {
        deleteAllRows('steadystate-table');
        for (let i = 0; i < steadyStateTable[0].length; i++) {
            addTDERow('steadystate-table', steadyStateTable[0][i], steadyStateTable[1][i], steadyStateTable[2][i], steadyStateTable[3][i], steadyStateTable[4][i]);
        }
    }
}

export function deleteLocalStorage() {
    localStorage.clear();
}

export function getShareURL() {
    let multiDoseTable = getTDEs('multidose-table', true, true);
    let steadyStateTable = getTDEs('steadystate-table', true, true);

    let params = new URLSearchParams();
    params.set('multiDoseTable', JSON.stringify(multiDoseTable));
    params.set('steadyStateTable', JSON.stringify(steadyStateTable));

    return window.location.origin + window.location.pathname + '#' + btoa(params.toString());
}

export function isValidBase64(str) {
    const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
    return base64Regex.test(str);
}

export function loadFromURL() {

    let hashString = window.location.hash.substring(1);

    let dataLoaded = false;

    if (isValidBase64(hashString)) {

        let hashParams = new URLSearchParams(atob(hashString));

        let multiDoseTable = JSON.parse(hashParams.get('multiDoseTable'));
        let steadyStateTable = JSON.parse(hashParams.get('steadyStateTable'));

        if (multiDoseTable) {
            deleteAllRows('multidose-table');
            for (let i = 0; i < multiDoseTable[0].length; i++) {
                addTDERow('multidose-table', multiDoseTable[0][i], multiDoseTable[1][i], multiDoseTable[2][i], multiDoseTable[3][i], multiDoseTable[4][i]);
            }
            guessDaysAsIntervals();
            dataLoaded = true;
        }

        if (steadyStateTable) {
            deleteAllRows('steadystate-table');
            for (let i = 0; i < steadyStateTable[0].length; i++) {
                addTDERow('steadystate-table', steadyStateTable[0][i], steadyStateTable[1][i], steadyStateTable[2][i], steadyStateTable[3][i], steadyStateTable[4][i]);
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
        addTDERow(tableID);
    }
}

function setRowParameters(tableID, number, time, dose, ester) {
    let table = document.getElementById(tableID);

    // Treat negative numbers as reverse order
    let rowNumber = number;
    if(number < 0) {
        rowNumber = table.rows.length + number;
    }

    let row = table.rows[rowNumber];

    let timeInput = row.cells[2].querySelector('input');
    let doseInput = row.cells[3].querySelector('input');
    let esterInput = row.cells[4].querySelector('select');

    timeInput.value = time;
    doseInput.value = dose;
    esterInput.value = ester;

    addRowIfNeeded(tableID);
}
