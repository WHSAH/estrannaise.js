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

function colorBabyBlue(alpha = 1.0) { return convertCustomCSSVarToRGBA('--baby-blue', alpha) }
function colorBabyPink(alpha = 1.0) { return convertCustomCSSVarToRGBA('--baby-pink', alpha) }
function colorBackground(alpha = 1.0) { return convertCustomCSSVarToRGBA('--background-grey', alpha) }
function colorButton(alpha = 1.0) { return convertCustomCSSVarToRGBA('--button-grey', alpha) }

// function colorBabyPink(alpha = 1.0) {
//     let babyPink = rootStyle.getPropertyValue('--baby-pink').substring(4, color.length - 1);
//     return `rgba(${babyPink}, ${alpha})`
// }

// function colorBackground(alpha = 1.0) {
//     let background = rootStyle.getPropertyValue('--background').substring(4, color.length - 1);
//     return `rgba(${background}, ${alpha})`
// }

// function colorButton(alpha = 1.0) {
//     return `rgba(52, 52, 52, ${alpha})`
// }



function unitStep(x) {
    if (x < 0) {
        return 0;
    } else if (x >= 0) {
        return 1;
    }
}

function loadCSV(files) {
    if (files.length > 0) {
        let file = files[0];
        let reader = new FileReader();

        reader.onload = function (event) {
            Papa.parse(event.target.result, {
                complete: function (results) {
                    deleteAllRows('dose-table');
                    results.data.forEach(function (csvrow) {
                        if (csvrow.length >= 3) {
                            let ester = findIntersecting(esterList, csvrow[2].replace(/\s/g, '').replace(/im/gi, ''));

                            if (ester && (isFinite(csvrow[0]) || isValidDate(csvrow[0])) && isFinite(csvrow[1])) {
                                addTDERow('dose-table', csvrow[0], parseFloat(csvrow[1]), ester)
                                // let timeCell = row.cells[0];
                                // let doseCell = row.cells[1];
                                // let esterSelector = row.cells[2];

                                // timeCell.querySelector('input').value = csvrow[0];
                                // doseCell.querySelector('input').value = parseFloat(csvrow[1]);
                                // esterSelector.querySelector('select').value = ester;
                            }
                        }
                    });
                    refresh();
                }
            });
        };

        reader.readAsText(file);
    }
}

function exportCSV() {
    let table = document.getElementById('dose-table');
    let rows = Array.from(table.rows);
    let data = [['time (days)', 'dose (mg)', 'ester']].concat(rows.slice(1).map(row => {
        let timeValue = row.cells[2].querySelector('input').value;
        let doseValue = row.cells[3].querySelector('input').value;
        let esterValue = row.cells[4].querySelector('select').value;
        return [timeValue, doseValue, esterValue];
    }));
    console.log(data)
    let csvContent = Papa.unparse(data);

    let downloadLink = document.createElement('a');
    downloadLink.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvContent);
    downloadLink.download = 'dose-table.csv';

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

function getTDEs(tableId) {
    let doseTable = document.getElementById(tableId);
    let times = [];
    let doses = [];
    let esters = [];
    for (let i = 1; i < doseTable.rows.length; i++) {
        let row = doseTable.rows[i];
        let time = row.cells[2].querySelector('input').value;
        let dose = row.cells[3].querySelector('input').value;
        let ester = row.cells[4].querySelector('select').value
        if (isFinite(time) && isFinite(dose) && dose > 0) {
            times.push(time);
            doses.push(dose);
            esters.push(ester);
        }
    };
    return [times, doses, esters];
}

