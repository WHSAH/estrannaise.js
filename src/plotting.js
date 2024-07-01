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
    "#019E73",  //     'rgb(1, 158, 115)'
    "#E79F03",  //     'rgb(231, 159, 3)'
    "#54ADE1",  //     'rgb(84, 173, 225)'
    "#F0E441",  //     'rgb(240, 228, 65)'
    "#0072B2",  //     'rgb(0, 114, 178)' 
    "#D55E00",  //     'rgb(213, 94, 0)'  
    "#CB79A7"   //     'rgb(203, 121, 167)
];

function wongPalette(n) {
    return WONG_PALETTE[n % WONG_PALETTE.length];
}

function colorLightForeground() { 
    let rootStyle = getComputedStyle(document.documentElement);
    return rootStyle.getPropertyValue('--light-foreground');
}

function colorStrongForeground() {
    let rootStyle = getComputedStyle(document.documentElement);
    return rootStyle.getPropertyValue('--strong-foreground');
}

function colorBackground() {
    let rootStyle = getComputedStyle(document.documentElement);
    return rootStyle.getPropertyValue('--background-color');
}

function numberToDayHour(number, precision = 0) {
    let days = Math.floor(number);
    let hours = (Math.round((number - days) * 24)).toFixed(precision);
    return `${days}d ${hours}h`;
}

export function getDefaultPlottingOptions(
    conversionFactor = 1.0, 
    currentColorscheme = 'day', 
    menstrualCycleVisible = false, 
    targetRangeVisible = false, 
    units = 'pg/mL',
    numberOfLinePoints = 900,
    numberOfCloudPoints = 3500,
    pointCloudSize = 1.3,
    pointCloudOpacity = 0.4
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
    };
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
 * @param {Boolean} returnHTML
 * @return Plot for insertion into the page
 */
