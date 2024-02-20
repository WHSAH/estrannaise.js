const NB_CLOUD_POINTS = 3500;
const NB_CLOUDPOINTS_PER_SAMPLE = 10;
const NB_UCURVES = 200;
const NB_LINE_POINTS = 1500;

const CLOUD_POINT_SIZE = 1.3;
const CLOUD_POINT_OPACITY = 0.5;


function fillCurve(func, xmin, xmax, nbsteps) {
    let curve = [];
    for (let i = xmin; i <= xmax; i += (xmax - xmin) / (nbsteps - 1)) {
        curve.push({ Time: i, E2: func(i) });
    }
    return curve;
}


function plotCurves(uncertainty = "cloud") {

    let dotmarks = [];
    let linemarks = [];
    let ulinemarks = [];
    let rulemarks = [];
    let tipmarks = [];

    // If the first row of the multi-dose table is invalid 
    // we won't know about mdCVisib and mdUVisib
    let [mdTimes, mdDoses, mdTypes, [mdCVisib, ...cnulls], [mdUVisib, ...unulls]] = getTDEs('multidose-table', true);
    // So read it again with keepincomplete=true
    let firstRow = readRow(document.getElementById('multidose-table').rows[1], true);
    mdCVisib = firstRow.cvisibility;
    mdUVisib = firstRow.uvisibility;
    
    let [ssEveries, ssDoses, ssTypes, ssCVisibs, ssUVisibs] = getTDEs('steadystate-table', true);


    let xmin = Math.min(0, ...mdTimes);
    let xmax = 31;
    
    if (mdCVisib || mdUVisib) {
        xmax = Math.max(xmax, 1.618 * Math.max(...mdTimes));
    }

    for (let i = 0; i < ssEveries.length; i++) {
        if (ssUVisibs[i] || ssCVisibs[i]) {
            xmax = Math.max(xmax, 5 * ssEveries[i]);
        }
    }


    // track the max e2 across all multi-dose curves
    // to set the y-axis limit. uncertainty clouds ignored.
    let e2max = 0;

    if (mdTimes.length > 0) {

        // Uncertainty cloud
        if (mdUVisib) {

            // If the uncertainty is visible but not the curve
            // we probe the range of the curve to set the y-axis limit
            // The cloud points are not used to set it since they
            // sometimes are too far up.
            if (!mdCVisib) {
                let probeMultiDoseCurve = fillCurve(t => e2MultiDose3C(t, mdDoses, mdTimes, mdTypes), xmin, xmax, NB_LINE_POINTS);
                e2max = Math.max(e2max, ...probeMultiDoseCurve.map(p => p.E2));
            }

            if (uncertainty === "cloud") {
                let mdUncertaintyCloud = [];
                for (let i = 0; i < NB_CLOUD_POINTS; i++) {
                    let randx = Math.random() * (xmax - xmin) + xmin;
                    let y = e2MultiDose3C(randx, mdDoses, mdTimes, mdTypes, true);
                    mdUncertaintyCloud.push({ Time: randx, E2: y });
                }
                dotmarks.push(Plot.dot(mdUncertaintyCloud, { x: "Time", y: "E2", r: CLOUD_POINT_SIZE, fill: colorTheBlue(CLOUD_POINT_OPACITY) }))
            } else if (uncertainty = "lines") {

            }
        }


        if (mdCVisib) {
            let multiDoseCurve = fillCurve(t => e2MultiDose3C(t, mdDoses, mdTimes, mdTypes), xmin, xmax, NB_LINE_POINTS);
            multiDoseCurve = multiDoseCurve.map(p => ({ Time: p.Time, E2: p.E2 }));

            e2max = Math.max(e2max, ...multiDoseCurve.map(p => p.E2));
            linemarks.push(Plot.line(multiDoseCurve, { x: "Time", y: "E2", strokeWidth: 2, stroke: colorThePink(), strokeDash: [2, 2]}));
            
            // Plot.ruleX(aapl, Plot.pointerX({x: "Date", py: "Close", stroke: "red"})),
            // rulemarks.push(Plot.ruleY(multiDoseCurve, Plot.pointerY({ y: "E2", px: "Time", strokeWidth: 0.3, strokeDash: [2, 2], stroke: colorThePink() })));
            
            tipmarks.push(Plot.tip(multiDoseCurve, Plot.pointerX({
                x: "Time", y: "E2",
                title: p => `multi-dose\n\ntime: ${numberToDayHour(p.Time)}\n  e₂: ${p.E2.toFixed(0)} pg/ml`,
                fontFamily: "monospace", fill: colorBackground(0.618), stroke: colorThePink()
            })))
        }
    }

    for (let i = 0; i < ssEveries.length; i++) {

        if (ssUVisibs[i]) {

            let ssUncertaintyCloud = [];
            for (let j = 0; j < NB_CLOUD_POINTS; j++) {
                let randx = Math.random() * (xmax - xmin) + xmin;
                let y = PKRandomFunctions[ssTypes[i]](randx, ssDoses[i], true, ssEveries[i]);
                ssUncertaintyCloud.push({ Time: randx, E2: y });
            }

            if (!ssCVisibs[i]) {
                let probeSteadyStateCurve = fillCurve(t => PKFunctions[ssTypes[i]](t, ssDoses[i], true, ssEveries[i]), xmin, xmax, NB_LINE_POINTS);
                e2max = Math.max(e2max, ...probeSteadyStateCurve.map(p => p.E2));
            }

            dotmarks.push(Plot.dot(ssUncertaintyCloud, { x: "Time", y: "E2", r: CLOUD_POINT_SIZE, fill: colorTheBlue(CLOUD_POINT_OPACITY) }));
        }

        if (ssCVisibs[i]) {
            let ssEsterCurve = fillCurve(t => PKFunctions[ssTypes[i]](t, ssDoses[i], true, ssEveries[i]), xmin, xmax, NB_LINE_POINTS);
            ssEsterCurve = ssEsterCurve.map(p => ({ Time: p.Time, E2: p.E2, type: `${ssTypes[i]} ${ssDoses[i]}mg/${ssEveries[i]}day${ssEveries[i] > 1 ? "s" : ""}` }));
            e2max = Math.max(e2max, ...ssEsterCurve.map(p => p.E2));
            linemarks.push(Plot.line(ssEsterCurve, { x: "Time", y: "E2", strokeWidth: 2, stroke: colorThePink() }));
            tipmarks.push(Plot.tip(ssEsterCurve, Plot.pointerX({
                x: "Time", y: "E2",
                title: p => `${p.type.toLowerCase()}\n\ntime: ${numberToDayHour(p.Time)}\n  e₂: ${p.E2.toFixed(0)} pg/ml\n  tr: ${e2ssTrough3C(ssDoses[i], ssEveries[i], ...PKParams[ssTypes[i]]).toFixed(0)} pg/ml\n  av: ${e2ssAverage3C(ssDoses[i], ssEveries[i], ...PKParams[ssTypes[i]]).toFixed(0)} pg/ml`,
                fontFamily: "monospace", fill: colorBackground(0.618), stroke: colorThePink()
            })));
        }
    }

    let e2curve = Plot.plot({
        width: 848,
        // height: 500,
        x: { label: "time (days)" },
        y: { domain: [0, 1.25 * e2max], label: "serum e₂ (pg/ml)" },
        marks: [
            Plot.gridX({ stroke: "grey" }),
            Plot.gridY({ stroke: "grey" }),
            Plot.ruleX([xmin]),
            Plot.ruleY([0]),
        ].concat(rulemarks).concat(dotmarks).concat(linemarks).concat(tipmarks)
    })

    // Select all text elements in the plot and set their font weight to bold
    let textElements = e2curve.querySelectorAll('text');
    textElements.forEach(textElement => {
        textElement.style.fontFamily = 'monospace';
    });

    let plot = document.getElementById("plot-region");
    plot.innerHTML = "";
    plot.append(e2curve);
    return e2curve;

}