function addTDERow(id, time = null, dose = null, ester = null, stationary = false) {
    let table = document.getElementById(id);
    let row = table.insertRow(-1);

    // -----------------------------------------
    // Add visibility and uncertainty checkboxes
    let visibilityCell = row.insertCell(0);
    if (id == 'steadystate-table' || ((id == 'dose-table') && (table.rows.length == 2))) {
        let visibilityCheckbox = document.createElement('input');
        visibilityCheckbox.type = 'checkbox';
        visibilityCheckbox.className = 'hidden-checkbox checked-style';
        visibilityCheckbox.checked = true;
        visibilityCell.appendChild(visibilityCheckbox);

        let visibilityCustomCheckbox = document.createElement('div');
        visibilityCustomCheckbox.className = 'custom-checkbox checked-style';
        visibilityCustomCheckbox.onclick = function () {
            visibilityCheckbox.checked = !visibilityCheckbox.checked;
            this.className = visibilityCheckbox.checked ? 'custom-checkbox checked-style' : 'custom-checkbox';
            refresh()
        };
        visibilityCell.appendChild(visibilityCustomCheckbox);
    }
    let uncertaintyCell = row.insertCell(1);
    if (id == 'steadystate-table' || ((id == 'dose-table') && (table.rows.length == 2))) {

        let uncertaintyCheckbox = document.createElement('input');
        uncertaintyCheckbox.type = 'checkbox';
        uncertaintyCheckbox.className = 'hidden-checkbox checked-style';
        uncertaintyCheckbox.checked = true;
        uncertaintyCell.appendChild(uncertaintyCheckbox);

        let uncertaintyCustomCheckbox = document.createElement('div');
        uncertaintyCustomCheckbox.className = 'custom-checkbox checked-style';
        uncertaintyCustomCheckbox.onclick = function () {
            uncertaintyCheckbox.checked = !uncertaintyCheckbox.checked;
            this.className = uncertaintyCheckbox.checked ? 'custom-checkbox checked-style' : 'custom-checkbox';
            refresh()
        };
        uncertaintyCell.appendChild(uncertaintyCustomCheckbox);
    }

    // -----------------------------------------


    let timeCell = row.insertCell(2)
    timeCell.innerHTML = '<input type="text" class="flat-input time-cell">';
    if (time !== null) {
        timeCell.querySelector('input').value = time;
    }
    timeCell.querySelector('input').addEventListener('input', refresh);

    // timeCell.addClassName = "time-cell";


    let doseCell = row.insertCell(3)
    doseCell.innerHTML = '<input type="text" class="flat-input dose-cell">';
    if (dose !== null) {
        doseCell.querySelector('input').value = dose;
    }
    doseCell.querySelector('input').addEventListener('input', refresh);

    // doseCell.addClassName = "dose-cell";

    let esterCell = row.insertCell(4)
    esterCell.innerHTML =
        '<select class="dropdown-ester"> \
            <option value="EV IM">EV IM</option> \
            <option value="EEn IM">EEn IM</option> \
            <option value="EC IM">EC IM</option> \
            <option value="EB IM">EB IM</option> \
            <option value="EUn IM">EUn IM</option> \
            </select>';
    if (ester !== null) {
        esterCell.querySelector('select').value = ester;
    }
    esterCell.querySelector('select').addEventListener('change', refresh);

    let deleteCell = row.insertCell(5);
    deleteCell.innerHTML = '<button class="flat-button delete-button">-</button>';
    deleteCell.querySelector('.delete-button').addEventListener('click', function () {
        this.parentNode.parentNode.remove();
        refresh();
    });

    if (stationary) {
        document.getElementById('add-dose-button').scrollIntoView();
    }

    return row;
}

function deleteAllRows(id) {
    let table = document.getElementById(id);
    while (table.rows.length > 1) {
        table.deleteRow(-1);
    }
    refresh();
}

function attachDragnDropImport() {

    let doseTable = document.getElementById('dragndrop-zone');
    doseTable.addEventListener('dragenter', function (event) {
        doseTable.classList.add('overlay');
    });

    doseTable.addEventListener('dragleave', function (event) {
        if (event.relatedTarget === null || !doseTable.contains(event.relatedTarget)) {
            doseTable.classList.remove('overlay');
        }
    });

    doseTable.addEventListener('dragover', function (event) {
        event.preventDefault();
    });

    doseTable.addEventListener('drop', function (event) {
        event.preventDefault();
        doseTable.classList.remove('overlay');
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
    document.getElementById('add-dose-button').addEventListener('click', function () {
        addTDERow('dose-table');
    });
    document.getElementById('delete-all-doses-button').addEventListener('click', function () {
        deleteAllRows('dose-table');
        addTDERow('dose-table');
    });
    document.getElementById('save-csv-button').addEventListener('click', function () {
        exportCSV();
    });
    document.getElementById('import-csv-dialog').addEventListener('click', function () {
        document.getElementById('csv-file').click();
    });
    document.getElementById('csv-file').addEventListener('change', function (e) {
        loadCSV(e.target.files);
    });
}

function attachSteadyStateButtonsEvents() {
    document.getElementById('add-steadystate-button').addEventListener('click', function () {
        addTDERow('steadystate-table');
    });
    document.getElementById('delete-all-steadystates-button').addEventListener('click', function () {
        deleteAllRows('steadystate-table');
        addTDERow('steadystate-table');
    });
}

function tipJarEvent() {
    document.getElementById('copy-xmr').addEventListener('click', function () {
        navigator.clipboard.writeText(this.innerText);
        changeBackgroundColor('copy-xmr', colorBabyPink(), colorBackground(), 150);
    });
}