export function plotCurves(dataset, options = getDefaultPlottingOptions(), returnHTML = false) {
    // track the max e2 across all multi-dose curves
    // to set the y-axis limit. uncertainty clouds ignored
    // because of potential stray dots.
    let yMax = 300;
    let xMax = 50.1; // Initialize minimum right limit for the time axis
    let colorCycle0 = 5;
    let dotMarks  = [],
        lineMarks = [],
        msMarks   = [],
        ruleMarks = [],
        tipMarks  = [],
        targetMarks = [];

    let xMin = 0;

    if (dataset.multidoses.curveVisible || dataset.multidoses.uncertaintyVisible) {
        if (dataset.multidoses.daysAsIntervals) {
            let timeSum = dataset.multidoses.entries.reduce((sum, entry) => sum + entry.time, 0);
            xMax = Math.max(xMax, 1.618 * timeSum);
        } else {
            xMax = Math.max(xMax, ...dataset.multidoses.entries.map(entry => entry.time));
        }
    }

    xMax = Math.max(xMax, ...dataset.steadystates.entries.map(entry => 5 * entry.time));

    // Menstrual cycle line and confidence interval area marks
    if (options.menstrualCycleVisible) {
        let _menstrualCycle = fillMenstrualCycleCurve(xMin, xMax, options.numberOfLinePoints, options.conversionFactor);
        msMarks = [
            Plot.line(_menstrualCycle, {
                x: 'Time', y: 'E2', strokeWidth: 2,
                stroke: options.currentColorScheme == 'night' ? '#FFFFFF' : '#000000', strokeOpacity: options.currentColorScheme == 'night' ? 0.6 : 0.5}),
            Plot.areaY(_menstrualCycle, {
                x: 'Time', y1: 'E2p5', y2: 'E2p95',
                fill: options.currentColorScheme == 'night' ? '#FFFFFF' : '#000000', fillOpacity: 0.1}),

            Plot.tip(_menstrualCycle, Plot.pointerX({
                x: 'Time', y: 'E2', fill: colorBackground(0.618), stroke: colorLightForeground(),
                title: p => `menstrual cycle\ntime: ${numberToDayHour(p.Time)}\n  e₂: ${p.E2.toFixed(0)} ${options.units}\n  CI: ${p.E2p5.toFixed(0)}-${p.E2p95.toFixed(0)} ${options.units}`,
            }))
        ];
        yMax = Math.max(yMax, options.conversionFactor * 350);
    }

    // Target range area and text marks
    if (options.targetRangeVisible) {
        let targetRange = fillTargetRange(xMin, xMax, options.conversionFactor);

        targetMarks = [
            Plot.areaY(targetRange, {
                x: 'time', y1: 'lower', y2: 'upper',
                // fill: options.currentColorScheme == 'night' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                fill: options.currentColorScheme == 'night' ? '#FFFFFF' : '#000000', fillOpacity: 0.1
            }),

            Plot.text(['target range'], {
                x: 0.99 * xMax, y: 150 * options.conversionFactor, rotate: 90, fill: colorStrongForeground(),
                frameAnchor: 'middle', textAnchor: 'middle', lineAnchor: 'bottom'
              })
        ];
    }

    // Multi-dose curves and uncertainty clouds
    if (dataset.multidoses.entries.length > 0) {

        let doses = dataset.multidoses.entries.map(entry => entry.dose);
        let times = dataset.multidoses.entries.map(entry => entry.time);
        let models = dataset.multidoses.entries.map(entry => entry.model);

        if (dataset.multidoses.uncertaintyVisible) {

            let multidoseUncertaintyCloud = [];
            
            for (let i = 0; i < options.numberOfCloudPoints; i++) {
                let randx = Math.random() * (xMax - xMin) + xMin;
                let y = e2MultiDose3C(randx, doses, times, models, options.conversionFactor, true, dataset.multidoses.daysAsIntervals);
                multidoseUncertaintyCloud.push({ Time: randx, E2: y });
            }

            dotMarks.push(Plot.dot(multidoseUncertaintyCloud, { 
                x: 'Time',
                y: 'E2', 
                r: options.pointCloudSize, 
                fill: wongPalette(4), fillOpacity: options.pointCloudOpacity}));
        }

        if (dataset.multidoses.curveVisible) {
            let multiDoseCurve = fillCurve(t => e2MultiDose3C(t, doses, times, models, options.conversionFactor, false, dataset.multidoses.daysAsIntervals), xMin, xMax, options.numberOfLinePoints);
            multiDoseCurve = multiDoseCurve.map(p => ({ Time: p.Time, E2: p.E2 }));

            yMax = Math.max(yMax, ...multiDoseCurve.map(p => p.E2));
            lineMarks.push(Plot.line(multiDoseCurve, {
                x: 'Time', 
                y: 'E2', 
                strokeWidth: 2, stroke: wongPalette(4), strokeDash: [2, 2]
            }));

            tipMarks.push(Plot.tip(multiDoseCurve, Plot.pointerX({
                x: 'Time', 
                y: 'E2', 
                fill: colorBackground(),  fillOpacity: 0.618,
                stroke: colorLightForeground(),
                title: p => `multi-dose\n\ntime: ${numberToDayHour(p.Time)}\n  e₂: ${p.E2.toFixed(0)} ${options.units}`
            })));
        }

    }

    // Steady-state curves and uncertainty clouds
    dataset.steadystates.entries.forEach((entry, index) => {
        
        if (entry.uncertaintyVisible) {
            let steadyStateUncertaintyCloud = [];
            for (let i = 0; i < options.numberOfCloudPoints; i++) {
                let randx = Math.random() * (xMax - xMin) + xMin;
                steadyStateUncertaintyCloud.push({ 
                    Time: randx, 
                    E2: PKRandomFunctions(options.conversionFactor)[entry.model](randx, entry.dose, true, entry.time)
                });
            }
            dotMarks.push(Plot.dot(steadyStateUncertaintyCloud, {
                x: 'Time', 
                y: 'E2', 
                r: options.pointCloudSize, 
                fill: wongPalette(colorCycle0 + index), fillOpacity: options.pointCloudOpacity
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
                strokeWidth: 2, stroke: wongPalette(colorCycle0 + index) }));
            tipMarks.unshift(Plot.tip(steadyStateCurve, Plot.pointerX({
                x: 'Time', y: 'E2',
                title: p => `${p.description.toLowerCase()}\n\n   time: ${numberToDayHour(p.Time)}\n     e₂: ${p.E2.toFixed(0)} ${options.units}\naverage: ${entry.model.includes('patch') ? 'unavailable' : e2ssAverage3C(options.conversionFactor * entry.dose, entry.time, ...PKParameters[entry.model]).toFixed(0)} ${entry.model.includes("patch") ? '' : options.units}\n trough: ${PKFunctions(options.conversionFactor)[entry.model](0.0, entry.dose, true, entry.time).toFixed(0)} ${options.units}`,
                fill: colorBackground(), fillOpacity: 0.618,
                stroke: colorLightForeground()
            })));

        }

    });


    let e2curve = Plot.plot({
        width: options.numberOfLinePoints,
        x: { label: 'time (days)' },
        y: { domain: [0, 1.25 * yMax], label: `serum e₂ (${options.units})` },
        style: { fontFamily: 'monospace' },
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

    if (returnHTML) {
        return e2curve;
    } else {
        return e2curve.outerHTML;
    }
}
