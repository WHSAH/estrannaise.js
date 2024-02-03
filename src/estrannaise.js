const NB_CLOUD_POINTS = 4000;
const NB_LINE_POINTS = 1000;


function refresh() {
    plotCurves();
}

window.onload = function () {

    // Add default curves
    addTDERow('dose-table', 0, 3, 'EV IM');
    addTDERow('steadystate-table', 4, 3, 'EV IM');

    attachDragnDropImport();

    attachMultidoseButtonsEvents();
    attachSteadyStateButtonsEvents();

    tipJarEvent();

    refresh();
}
