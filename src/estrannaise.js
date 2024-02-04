function refresh() {
    plotCurves();
}

window.onload = function () {


    // Add default curves
    addTDERow('dose-table', 0, 3, 'EV IM');
    addTDERow('steadystate-table', 4, 3, 'EV IM');

    attachDragNDropImport();

    attachMultidoseButtonsEvents();
    attachSteadyStateButtonsEvents();

    themeSetup();

    tipJarEvent();

    refresh();
}
