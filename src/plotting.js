import {
  e2MultiDose3C,
  e2ssAverage3C,
  fillCurve,
  fillMenstrualCycleCurve,
  fillTargetRange,
  PKFunctions,
  PKParameters,
  PKRandomFunctions,
} from './models.js';

// Colors need to be in hexcode to ouput SVG correctly
// and alpha needs to be specified by strokeOpacity and fillOpacity
const WONG_PALETTE = [
    "#019E73",  //     'rgb(  1, 158, 115)'  Green
    "#E79F03",  //     'rgb(231, 159,   3)'  Orange-yellow
    "#54ADE1",  //     'rgb( 84, 173, 225)'  Light blue
    "#F0E441",  //     'rgb(240, 228,  65)'  Yellow
    "#0072B2",  //     'rgb(  0, 114, 178)'  Blue (multicurve)
    "#D55E00",  //     'rgb(213,  94,   0)'  Orange
    "#CB79A7"   //     'rgb(203, 121, 167)   Pink
];

function wongPalette(n) {
    return WONG_PALETTE[n % WONG_PALETTE.length];
}

function numberToDayHour(number, precision = 0) {
    let days = Math.floor(number);
    let hours = (Math.round((number - days) * 24)).toFixed(precision);
    return `${days}d ${hours}h`;
}

export function generatePlottingOptions(
    conversionFactor = 1.0,
    currentColorscheme = 'day',
    menstrualCycleVisible = false,
    targetRangeVisible = false,
    units = 'pg/mL',
    numberOfLinePoints = 900,
    numberOfCloudPoints = 3500,
    pointCloudSize = 1.3,
    pointCloudOpacity = 0.4,
    backgroundColor = '#FFFFFF',
    strongForegroundColor = '#525252',
    softForegroundColor = '#323232'
    ) {
        return {
        conversionFactor: conversionFactor,
        currentColorScheme: currentColorscheme,
        menstrualCycleVisible: menstrualCycleVisible,
        targetRangeVisible: targetRangeVisible,
        units: units,
        numberOfLinePoints: numberOfLinePoints,
        numberOfCloudPoints: numberOfCloudPoints,
        pointCloudSize: pointCloudSize,
        pointCloudOpacity: pointCloudOpacity,
        backgroundColor: backgroundColor,
        strongForegroundColor: strongForegroundColor,
        softForegroundColor: softForegroundColor
    };
}

function findxMax(dataset, options) {

    // Initialize absolute minimum for the time axis
    let xMax = 14.1;

    // At least one menstrual cycles
    if (options.menstrualCycleVisible) xMax = 28.1;

    // At least 5 injection cycles
    xMax = Math.max(xMax, ...dataset.steadystates.entries.filter(entry => entry.curveVisible || entry.uncertaintyVisible).map(entry => 5 * entry.time));

    // At least injection time plus 5 approximate terminal half-lives ( 5 x log 2 / smallest k )
    if (dataset.multidoses.entries.length > 0 && (dataset.multidoses.curveVisible || dataset.multidoses.uncertaintyVisible)) {
        if (dataset.multidoses.daysAsIntervals) {
            let absoluteTimes = dataset.multidoses.entries.reduce((acc, entry, idx) => {
                if (idx === 0) { acc.push(entry.time); }
                else { acc.push(acc[idx - 1] + entry.time); }
                return acc;
            }, []);
            xMax = Math.max(xMax, ...dataset.multidoses.entries.map((entry, idx) => absoluteTimes[idx] + 5 * Math.log(2) / Math.min(...PKParameters[entry.model].slice(1))));
        } else {
            xMax = Math.max(xMax, ...dataset.multidoses.entries.map(entry => entry.time + 5 * Math.log(2) / Math.min(...PKParameters[entry.model].slice(1))));
        }
    }

    return xMax
}

/**
 * Re-calculate all curves and rebuild the graph
 * @param {Object} dataset all the data from multi-doses and steady-state table
 * @param {Object} options containing the following keys:
 * * `conversionFactor`: number,
 * * `currentColorScheme`: String
 * * `menstrualCycleVisible`: boolean,
 * * `targetRangeVisible`: boolean,
 * * `units`: String,
 * * `numberOfLinePoints`: integer,
 * * `numberOfCloudPoints`: integer,
 * * `pointCloudSize`: number,
 * * `pointCloudOpacity`: number,
 * * `backgroundColor`: String,
 * * `strongForegroundColor`: String,
 * * `softForegroundColor`: String
 * @param {Boolean} returnSVG
 * @return SVG when return SVG is true, otherwise plot for insertion into the page
 */
