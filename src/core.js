
// Find the first element in list that contains str or is contained in str (case insensitive)
function findIntersecting(list, str) {
    return list.find(el => el.toLowerCase().includes(str.toLowerCase()) || str.toLowerCase().includes(el.toLowerCase()));
}

// For our purposes, a valid date string
// is a string that contains at least year-month-day
// and can be parsed into a valid date object
// This is so we can mix dates and offsets
// when we sort and plot the dose table.
function isValidDateString(dateString) {
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

function findEarliestDate(dates) {
    return dates.reduce((earliest, current) => {
        let current_date = isNaN(current) ? new Date(current) : new Date(earliest.getTime() + current * 24 * 60 * 60 * 1000);
        return current_date < earliest ? current_date : earliest;
    }, new Date());
}

function transformToDayOffets(dates) {
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

function sortDatesAndOffsets(dates) {
    let offsets = transformToDayOffets(dates);
    return dates
        .map((date, index) => ({ date, offset: offsets[index] }))
        .sort((a, b) => a.offset - b.offset)
        .map(item => item.date);
}

function isArraySorted(arr) {
    for(let i = 0; i < arr.length - 1; i++) {
        if(arr[i] > arr[i + 1]) {
            return false;
        }
    }
    return true;
}


function getMonospaceWidth() {
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

    regionWidth = document.getElementById('e2d3-plot').clientWidth;

    // Calculate and log the width of the window in monospace characters

    return Math.floor(regionWidth / charWidth);

}


function numberToDayHour(number, precision = 0) {
    let days = Math.floor(number);
    let hours = (Math.round((number - days) * 24)).toFixed(precision);
    return `${days}d ${hours}h`;
}

function convertHexToRGBA(hex, alpha = 1.0) {
    if (hex.startsWith('#')) { hex = hex.slice(1); }
    let r = parseInt(hex.slice(0, 2), 16);
    let g = parseInt(hex.slice(2, 4), 16);
    let b = parseInt(hex.slice(4, 6), 16);
    let rgb = `${r}, ${g}, ${b}`;
    return `rgba(${rgb}, ${alpha})`
}

function convertCustomCSSVarToRGBA(varName, alpha = 1.0) {
    let rootStyle = getComputedStyle(document.documentElement);
    let color = rootStyle.getPropertyValue(varName)
    let rgb = '';
    if (color.startsWith('#')) {
        rgb = color
        let r = parseInt(rgb.slice(1, 3), 16);
        let g = parseInt(rgb.slice(3, 5), 16);
        let b = parseInt(rgb.slice(5, 7), 16);
        rgb = `${r}, ${g}, ${b}`;
    } else {
        rgb = color.substring(4, color.length - 1);
    }
    return `rgba(${rgb}, ${alpha})`
}

function colorTheBlue(alpha = 1.0) { return convertCustomCSSVarToRGBA('--the-blue', alpha) }
function colorThePink(alpha = 1.0) { return convertCustomCSSVarToRGBA('--the-pink', alpha) }
function colorBackground(alpha = 1.0) { return convertCustomCSSVarToRGBA('--background-color', alpha) }
function colorStandout(alpha = 1.0) { return convertCustomCSSVarToRGBA('--standout-color', alpha) }

function setColorScheme(scheme = 'night') {
    let rootStyle = getComputedStyle(document.documentElement);
    if (scheme == 'night') {
        document.documentElement.style.setProperty('--background-color', rootStyle.getPropertyValue('--background-color-night'));
        document.documentElement.style.setProperty('--standout-color', rootStyle.getPropertyValue('--standout-color-night'));
        document.documentElement.style.setProperty('--the-blue', rootStyle.getPropertyValue('--the-blue-night'));
        document.documentElement.style.setProperty('--the-pink', rootStyle.getPropertyValue('--the-pink-night'));
    } else if (scheme == 'day') {
        document.documentElement.style.setProperty('--background-color', rootStyle.getPropertyValue('--background-color-day'));
        document.documentElement.style.setProperty('--standout-color', rootStyle.getPropertyValue('--standout-color-day'));
        document.documentElement.style.setProperty('--the-blue', rootStyle.getPropertyValue('--the-blue-day'));
        document.documentElement.style.setProperty('--the-pink', rootStyle.getPropertyValue('--the-pink-day'));
    }
    refresh();
}


function unitStep(x) {
    if (x < 0) {
        return 0;
    } else if (x >= 0) {
        return 1;
    }
}

function allUnique(list) {
    return list.length === new Set(list).size;
}

function guessDaysAsIntervals() {
    if (allUnique(getTDEs('multidose-table')[0])) {
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

        reader.onload = function (event) {
            Papa.parse(event.target.result, {
                complete: function (results) {
                    deleteAllRows('multidose-table');
                    results.data.forEach(function (csvrow) {
                        if (csvrow.length >= 3) {
                            let delivtype = findIntersecting(methodList, csvrow[2]); //.replace(/\s/g, '').replace(/im/gi, ''));

                            if (delivtype && (isFinite(csvrow[0]) || isValidDate(csvrow[0])) && isFinite(csvrow[1])) {
                                addTDERow('multidose-table', csvrow[0], parseFloat(csvrow[1]), delivtype)
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

function exportCSV() {
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


function readRow(row, keepincomplete = false) {

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

function getTDEs(tableId, getvisibility = false, keepincomplete = false) {
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
        return [times, doses, esters]
    };

}

function guessNextRow(tableID) {
    let table = document.getElementById(tableID);
    if (table.rows.length >= 3 && !daysAsIntervals) {
        let beforeLastRow = readRow(table.rows[table.rows.length - 2]);
        let lastRow = readRow(table.rows[table.rows.length - 1]);
        if (beforeLastRow && lastRow) {
            if (table.rows.length >= 4) {
                let beforeBeforeLastRow = readRow(table.rows[table.rows.length - 3]);
                if (beforeBeforeLastRow
                    && (lastRow.dose === beforeBeforeLastRow.dose)
                    && (lastRow.dose !== beforeLastRow.dose)) {
                    let timeDifference = beforeLastRow.time - beforeBeforeLastRow.time;
                    let dose = beforeLastRow.dose;
                    let ester = beforeLastRow.ester;
                    // if (daysAsIntervals) {
                    //     return { time: lastRow.time, dose: dose, ester: ester };
                    // } else {
                    //     return { time: lastRow.time + timeDifference, dose: dose, ester: ester };
                    // }
                    return { time: lastRow.time + timeDifference, dose: dose, ester: ester };
                }
            }
            if (lastRow.ester == beforeLastRow.ester) {
                let timeDifference = lastRow.time - beforeLastRow.time;
                let doseDifference = lastRow.dose - beforeLastRow.dose;
                let ester = lastRow.ester;
                // if (daysAsIntervals) {
                //     return { time: lastRow.time, dose: lastRow.dose + doseDifference, ester: ester };
                // } else {
                //     return { time: lastRow.time + timeDifference, dose: lastRow.dose + doseDifference, ester: ester };
                // };
                return { time: lastRow.time + timeDifference, dose: lastRow.dose + doseDifference, ester: ester };
            }
        }
    } else if (table.rows.length >= 2 && daysAsIntervals) {
        // if days are given as intervals just repeat the last row
        let lastRow = readRow(table.rows[table.rows.length - 1]);
        return lastRow;
    }
    return null;
}


function addTDERow(tableID, time = null, dose = null, ester = null, cvisible = true, uvisible = true) {

    let table = document.getElementById(tableID);
    let row = table.insertRow(-1);

    rowValidity.set(row, false);

    // -----------------------------------------
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
        visibilityCustomCheckbox.title = "Turn visibility of curve on/off"
        visibilityCustomCheckbox.onmousedown = function () {
            visibilityCheckbox.checked = !visibilityCheckbox.checked;
            this.className = visibilityCheckbox.checked ? 'custom-checkbox checked-style' : 'custom-checkbox';
            // if (readRow(this.parentElement.parentElement)) {
                refresh()
            // }
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
        uncertaintyCustomCheckbox.title = "Turn visibility of uncertainty cloud on/off"
        uncertaintyCustomCheckbox.onmousedown = function () {
            uncertaintyCheckbox.checked = !uncertaintyCheckbox.checked;
            this.className = uncertaintyCheckbox.checked ? 'custom-checkbox checked-style' : 'custom-checkbox';
            // if (readRow(this.parentElement.parentElement)) {
                refresh()
            // }
        };
        uncertaintyCell.appendChild(uncertaintyCustomCheckbox);
    }

    // -----------------------------------------


    let timeCell = row.insertCell(2)
    timeCell.innerHTML = '<input type="text" class="flat-input time-cell">';
    if (time !== null) {
        timeCell.querySelector('input').value = time;
    }
    timeCell.querySelector('input').addEventListener('input', function () {
        let myRow = this.parentElement.parentElement;
        let currentValidity = Boolean(readRow(myRow, false));

        if ((currentValidity !== rowValidity.get(myRow)) || currentValidity) {
            rowValidity.set(myRow, currentValidity);
            refresh()
        }
    });


    let doseCell = row.insertCell(3)
    doseCell.innerHTML = '<input type="text" class="flat-input dose-cell">';
    if (dose !== null) {
        doseCell.querySelector('input').value = dose;
    }
    doseCell.querySelector('input').addEventListener('input', function () {

        let myRow = this.parentElement.parentElement;
        let currentValidity = Boolean(readRow(myRow, false));

        if ((currentValidity !== rowValidity.get(myRow)) || currentValidity) {
            rowValidity.set(myRow, currentValidity);
            refresh()
        }

    });


    let esterCell = row.insertCell(4)
    esterCell.innerHTML = (
        '<select class="dropdown-ester"> \
            <option value="EV im" title="Estradiol valerate in oil (intramuscular)">ev im</option> \
            <option value="EEn im" title="Estradiol enanthate in sunflower oil (intramuscular)">een im</option> \
            <option value="EC im" title="Estradiol cypionate in oil (intramuscular)">ec im</option> \
            <option value="EB im" title="Estradiol benzoate in oil (intramuscular)">eb im</option> \
            <option value="EUn im" title="Estradiol undecylate in castor oil (intramuscular)">eun im</option> \
            <option value="EUn casubq" title="Subcutaneous estradiol undecylate in castor oil">eun casubq</option> \
            <option value="patch tw" title="Transdermal estradiol patch (twice-weekly)">patch tw</option> \
            <option value="patch ow" title="Transdermal estradiol patch (once-weekly)">patch ow</option> \
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

    esterCell.querySelector('select').addEventListener('change', function () {
        if (readRow(this.parentElement.parentElement)) {
            refresh()
        }
    });

    let deleteCell = row.insertCell(5);
    if (tableID == 'steadystate-table' || (tableID == 'multidose-table' && table.rows.length > 2)) {   
        deleteCell.innerHTML = '<button class="flat-button delete-button" title="Delete this entry">-</button>';
        deleteCell.querySelector('.delete-button').addEventListener('click', function () {
            let myRow = this.parentNode.parentNode;
            let myTable = myRow.parentNode.parentNode;

            rowValidity.delete(myRow);
            myRow.remove();

            if (myTable.rows.length < 2) {
                addTDERow(myTable.id);
            }

            refresh();
        });
    } else {
        // yo this is janky, but it's the only way I found to keep
        // the table looking good because I suck at CSS
        deleteCell.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;';
    }

    return row;
}

function deleteAllRows(tableID) {
    let table = document.getElementById(tableID);
    while (table.rows.length > 1) {
        rowValidity.delete(table.rows[table.rows.length - 1]);
        table.deleteRow(-1);
    }
}


function turnMenstrualCycleOn() {
    let mcButton = document.getElementById('menstrual-cycle-button');
    mcButton.style.setProperty('background-color', 'var(--the-pink)');
    mcButton.style.setProperty('color', 'var(--standout-color)');
    mcButton.style.setProperty('font-weight', 'bold');
    menstrualCycleVisible = true;
}

function turnMenstrualCycleOff() {
    let mcButton = document.getElementById('menstrual-cycle-button');
    mcButton.style.setProperty('background-color', 'var(--standout-color)');
    mcButton.style.setProperty('color', 'var(--the-pink)');
    mcButton.style.setProperty('font-weight', 'normal');
    menstrualCycleVisible = false;
}

function menstrualCycleButtonAttachOnOff() {
    let mcButton = document.getElementById('menstrual-cycle-button');
    
    mcButton.addEventListener('mousedown', function () {
        if (menstrualCycleVisible) {
            turnMenstrualCycleOff();
        } else {
            turnMenstrualCycleOn();
        }
        refresh();
    });
}

function attachDragNDropImport() {

    let dragNDropZone = document.getElementById('dragndrop-zone');

    dragNDropZone.addEventListener('dragenter', function (event) {
        dragNDropZone.classList.add('overlay');
    });

    dragNDropZone.addEventListener('dragleave', function (event) {
        if (event.relatedTarget === null || !dragNDropZone.contains(event.relatedTarget)) {
            dragNDropZone.classList.remove('overlay');
        }
    });

    dragNDropZone.addEventListener('dragover', function (event) {
        event.preventDefault();
    });

    dragNDropZone.addEventListener('drop', function (event) {
        event.preventDefault();
        dragNDropZone.classList.remove('overlay');
        let files = event.dataTransfer.files;
        loadCSV(files)
    });

}

function changeBackgroundColor(elementId, color1, color2, delay = 100) {
    let element = document.getElementById(elementId);
    element.style.backgroundColor = color1;

    setTimeout(function () {
        element.style.backgroundColor = color2;
    }, delay);
}

function attachMultidoseButtonsEvents() {

    document.getElementById('add-dose-button').addEventListener('mousedown', function () {
        addTDERow('multidose-table');
    });

    document.getElementById('guess-button').addEventListener('mousedown', function () {
        let guess = guessNextRow('multidose-table');
        if (guess) {
            addTDERow('multidose-table', guess.time, guess.dose, guess.ester);
            refresh();
        } else {
            document.getElementById('guess-button').innerHTML = '&nbsp;?._.)&nbsp;&nbsp;';

            setTimeout(() => {
                document.getElementById('guess-button').innerHTML = 'autofill';
            }, 500);
        }
    });

    document.getElementById('clear-doses-button').addEventListener('mousedown', function () {
        deleteAllRows('multidose-table');
        addTDERow('multidose-table');
        refresh();
    });

    // document.getElementById('stash-button').addEventListener('mousedown', function () {
    //     saveToLocalStorage();
    //     this.innerHTML = 'stashed!';
    //     setTimeout(() => {
    //         this.innerHTML = 'stash all';
    //     }, 618);
    // });

    // document.getElementById('recall-button').addEventListener('mousedown', function () {
    //     loadFromLocalStorage();
    //     refresh();
    // });

    // document.getElementById('delete-stash-button').addEventListener('mousedown', function () {
    //     deleteLocalStorage();
    //     this.innerHTML = 'deleted!';
    //     setTimeout(() => {
    //         this.innerHTML = 'delete stash';
    //     }, 618);
    // });

    document.getElementById('share-button').addEventListener('mousedown', function () {
        navigator.clipboard.writeText(getShareURL());

        document.getElementById('share-button').innerHTML = 'copied!';

        setTimeout(() => {
            document.getElementById('share-button').innerHTML = 'share url';
        }, 1000);
    });

    document.getElementById('save-csv-button').addEventListener('mousedown', function () {
        exportCSV();
    });
    document.getElementById('import-csv-dialog').addEventListener('mousedown', function () {
        document.getElementById('csv-file').click();
    });
    document.getElementById('csv-file').addEventListener('change', function (e) {
        loadCSV(e.target.files);
    });
}

function attachSteadyStateButtonsEvents() {
    document.getElementById('add-steadystate-button').addEventListener('mousedown', function () {
        addTDERow('steadystate-table');
    });
    document.getElementById('clear-steadystates-button').addEventListener('mousedown', function () {
        deleteAllRows('steadystate-table');
        addTDERow('steadystate-table');
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

    document.getElementById('nightday-slider').addEventListener('change', function (event) {
        if (event.target.checked) {
            setColorScheme('day');
        } else {
            setColorScheme('night');
        }
    });

}

function attachOptionsEvents() {
    document.querySelector('.dropdown-units').addEventListener('change', function(event) {
        units = event.target.value;
        if (units === 'pg/mL') {
            conversionFactor = 1.0;
        } else if (units === 'pmol/L') {
            conversionFactor = 3.6713;
        }
        refresh();
    });

    document.querySelector('.dropdown-daysinput').addEventListener('change', function(event) {
        daysAsIntervals = (event.target.value === 'intervals');
        refresh();
    });
}

function attachTipJarEvent() {
    document.getElementById('copy-xmr').addEventListener('mousedown', function () {
        navigator.clipboard.writeText(this.innerText);

        document.getElementById('tipjar-text').innerHTML = 'xmr tip jar address copied, thank you!';

        setTimeout(() => {
            document.getElementById('tipjar-text').innerHTML = 'xmr tip jar';
        }, 350);

        changeBackgroundColor('copy-xmr', colorThePink(), null, 150);
    });
}

function saveToLocalStorage() {
    let multiDoseTable = getTDEs('multidose-table', true, true);
    let steadyStateTable = getTDEs('steadystate-table', true, true);

    // console.log('\n');
    localStorage.setItem('multiDoseTable', JSON.stringify(multiDoseTable));
    // console.log('saved md', multiDoseTable);
    localStorage.setItem('steadyStateTable', JSON.stringify(steadyStateTable));
    // console.log('saved ss', steadyStateTable);
}

function loadFromLocalStorage() {

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

function deleteLocalStorage() {
    localStorage.clear()
}

function getShareURL() {
    let multiDoseTable = getTDEs('multidose-table', true, true);
    let steadyStateTable = getTDEs('steadystate-table', true, true);

    let params = new URLSearchParams();
    params.set('multiDoseTable', JSON.stringify(multiDoseTable));
    params.set('steadyStateTable', JSON.stringify(steadyStateTable));

    // return window.location.origin + window.location.pathname + '#' + params.toString();
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