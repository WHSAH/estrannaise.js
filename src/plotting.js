import * as Plot from '@observablehq/plot';

import {
  e2multidose3C,
  e2ssAverage3C,
  fillCurve,
  fillMenstrualCycleCurve,
  fillTargetRange,
  availableUnits,
  PKFunctions,
  PKParameters,
  PKRandomFunctions,
  terminalEliminationTime3C
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

export function wongPalette(n) {
    return WONG_PALETTE[n % WONG_PALETTE.length];
}

function numberToDayHour(number, precision = 0) {
    let days = Math.floor(number);
    let hours = (Math.round((number - days) * 24)).toFixed(precision);
    return `${days}d ${hours}h`;
}

export function generatePlottingOptions({
    menstrualCycleVisible = false,
    targetRangeVisible = false,
    units = 'pg/mL',
    strokeWidth = 2,
    numberOfLinePoints = 900,
    numberOfCloudPoints = 3500,
    pointCloudSize = 1.3,
    pointCloudOpacity = 0.4,
    currentColorscheme = 'day',
    backgroundColor = '#FFFFFF',
    strongForegroundColor = '#525252',
    softForegroundColor = '#323232',
    fontSize = '0.9rem',
    aspectRatio = 0.43,
    } = {}) {
        return {
            menstrualCycleVisible,
            targetRangeVisible,
            units,
            strokeWidth,
            numberOfLinePoints,
            numberOfCloudPoints,
            pointCloudSize,
            pointCloudOpacity,
            currentColorscheme,
            backgroundColor,
            strongForegroundColor,
            softForegroundColor,
            fontSize,
            aspectRatio
    };
}


function findxMax(dataset, options) {

    // Initialize absolute minimum for the time axis
    let xMax = 14.1;

    // At least one menstrual cycle
    if (options.menstrualCycleVisible) xMax = 28.2;

    // At least 5 injection cycles
    xMax = Math.max(xMax, ...dataset.steadystates.entries.filter(entry => entry.curveVisible || entry.uncertaintyVisible).map(entry => 5 * entry.time));

    // At least injection time plus 5 approximate terminal half-lives ( 5 x log 2 / smallest k )
    if (dataset.customdoses.entries.length > 0 && (dataset.customdoses.curveVisible || dataset.customdoses.uncertaintyVisible)) {
        if (dataset.customdoses.daysAsIntervals) {
            let absoluteTimes = dataset.customdoses.entries.reduce((acc, entry, idx) => {
                // Ignore first entry in interval days
                if (idx === 0) { acc.push(0); }
                else { acc.push(acc[idx - 1] + entry.time); }
                return acc;
            }, []);
            xMax = Math.max(xMax, ...dataset.customdoses.entries.map((entry, idx) => absoluteTimes[idx] + terminalEliminationTime3C(entry.model)));
        } else {
            xMax = Math.max(xMax, ...dataset.customdoses.entries.map(entry => entry.time + terminalEliminationTime3C(entry.model)));
        }
    }

    return xMax
}

/**
 * Re-calculate all curves and rebuild the graph
 * @param {Object} dataset all the data from multi-doses and steady-state table
 * @param {Object} options containing the following keys:
 * * `menstrualCycleVisible`: boolean,
 * * `targetRangeVisible`: boolean,
 * * `units`: Object,
 * * `numberOfLinePoints`: integer,
 * * `numberOfCloudPoints`: integer,
 * * `pointCloudSize`: number,
 * * `pointCloudOpacity`: number,
 * * `currentColorScheme`: String
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

    let precision = availableUnits[options.units].precision;
    let units = availableUnits[options.units].units;
    let conversionFactor = availableUnits[options.units].conversionFactor;

    let yMax = conversionFactor * 300;
    let xMin = 0;
    let xMax = Math.max(14.1, findxMax(dataset, options));

    let dotMarks  = [],
        lineMarks = [],
        msMarks   = [],
        ruleMarks = [],
        gridMarks = [],
        tipMarks  = [],
        targetMarks = [];

    if (dataset.customdoses.entries.length > 0) {
        if (dataset.customdoses.daysAsIntervals) {
            xMin = Math.min(xMin, dataset.customdoses.entries[0].time);
        } else {
            xMin = Math.min(xMin, ...dataset.customdoses.entries.map(entry => entry.time))
        }
    }

    // Menstrual cycle line and confidence interval area marks
    if (options.menstrualCycleVisible) {
        let _menstrualCycle = fillMenstrualCycleCurve(xMin, xMax, options.numberOfLinePoints, conversionFactor);
        msMarks = [
            Plot.line(_menstrualCycle, {
                x: 'Time', y: 'E2',
                strokeWidth: options.strokeWidth,
                stroke: options.softForegroundColor,
                strokeOpacity: 0.6}),
            Plot.areaY(_menstrualCycle, {
                x: 'Time', y1: 'E2p5', y2: 'E2p95',
                fill: options.softForegroundColor,
                fillOpacity: 0.12}),

            Plot.tip(_menstrualCycle, Plot.pointerX({
                x: 'Time', y: 'E2',
                fill: options.backgroundColor,
                fillOpacity: 0.618,
                stroke: options.strongForegroundColor,
                title: p => `time: ${numberToDayHour(p.Time)}
                             ~~e₂: ${p.E2.toFixed(precision)} ${units}
                             ~~CI: ${p.E2p5.toFixed(precision)}-${p.E2p95.toFixed(precision)} ${units}`.replace(/(\n+)(\s*)/g, '\n').replace(/~/g, ' ')
            }))                                                                                                 /*   JS is silly with strings, but  */
        ];                                                                                                      /* I'm silly too so it's ok I guess */
        yMax = Math.max(yMax, conversionFactor * 414/1.25);
    }

    // Target range area and text marks
    if (options.targetRangeVisible) {
        let targetRange = fillTargetRange(xMin, xMax, conversionFactor);

        targetMarks = [
            Plot.areaY(targetRange, {
                x: 'time', y1: 'lower', y2: 'upper',
                fill: options.softForegroundColor,
                 fillOpacity: 0.15
            }),

            Plot.text(['target range'], {
                x: 0.985 * xMax, y: 150 * conversionFactor, rotate: 90,
                fill: options.softForegroundColor,
                frameAnchor: 'middle', textAnchor: 'middle', lineAnchor: 'bottom'
              })
        ];
        yMax = Math.max(yMax, conversionFactor * 200);
    }

    // Multi-dose curves and uncertainty clouds
    if (dataset.customdoses.entries.length > 0) {

        let doses = dataset.customdoses.entries.map(entry => entry.dose);
        let times = dataset.customdoses.entries.map(entry => entry.time);
        let models = dataset.customdoses.entries.map(entry => entry.model);

        if (dataset.customdoses.uncertaintyVisible) {
            let customdoseUncertaintyCloud = [];

            for (let i = 0; i < options.numberOfCloudPoints; i++) {
                let randx = Math.random() * (xMax - xMin) + xMin;
                let y = e2multidose3C(randx, doses, times, models, conversionFactor, true, dataset.customdoses.daysAsIntervals);
                customdoseUncertaintyCloud.push({ Time: randx, E2: y });
            }

            dotMarks.push(Plot.dot(customdoseUncertaintyCloud, {
                x: 'Time',
                y: 'E2',
                r: options.pointCloudSize,
                fill: dataset.customdoses.color ? dataset.customdoses.color : wongPalette(4),
                fillOpacity: options.pointCloudOpacity
            }));
        }

        // Always compute the curve to set the y-axis limit
        let customdoseCurve = fillCurve(t => e2multidose3C(t, doses, times, models, conversionFactor, false, dataset.customdoses.daysAsIntervals), xMin, xMax, options.numberOfLinePoints);
        yMax = Math.max(yMax, ...customdoseCurve.map(p => p.E2));

        if (dataset.customdoses.curveVisible) {
            customdoseCurve = customdoseCurve.map(p => ({ Time: p.Time, E2: p.E2 }));

            lineMarks.push(Plot.line(customdoseCurve, {
                x: 'Time',
                y: 'E2',
                stroke: dataset.customdoses.color ? dataset.customdoses.color : wongPalette(4),
                strokeWidth: options.strokeWidth
            }));

            tipMarks.push(Plot.tip(customdoseCurve, Plot.pointerX({
                x: 'Time',
                y: 'E2',
                fill: options.backgroundColor,
                fillOpacity: 0.6,
                stroke: options.strongForegroundColor,
                title: p => `time: ${numberToDayHour(p.Time)}
                             ~~e₂: ${p.E2.toFixed(precision)} ${units}`.replace(/(\n+)(\s*)/g, (_, p, __) => p).replace(/~/g, ' ')
            })));                                                                    /* lol. */
        }

    }

    // Steady-state curves and uncertainty clouds
    dataset.steadystates.entries.forEach((entry, idx) => {
        if (entry.uncertaintyVisible) {
            let steadyStateUncertaintyCloud = [];

            for (let i = 0; i < options.numberOfCloudPoints; i++) {
                let randx = Math.random() * (xMax - xMin) + xMin;
                let y = PKRandomFunctions(conversionFactor)[entry.model](randx, entry.dose, true, entry.time)
                steadyStateUncertaintyCloud.push({
                    Time: randx,
                    E2: y
                });
            }
            dotMarks.push(Plot.dot(steadyStateUncertaintyCloud, {
                x: 'Time',
                y: 'E2',
                r: options.pointCloudSize,
                fill: entry.color ? entry.color : wongPalette(5 + idx),
                fillOpacity: options.pointCloudOpacity
            }));
        }

        let steadyStateCurve = fillCurve(t => PKFunctions(conversionFactor)[entry.model](t, entry.dose, true, entry.time), xMin, xMax, options.numberOfLinePoints);
        yMax = Math.max(yMax, ...steadyStateCurve.map(p => p.E2));

        if (entry.curveVisible) {
            steadyStateCurve = steadyStateCurve.map(p => ({
                Time: p.Time,
                E2: p.E2,
                description: `${entry.model} ${entry.dose}mg/${entry.time}day${entry.time > 1 ? 's' : ''}`
             }));

            lineMarks.unshift(Plot.line(steadyStateCurve, {
                x: 'Time',
                y: 'E2',
                stroke: entry.color ? entry.color : wongPalette(5 + idx),
                strokeWidth: options.strokeWidth
            }));
            tipMarks.unshift(Plot.tip(steadyStateCurve, Plot.pointerX({
                x: 'Time', y: 'E2',        /* lmao even */
                title: p => `~~~time: ${numberToDayHour(p.Time)}
                             ~~~~~e₂: ${p.E2.toFixed(precision)} ${units}
                             average: ${entry.model.includes('patch') ? 'unavailable' : e2ssAverage3C(conversionFactor * entry.dose, entry.time, ...PKParameters[entry.model]).toFixed(precision)} ${entry.model.includes("patch") ? '' : units}
                             ~trough: ${PKFunctions(conversionFactor)[entry.model](0.0, entry.dose, true, entry.time).toFixed(precision)} ${units}`.replace(/(\n+)(\s*)/g, (_, p, __) => p).replace(/~/g, ' '),
                fill: options.backgroundColor,
                fillOpacity: 0.618,                                                                                               /* i mean just look at it */
                stroke: options.strongForegroundColor
            })));
        }
    });

    gridMarks.push(Plot.gridX({ stroke: 'grey' }), Plot.gridY({ stroke: 'grey' }));

    // Vertical and horizontal lines for the y and x axes
    ruleMarks.push(Plot.ruleX([xMin]), Plot.ruleY([0]));

    let e2curve = Plot.plot({
        width: options.numberOfLinePoints,
        height: options.aspectRatio * options.numberOfLinePoints,
        marginLeft: 80,
        marginBottom: 50,
        marginTop: 30,
        x: { domain: [xMin, xMax], label: 'time (days)', ticks: 7 },
        y: { domain: [0, 1.25 * yMax], label: `serum e₂ (${units})`, ticks: 6 },
        style: { fontFamily: 'monospace', fontSize: options.fontSize },
        marks: [].concat(gridMarks)
         .concat(targetMarks)
         .concat(msMarks)
         .concat(dotMarks)
         .concat(lineMarks)
         .concat(tipMarks)
         .concat(ruleMarks)
    });

    if (returnSVG) {
        return e2curve.outerHTML;
    } else {
        return e2curve;
    }
}
