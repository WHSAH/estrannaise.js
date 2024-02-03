const NB_CLOUD_POINTS = 4000;
const NB_LINE_POINTS = 1000;

function fillCurveFlat(func, xmin, xmax, nbsteps) {
    for (let i = xmin; i <= xmax; i += (xmax - xmin) / (nbsteps - 1)) {
        x.push(i);
        y.push(func(i));
    }
    return y;
}

function fillCurve(func, xmin, xmax, nbsteps) {
    let curve = [];
    for (let i = xmin; i <= xmax; i += (xmax - xmin) / (nbsteps - 1)) {
        curve.push({ Time: i, E2: func(i) });
    }
    return curve;
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


function plotCurves() {

    let marks = [];

    let [mdTimes, mdDoses, mdEsters] = getTDEs('dose-table');

    let xmin = Math.min(0, ...mdTimes);
    let xmax = Math.max(31, 1.618 * Math.max(...mdTimes));

    if (mdTimes.length > 0) {
        let multiDoseEstersCurve = fillCurve(t => e2MultiDoseEster3C(t, mdDoses, mdTimes, mdEsters), xmin, xmax, NB_LINE_POINTS);

        let mdUncertaintyCloud = [];
        for (let i = 0; i < NB_CLOUD_POINTS; i++) {
            let randx = Math.random() * (xmax - xmin) + xmin;
            let y = e2MultiDoseEster3C(randx, mdDoses, mdTimes, mdEsters, true);
            mdUncertaintyCloud.push({ Time: randx, E2: y });
        }
        marks.push(Plot.dot(mdUncertaintyCloud, { x: "Time", y: "E2", r: 1, fill: colorBabyBlue(), fillOpacity: 0.5 }))
        marks.push(Plot.line(multiDoseEstersCurve, { x: "Time", y: "E2", strokeWidth: 3, stroke: colorBabyPink() }))
        marks.push(Plot.tip(multiDoseEstersCurve, Plot.pointerX({ x: "Time", y: "E2", fill: colorBackground(), stroke: colorBabyPink() })))
    }

    let [ssEveries, ssDoses, ssEsters] = getTDEs('steadystate-table');

    for (let i = 0; i < ssEveries.length; i++) {
        let ssEsterCurve = fillCurve(t => e2SteadyState3C(t, ssDoses[i], ssEveries[i], ...PK3CParams[ssEsters[i]]), xmin, xmax, NB_LINE_POINTS);
        
        let ssUncertaintyCloud = [];
        for (let j = 0; j < NB_CLOUD_POINTS; j++) {
            let randx = Math.random() * (xmax - xmin) + xmin;
            let randidx = Math.floor(Math.random() * mcmcSamplesPK3C[ssEsters[i]].length);
            let y = e2SteadyState3C(randx, ssDoses[i], ssEveries[i], ...mcmcSamplesPK3C[ssEsters[i]][randidx]);
            if (y > 2000) {
                console.log(randidx)
            }
            ssUncertaintyCloud.push({ Time: randx, E2: y });
        }
        marks.push(Plot.dot(ssUncertaintyCloud, { x: "Time", y: "E2", r: 1, fill: colorBabyBlue(), fillOpacity: 0.5 }));
        marks.push(Plot.line(ssEsterCurve, { x: "Time", y: "E2", strokeWidth: 3, stroke: colorBabyPink() }))
    }


    // let repeatedCurve = fillCurve(t => e2RepeatedDose3C(t, 3, 4, 8, ...PKParams["IMEV"]), 0, 50, 300);
    // let steadyStateCurve = fillCurve(t => e2SteadyState3C(t, 3, 4, ...PKParams["IMEV"]), 0, 50, 300)
    // let singleDoseCurve = fillCurve(t => e2SingleDose3C(t, 3, ...PKParams["IMEV"]), 0, 50, 300)
    // let troughCurve = fillCurve(t => e2ssTrough3C(3, 4, ...PKParams["IMEV"]), 0, 50, 300)

    let e2curve = Plot.plot({
        width: 710,
        // height: 500,
        x: { label: "time (days)" },
        y: { label: "e₂ (pg/ml)" },
        marks: [
            Plot.gridX({ stroke: "grey" }),
            Plot.gridY({ stroke: "grey" }),
            Plot.ruleX([0]),
            Plot.ruleY([0]),
        ].concat(marks)
    })
    let div = document.getElementById("multidose-plot");
    div.innerHTML = "";
    div.append(e2curve);
}

function refresh() {
    plotCurves();
}

window.onload = function () {

    // Create a default dose
    addTDERow('dose-table', false);
    document.getElementById('dose-table').rows[1].cells[0].querySelector('input').value = 0;
    document.getElementById('dose-table').rows[1].cells[1].querySelector('input').value = 3;

    addTDERow('steadystate-table', false);

    attachDragnDrop();

    //--------------------------------
    // multi-dose table button events
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
    //--------------------------------


    //--------------------------------
    // steady-state table button events
    document.getElementById('add-steadystate-button').addEventListener('click', function () {
        addTDERow('steadystate-table');
    });
    document.getElementById('delete-all-steadystates-button').addEventListener('click', function () {
        deleteAllRows('steadystate-table');
        addTDERow('steadystate-table');
    });
    //--------------------------------

    document.getElementById('copy-xmr').addEventListener('click', function () {
        navigator.clipboard.writeText(this.innerText);
        changeBackgroundColor('copy-xmr', colorBabyPink(), colorBackground(), 200);
    });

    refresh();
}
