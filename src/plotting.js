function fillCurve(func, xmin, xmax, nbsteps) {
    let curve = [];
    for (let i = xmin; i <= xmax; i += (xmax - xmin) / (nbsteps - 1)) {
        curve.push({ Time: i, E2: func(i) });
    }
    return curve;
}

function plotCurves() {

    let marks = [];

    let [mdTimes, mdDoses, mdEsters] = getTDEs('dose-table');

    let xmin = Math.min(0, ...mdTimes);
    let xmax = Math.max(31, 1.618 * Math.max(...mdTimes));

    if (mdTimes.length > 0) {

        if (document.getElementById('dose-table').rows[1].cells[1].querySelector('input[type="checkbox"]').checked) {
            let mdUncertaintyCloud = [];
            for (let i = 0; i < NB_CLOUD_POINTS; i++) {
                let randx = Math.random() * (xmax - xmin) + xmin;
                let y = e2MultiDoseEster3C(randx, mdDoses, mdTimes, mdEsters, true);
                mdUncertaintyCloud.push({ Time: randx, E2: y });
            }
            marks.push(Plot.dot(mdUncertaintyCloud, { x: "Time", y: "E2", r: 1, fill: colorBabyBlue(), fillOpacity: 0.5 }))
        }

        if (document.getElementById('dose-table').rows[1].cells[0].querySelector('input[type="checkbox"]').checked) {
            let multiDoseEstersCurve = fillCurve(t => e2MultiDoseEster3C(t, mdDoses, mdTimes, mdEsters), xmin, xmax, NB_LINE_POINTS);

            marks.push(Plot.line(multiDoseEstersCurve, { x: "Time", y: "E2", strokeWidth: 3, stroke: colorBabyPink() }))
            marks.push(Plot.tip(multiDoseEstersCurve, Plot.pointerX({ x: "Time", y: "E2", fill: colorBackground(), stroke: colorBabyPink() })))
        }
    }

    let [ssEveries, ssDoses, ssEsters] = getTDEs('steadystate-table');

    for (let i = 0; i < ssEveries.length; i++) {

        if (document.getElementById('steadystate-table').rows[1 + i].cells[1].querySelector('input[type="checkbox"]').checked) {
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
        }

        if (document.getElementById('steadystate-table').rows[1 + i].cells[0].querySelector('input[type="checkbox"]').checked) {
            let ssEsterCurve = fillCurve(t => e2SteadyState3C(t, ssDoses[i], ssEveries[i], ...PK3CParams[ssEsters[i]]), xmin, xmax, NB_LINE_POINTS);
            marks.push(Plot.line(ssEsterCurve, { x: "Time", y: "E2", strokeWidth: 3, stroke: colorBabyPink() }))
        }
    }

    let e2curve = Plot.plot({
        width: 828,
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
