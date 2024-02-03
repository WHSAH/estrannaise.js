const NB_CLOUD_POINTS = 3000;

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


function plotCurves() {

    let doseTable = document.getElementById('dose-table');

    let times = [];
    let doses = [];
    let esters = [];

    for (let i = 1; i < doseTable.rows.length; i++) {
        let row = doseTable.rows[i];
        let time = row.cells[0].querySelector('input').value;
        let dose = row.cells[1].querySelector('input').value;
        let ester = row.cells[2].querySelector('select').value
        if (isFinite(time) && isFinite(dose) && dose > 0) {
            times.push(time);
            doses.push(dose);
            esters.push(ester);
        }
    };

    let xmin = Math.min(...times);
    let xmax = Math.max(31, 1.618 * Math.max(...times));

    let multiDoseEstersCurve = fillCurve(t => e2MultiDoseEster3C(t, doses, times, esters), xmin, xmax, 1000);

    let uncertaintyCloud = [];
    for (let i = 0; i < NB_CLOUD_POINTS; i++) {
        let randx = Math.random() * (xmax - xmin) + xmin;
        let y = e2MultiDoseEster3C(randx, doses, times, esters, true);
        uncertaintyCloud.push({ Time: randx, E2: y });
    }

    // let repeatedCurve = fillCurve(t => e2RepeatedDose3C(t, 3, 4, 8, ...PKParams["IMEV"]), 0, 50, 300);
    // let steadyStateCurve = fillCurve(t => e2SteadyState3C(t, 3, 4, ...PKParams["IMEV"]), 0, 50, 300)
    // let singleDoseCurve = fillCurve(t => e2SingleDose3C(t, 3, ...PKParams["IMEV"]), 0, 50, 300)
    // let troughCurve = fillCurve(t => e2ssTrough3C(3, 4, ...PKParams["IMEV"]), 0, 50, 300)

    let e2curve = Plot.plot({
        x: { label: "time (days)" },
        y: { label: "e₂ (pg/ml)" },
        marks: [
            Plot.gridX({stroke: "grey"}),
            Plot.gridY({stroke: "grey"}),
            Plot.ruleX([0]),
            Plot.ruleY([0]),
            Plot.dot(uncertaintyCloud, { x: "Time", y: "E2", r: 1, fill: colorBabyBlue(), fillOpacity: 1.0}),
            Plot.line(multiDoseEstersCurve, { x: "Time", y: "E2", strokeWidth: 3, stroke: colorBabyPink() }),
            Plot.tip(multiDoseEstersCurve, Plot.pointerX({x: "Time", y: "E2", fill: colorBackground(), stroke: colorBabyPink()})),

        ]
    })
    let div = document.getElementById("e2d3-plot");
    div.innerHTML = "";
    div.append(e2curve);
}

function refresh() {
    plotCurves();
}

window.onload = function () {
    
    // Create a default dose
    addRow();
    document.getElementById('dose-table').rows[1].cells[0].querySelector('input').value = 0;
    document.getElementById('dose-table').rows[1].cells[1].querySelector('input').value = 3;
    
    attachDragnDrop();
    
    document.getElementById('open-file-dialog').addEventListener('click', function() {
        document.getElementById('csv-file').click();
    });
    
    document.getElementById('csv-file').addEventListener('change', function(e) {
        loadCSV(e.target.files);
    });

    document.getElementById('copy-xmr').addEventListener('click', function() {
        navigator.clipboard.writeText(this.innerText);
    });

    window.onresize = refresh;
    
    refresh();
}
