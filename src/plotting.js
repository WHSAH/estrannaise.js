const NB_CLOUD_POINTS = 3000;
const NB_LINE_POINTS = 1000;

function fillCurve(func, xmin, xmax, nbsteps) {
    let curve = [];
    for (let i = xmin; i <= xmax; i += (xmax - xmin) / (nbsteps - 1)) {
        curve.push({ Time: i, E2: func(i) });
    }
    return curve;
}

function plotCurves() {

    let dotmarks = [];
    let linemarks = [];
    let tipmarks = []

    let [mdTimes, mdDoses, mdEsters, [mdCVisib, ...cnulls], [mdUVisib, ...unulls]] = getTDEs('dose-table', true);

    let xmin = Math.min(0, ...mdTimes);
    let xmax = Math.max(31, 1.618 * Math.max(...mdTimes));

    // track the max e2 across all multi-dose curves
    // to set the y-axis limit. uncertainty clouds ignored.
    let e2max = 0;

    if (mdTimes.length > 0) {

        if (mdUVisib) {

            let testmdcurve = fillCurve(t => e2MultiDoseEster3C(t, mdDoses, mdTimes, mdEsters), xmin, xmax, NB_LINE_POINTS);
            e2max = Math.max(e2max, ...testmdcurve.map(p => p.E2));

            let mdUncertaintyCloud = [];
            for (let i = 0; i < NB_CLOUD_POINTS; i++) {
                let randx = Math.random() * (xmax - xmin) + xmin;
                let y = e2MultiDoseEster3C(randx, mdDoses, mdTimes, mdEsters, true);
                mdUncertaintyCloud.push({ Time: randx, E2: y });
            }
            dotmarks.push(Plot.dot(mdUncertaintyCloud, { x: "Time", y: "E2", r: 1, fill: colorBabyBlue(), fillOpacity: 0.5 }))
        }

        if (mdCVisib) {
            let multiDoseEstersCurve = fillCurve(t => e2MultiDoseEster3C(t, mdDoses, mdTimes, mdEsters), xmin, xmax, NB_LINE_POINTS);
            multiDoseEstersCurve = multiDoseEstersCurve.map(p => ({ Time: p.Time, E2: p.E2 }));

            e2max = Math.max(e2max, ...multiDoseEstersCurve.map(p => p.E2));
            linemarks.push(Plot.line(multiDoseEstersCurve, { x: "Time", y: "E2", strokeWidth: 3, stroke: colorBabyPink() }))
            tipmarks.push(Plot.tip(multiDoseEstersCurve, Plot.pointerX({
                x: "Time", y: "E2",
                title: p => `multi-dose\n\ntime: ${numberToDayHour(p.Time)}\n  e2: ${p.E2.toFixed(0)} pg/ml`,
                fontFamily: "monospace", fill: colorBackground(0.618), stroke: colorBabyPink()
            })))
        }
    }

    let [ssEveries, ssDoses, ssEsters, ssCVisibs, ssUVisibs] = getTDEs('steadystate-table', true);

    for (let i = 0; i < ssEveries.length; i++) {

        if (ssUVisibs[i]) {
            let ssUncertaintyCloud = [];
            for (let j = 0; j < NB_CLOUD_POINTS; j++) {
                let randx = Math.random() * (xmax - xmin) + xmin;
                let randidx = Math.floor(Math.random() * mcmcSamplesPK3C[ssEsters[i]].length);
                let y = e2SteadyState3C(randx, ssDoses[i], ssEveries[i], ...mcmcSamplesPK3C[ssEsters[i]][randidx]);
                ssUncertaintyCloud.push({ Time: randx, E2: y });
            }

            let testsscurve = fillCurve(t => e2SteadyState3C(t, ssDoses[i], ssEveries[i], ...PK3CParams[ssEsters[i]]), xmin, xmax, NB_LINE_POINTS);
            e2max = Math.max(e2max, ...testsscurve.map(p => p.E2));

            dotmarks.push(Plot.dot(ssUncertaintyCloud, { x: "Time", y: "E2", r: 1, fill: colorBabyBlue(), fillOpacity: 0.5 }));
        }

        if (ssCVisibs[i]) {
            let ssEsterCurve = fillCurve(t => e2SteadyState3C(t, ssDoses[i], ssEveries[i], ...PK3CParams[ssEsters[i]]), xmin, xmax, NB_LINE_POINTS);
            ssEsterCurve = ssEsterCurve.map(p => ({ Time: p.Time, E2: p.E2, type: `${ssEsters[i]} ${ssDoses[i]}mg/${ssEveries[i]}day${ssEveries[i] > 1 ? "s" : ""}` }));
            e2max = Math.max(e2max, ...ssEsterCurve.map(p => p.E2));
            linemarks.push(Plot.line(ssEsterCurve, { x: "Time", y: "E2", strokeWidth: 3, stroke: colorBabyPink() }));
            tipmarks.push(Plot.tip(ssEsterCurve, Plot.pointerX({
                x: "Time", y: "E2",
                title: p => `${p.type.toLowerCase()}\n\ntime: ${numberToDayHour(p.Time)}\n  e2: ${p.E2.toFixed(0)} pg/ml`,
                fontFamily: "monospace", fill: colorBackground(0.618), stroke: colorBabyPink()
            })));
        }
    }

    let e2curve = Plot.plot({
        width: 818,
        // height: 500,
        x: { label: "time (days)" },
        y: { domain: [0, 1.25 * e2max], label: "e₂ (pg/ml)" },
        marks: [
            Plot.gridX({ stroke: "grey" }),
            Plot.gridY({ stroke: "grey" }),
            Plot.ruleX([0]),
            Plot.ruleY([0]),
        ].concat(dotmarks).concat(linemarks).concat(tipmarks)
    })
    let div = document.getElementById("multidose-plot");
    div.innerHTML = "";
    div.append(e2curve);
}
