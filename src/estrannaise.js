let rowValidity = new Map();
let conversionFactor = 1.0;
let units = "pg/mL";

window.onload = function () {

    // Add default curves
    // mentrual cycle mimic
    addTDERow('multidose-table', -14, 3.7, 'EEn im');
    addTDERow('multidose-table', 14, 0.8, 'EB im');
    addTDERow('multidose-table', 19, 3.7, 'EEn im');
    addTDERow('multidose-table', 42, 0.8, 'EB im');
    addTDERow('multidose-table', 47, 3.7, 'EEn im');
    addTDERow('multidose-table', 70, 0.8, 'EB im');
    addTDERow('multidose-table', 75, 3.7, 'EEn im');

    // EEn steady state
    addTDERow('steadystate-table', 7, 5, 'EEn im');


    attachDragNDropImport();

    attachOptionsEvents();

    attachMultidoseButtonsEvents();
    attachSteadyStateButtonsEvents();

    themeSetup();

    attachTipJarEvent();

    let hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.has('multiDoseTable') || hashParams.has('steadyStateTable')) {
        loadFromURL();
    } else {
        loadFromLocalStorage();
    }

    refresh();
}


function refresh(save = false) {

    if (save) {
        saveToLocalStorage();
    }
    plotCurves();
}
