let rowValidity = new Map();

window.onload = function () {

    // Add default curves
    // mentrual cycle mimic
    addTDERow('multidose-table', -14, 3.7, 'EEn im mk2');
    addTDERow('multidose-table', 14, 0.8, 'EB im');
    addTDERow('multidose-table', 19, 3.7, 'EEn im mk2');
    addTDERow('multidose-table', 42, 0.8, 'EB im');
    addTDERow('multidose-table', 47, 3.7, 'EEn im mk2');
    addTDERow('multidose-table', 70, 0.8, 'EB im');
    addTDERow('multidose-table', 75, 3.7, 'EEn im mk2');

    // EEn steady state
    addTDERow('steadystate-table', 7, 5, 'EEn im mk2');


    attachDragNDropImport();

    attachMultidoseButtonsEvents();
    attachSteadyStateButtonsEvents();

    themeSetup();

    attachTipJarEvent();

    let url = window.location.href;
    let urlObj = new URL(url);
    let params = new URLSearchParams(urlObj.search);
    if (params.has('multiDoseTable') || params.has('steadyStateTable')) {
        loadFromURL(url);
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