export function plotCurves(dataset, options = generatePlottingOptions(), returnSVG = true) {
    // track the max e2 across all multi-dose curves
    // to set the y-axis limit. uncertainty clouds ignored
    // because of potential stray dots.
    let yMax = 0;
    let xMin = 0;
    let xMax = findxMax(dataset, options);

    let colorCycle = 5;
    let dotMarks  = [],
        lineMarks = [],
        msMarks   = [],
        ruleMarks = [],
        tipMarks  = [],
        targetMarks = [];

    let prec = options.units === 'firkin/furlong\u00B3' ? 4 : 0;

    if (dataset.multidoses.entries.length > 0) {
        if (dataset.multidoses.daysAsIntervals) {
            xMin = Math.min(xMin, dataset.multidoses.entries[0].time);
        } else {
            xMin = Math.min(xMin, ...dataset.multidoses.entries.map(entry => entry.time))
        }
    }

    // Menstrual cycle line and confidence interval area marks
    if (options.menstrualCycleVisible) {
        let _menstrualCycle = fillMenstrualCycleCurve(xMin, xMax, options.numberOfLinePoints, options.conversionFactor);
        msMarks = [
            Plot.line(_menstrualCycle, {
                x: 'Time', y: 'E2', strokeWidth: 2,
                stroke: options.softForegroundColor, strokeOpacity: 0.8}),
            Plot.areaY(_menstrualCycle, {
                x: 'Time', y1: 'E2p5', y2: 'E2p95',
                fill: options.softForegroundColor, fillOpacity: 0.12}),

            Plot.tip(_menstrualCycle, Plot.pointerX({
                x: 'Time', y: 'E2',
                fill: options.backgroundColor, fillOpacity: 0.618,
                stroke: options.strongForegroundColor,
                title: p => `menstrual cycle\ntime: ${numberToDayHour(p.Time)}\n  e₂: ${p.E2.toFixed(prec)} ${options.units}\n  CI: ${p.E2p5.toFixed(prec)}-${p.E2p95.toFixed(prec)} ${options.units}`,
            }))
        ];
        yMax = Math.max(yMax, options.conversionFactor * 415);
    }

    // Target range area and text marks
    if (options.targetRangeVisible) {
        let targetRange = fillTargetRange(xMin, xMax, options.conversionFactor);

        targetMarks = [
            Plot.areaY(targetRange, {
                x: 'time', y1: 'lower', y2: 'upper',
                fill: options.softForegroundColor, fillOpacity: 0.15
            }),

            Plot.text(['target range'], {
                x: 0.99 * xMax, y: 150 * options.conversionFactor, rotate: 90,
                fill: options.softForegroundColor,
                frameAnchor: 'middle', textAnchor: 'middle', lineAnchor: 'bottom'
              })
        ];
        yMax = Math.max(yMax, options.conversionFactor * 200);
    }

    let cloudYs = []; // In case we need them to set yMax.

    // Multi-dose curves and uncertainty clouds
    if (dataset.multidoses.entries.length > 0) {

        let doses = dataset.multidoses.entries.map(entry => entry.dose);
        let times = dataset.multidoses.entries.map(entry => entry.time);
        let models = dataset.multidoses.entries.map(entry => entry.model);

        if (dataset.multidoses.uncertaintyVisible) {
            let multiDoseUncertaintyCloud = [];

            for (let i = 0; i < options.numberOfCloudPoints; i++) {
                let randx = Math.random() * (xMax - xMin) + xMin;
                let y = e2MultiDose3C(randx, doses, times, models, options.conversionFactor, true, dataset.multidoses.daysAsIntervals);
                cloudYs.push(y);
                multiDoseUncertaintyCloud.push({ Time: randx, E2: y });
            }

            dotMarks.push(Plot.dot(multiDoseUncertaintyCloud, {
                x: 'Time',
                y: 'E2',
                r: options.pointCloudSize,
                fill: wongPalette(4), fillOpacity: options.pointCloudOpacity
            }));
        }

        if (dataset.multidoses.curveVisible) {
            let multiDoseCurve = fillCurve(t => e2MultiDose3C(t, doses, times, models, options.conversionFactor, false, dataset.multidoses.daysAsIntervals), xMin, xMax, options.numberOfLinePoints);
            multiDoseCurve = multiDoseCurve.map(p => ({ Time: p.Time, E2: p.E2 }));

            yMax = Math.max(yMax, ...multiDoseCurve.map(p => p.E2));
            lineMarks.push(Plot.line(multiDoseCurve, {
                x: 'Time',
                y: 'E2',
                stroke: wongPalette(4), strokeWidth: 2
            }));

            tipMarks.push(Plot.tip(multiDoseCurve, Plot.pointerX({
                x: 'Time',
                y: 'E2',
                fill: options.backgroundColor, fillOpacity: 0.618,
                stroke: options.strongForegroundColor,
                title: p => `multi-dose\n\ntime: ${numberToDayHour(p.Time)}\n  e₂: ${p.E2.toFixed(prec)} ${options.units}`
            })));
        }

    }

    // Steady-state curves and uncertainty clouds
    dataset.steadystates.entries.forEach((entry) => {
        if (entry.uncertaintyVisible) {
            let steadyStateUncertaintyCloud = [];

            for (let i = 0; i < options.numberOfCloudPoints; i++) {
                let randx = Math.random() * (xMax - xMin) + xMin;
                let y = PKRandomFunctions(options.conversionFactor)[entry.model](randx, entry.dose, true, entry.time)
                steadyStateUncertaintyCloud.push({
                    Time: randx,
                    E2: y
                });
                cloudYs.push(y);
            }
            dotMarks.push(Plot.dot(steadyStateUncertaintyCloud, {
                x: 'Time',
                y: 'E2',
                r: options.pointCloudSize,
                fill: wongPalette(colorCycle), fillOpacity: options.pointCloudOpacity
            }));
        }

        if (entry.curveVisible) {
            let steadyStateCurve = fillCurve(t => PKFunctions(options.conversionFactor)[entry.model](t, entry.dose, true, entry.time), xMin, xMax, options.numberOfLinePoints);
            steadyStateCurve = steadyStateCurve.map(p => ({
                Time: p.Time,
                E2: p.E2,
                description: `${entry.model} ${entry.dose}mg/${entry.time}day${entry.time > 1 ? 's' : ''}`
             }));

            yMax = Math.max(yMax, ...steadyStateCurve.map(p => p.E2));

            lineMarks.unshift(Plot.line(steadyStateCurve, {
                x: 'Time',
                y: 'E2',
                stroke: wongPalette(colorCycle), strokeWidth: 2
            }));
            tipMarks.unshift(Plot.tip(steadyStateCurve, Plot.pointerX({
                x: 'Time', y: 'E2',
                title: p => `${p.description.toLowerCase()}\n\n   time: ${numberToDayHour(p.Time)}\n     e₂: ${p.E2.toFixed(prec)} ${options.units}\naverage: ${entry.model.includes('patch') ? 'unavailable' : e2ssAverage3C(options.conversionFactor * entry.dose, entry.time, ...PKParameters[entry.model]).toFixed(prec)} ${entry.model.includes("patch") ? '' : options.units}\n trough: ${PKFunctions(options.conversionFactor)[entry.model](0.0, entry.dose, true, entry.time).toFixed(prec)} ${options.units}`,
                fill: options.backgroundColor, fillOpacity: 0.618,
                stroke: options.strongForegroundColor
            })));
        }

        if (entry.curveVisible || entry.uncertaintyVisible) colorCycle++;

    });

    // If no curve or target range or menstrual cycle are visible
    // then yMax is still 0. Use uncertainty clouds to set the y-axis limit
    // if any of them is visible.
    if (yMax === 0) yMax = Math.max(...cloudYs);

    let e2curve = Plot.plot({
        width: options.numberOfLinePoints,
        x: { label: 'time (days)' },
        y: { domain: [0, 1.25 * yMax], label: `serum e₂ (${options.units})` },
        style: { fontFamily: 'IBM Plex Mono' },
        marks: [
            Plot.gridX({ stroke: 'grey' }),
            Plot.gridY({ stroke: 'grey' }),
        ].concat(targetMarks)
        .concat(msMarks)
        .concat(ruleMarks)
        .concat(dotMarks)
        .concat(lineMarks)
        .concat(tipMarks)
        .concat([Plot.ruleX([xMin]), Plot.ruleY([0])])
    });

    if (returnSVG) {
        return e2curve.outerHTML;
    } else {
        return e2curve;
    }
}
