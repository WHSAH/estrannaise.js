let rowValidity = new Map();
let conversionFactor = 1.0;
let units = "pg/mL";
let daysAsIntervals = false;
// let uncertaintyViz = "cloud";
let menstrualCycleVisible = false;

window.onload = function () {

    // Add default curves
    // mentrual cycle mimic
    addTDERow("multidose-table",  0, 4, "EV im");
    addTDERow("multidose-table", 20, 4, "EEn im");
    addTDERow("multidose-table", 40, 0.1, "patch ow");

    // EEn steady state
    addTDERow("steadystate-table", 7, 4, "EEn im");
    addTDERow("steadystate-table", 10, 4, "EC im", false, true);


    attachDragNDropImport();

    attachOptionsEvents();

    attachPresetsDropdown();

    attachMultidoseButtonsEvents();
    attachSteadyStateButtonsEvents();
    
    menstrualCycleButtonAttachOnOff();

    themeSetup();

    attachTipJarEvent();

    if (!loadFromURL()) {
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
