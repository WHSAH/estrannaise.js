let rowValidity = new Map();

window.onload = function () {

    // Add default curves
    addTDERow('dose-table', 0, 3, 'EV IM');
    addTDERow('steadystate-table', 4, 3, 'EV IM');
    
    
    attachDragNDropImport();
    
    attachMultidoseButtonsEvents();
    attachSteadyStateButtonsEvents();
    
    themeSetup();
    
    tipJarEvent();
    
    loadFromLocalStorage();

    refresh();
}


function refresh(save = false) {

    if (save) {
        saveToLocalStorage();
    }

    plotCurves();
}
