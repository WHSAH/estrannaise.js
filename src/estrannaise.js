let rowValidity = new Map();

window.onload = function () {

    // Add default curves
    // mentrual cycle mimic
    addTDERow('dose-table', -14, 3.7, 'EEn IM');
    addTDERow('dose-table', 14, 0.8, 'EB IM');
    addTDERow('dose-table', 19, 3.7, 'EEn IM');
    addTDERow('dose-table', 42, 0.8, 'EB IM');
    addTDERow('dose-table', 47, 3.7, 'EEn IM');
    addTDERow('dose-table', 70, 0.8, 'EB IM');
    addTDERow('dose-table', 75, 3.7, 'EEn IM');

    // EEn steady state
    addTDERow('steadystate-table', 7, 5, 'EEn IM');
    
    
    attachDragNDropImport();
    
    attachMultidoseButtonsEvents();
    attachSteadyStateButtonsEvents();
    
    themeSetup();
    
    attachTipJarEvent();
    
    loadFromLocalStorage();

    refresh();
}


function refresh(save = false) {

    if (save) {
        saveToLocalStorage();
    }
    plotCurves();
}
