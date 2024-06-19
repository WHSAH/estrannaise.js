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

const NB_CLOUD_POINTS = 3500;

const NB_LINE_POINTS = 848;

const CLOUD_POINT_SIZE = 1.3;

const CLOUD_POINT_OPACITY = 0.4;

const WONG_PALETTE = [
    'rgba(1, 158, 115, {})',   // #019E73
    'rgba(231, 159, 3, {})',   // #E79F03
    'rgba(84, 173, 225, {})',  // #54ADE1
    'rgba(240, 228, 65, {})',  // #F0E441
    'rgba(0, 114, 178, {})',   // #0072B2
    'rgba(213, 94, 0, {})',    // #D55E00
    'rgba(203, 121, 167, {})', // #CB79A7
];

function wongPalette(n, alpha = 1.0) {
    return WONG_PALETTE[n % WONG_PALETTE.length].replace('{}', alpha);
}

function convertCustomCSSVarToRGBA(varName, alpha = 1.0) {
    let rootStyle = getComputedStyle(document.documentElement);
    let color = rootStyle.getPropertyValue(varName);
    let rgb = '';
    if (color.startsWith('#')) {
        rgb = color;
        let r = parseInt(rgb.slice(1, 3), 16);
        let g = parseInt(rgb.slice(3, 5), 16);
        let b = parseInt(rgb.slice(5, 7), 16);
        rgb = `${r}, ${g}, ${b}`;
    } else {
        rgb = color.substring(4, color.length - 1);
    }
    return `rgba(${rgb}, ${alpha})`;
}

function colorLightForeground(alpha = 1.0) { return convertCustomCSSVarToRGBA('--light-foreground', alpha); }

function colorStrongForeground(alpha = 1.0) { return convertCustomCSSVarToRGBA('--strong-foreground', alpha); }

function colorBackground(alpha = 1.0) { return convertCustomCSSVarToRGBA('--background-color', alpha); }

function numberToDayHour(number, precision = 0) {
    let days = Math.floor(number);
    let hours = (Math.round((number - days) * 24)).toFixed(precision);
    return `${days}d ${hours}h`;
}

function sum(array) {
    return array.reduce((a, b) => a + b, 0);
}

/**
 * Re-calculate all curves and rebuild the graph
 * @param {Object} firstRow from multi-dose table
 * @param {Array} multiDoses
 * @param {Array} steadyDoses
 * @param {Object} options containing the following keys:
 * * `conversionFactor`: number,
 * * `currentColorScheme`: String
 * * `daysAsIntervals`: boolean,
 * * `menstrualCycleVisible`: boolean,
 * * `targetRangeVisible`: boolean,
 * * `units`: String
 * @return Plot for insertion into the page
 */
export function plotCurves(firstRow, multiDoses, steadyDoses, options) {
    // track the max e2 across all multi-dose curves
    // to set the y-axis limit. uncertainty clouds ignored
    // because of potential stray dots.
    let e2max = 300;
    let xmax = 70; // FIXME: Describe what this is
    let colorCycle = 5;
    let dotMarks  = [],
        lineMarks = [],
        msMarks   = [],
        ruleMarks = [],
        tipMarks  = [],
        targetMarks = [];

    // If the first row of the multi-dose table is invalid
    // we won't know about mdCVisib and mdUVisib
    let [mdTimes, mdDoses, mdTypes, [mdCVisib, ..._cnulls], [mdUVisib, ..._unulls]] = multiDoses;
    // FIXME: Have getTDEs() more robust against this to prevent this
    mdCVisib = firstRow.cVisibility;
    mdUVisib = firstRow.uVisibility;

    let [ssEveries, ssDoses, ssTypes, ssCVisibs, ssUVisibs] = steadyDoses;

    let xmin = 0;
    if (!options.daysAsIntervals) {
        xmin = Math.min(0, ...mdTimes);
    }

    if (mdCVisib || mdUVisib) {
        if (options.daysAsIntervals) {
            xmax = Math.max(xmax, 1.618 * (sum(mdTimes) - (mdTimes[0] ? mdTimes[0] : 0)));
        } else {
            xmax = Math.max(xmax, 1.618 * Math.max(...mdTimes));
        }
    }

    for (let i = 0; i < ssEveries.length; i++) {
        if (ssUVisibs[i] || ssCVisibs[i]) {
            xmax = Math.max(xmax, 5 * ssEveries[i]);
        }
    }

    if (options.menstrualCycleVisible) {
        let _menstrualCycle = fillMenstrualCycleCurve(xmin, xmax, NB_LINE_POINTS, options.conversionFactor);
        msMarks = [
            Plot.line(_menstrualCycle, {
                x: 'Time',
                y: 'E2',
                strokeWidth: 2,
                stroke: options.currentColorScheme == 'night' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)'}),
            Plot.areaY(_menstrualCycle, {
                x: 'Time',
                y1: 'E2p5',
                y2: 'E2p95',
                fill: options.currentColorScheme == 'night' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}),
            Plot.tip(_menstrualCycle, Plot.pointerX({
                x: 'Time',
                y: 'E2',
                title: p => `menstrual cycle\ntime: ${numberToDayHour(p.Time)}\n  e₂: ${p.E2.toFixed(0)} ${options.units}\n  CI: ${p.E2p5.toFixed(0)}-${p.E2p95.toFixed(0)} ${options.units}`,
                fill: colorBackground(0.618),
                stroke: colorLightForeground()
            }))
        ];
        e2max = Math.max(e2max, options.conversionFactor * 350);
    }

    if (options.targetRangeVisible) {
        let targetRange = fillTargetRange(xmin, xmax, options.conversionFactor);
        targetMarks = [
            Plot.areaY(targetRange, {
                x: 'time', y1: 'lower', y2: 'upper',
                fill: options.currentColorScheme == 'night' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }),
            Plot.text(['target range'], {
                x: 0.99 * xmax,
                y: 150 * options.conversionFactor,
                rotate: 90,
                fill: colorStrongForeground(),
                frameAnchor: 'middle',
                textAnchor: 'middle',
                lineAnchor: 'bottom'
              })
        ];
    }

    if (mdTimes.length > 0) {

        // Uncertainty cloud
        if (mdUVisib) {

            // If the uncertainty is visible but not the curve
            // we probe the range of the curve to set the y-axis limit
            // The cloud points are not used to set it since they
            // sometimes are too far up.
            if (!mdCVisib) {
                let probeMultiDoseCurve = fillCurve(t => e2MultiDose3C(t, mdDoses, mdTimes, mdTypes, options.conversionFactor, false, options.daysAsIntervals), xmin, xmax, NB_LINE_POINTS);
                e2max = Math.max(e2max, ...probeMultiDoseCurve.map(p => p.E2));
            }

            let mdUncertaintyCloud = [];
            for (let i = 0; i < NB_CLOUD_POINTS; i++) {
                let randx = Math.random() * (xmax - xmin) + xmin;
                let y = e2MultiDose3C(randx, mdDoses, mdTimes, mdTypes, options.conversionFactor, true, options.daysAsIntervals);
                mdUncertaintyCloud.push({ Time: randx, E2: y });
            }
            dotMarks.push(Plot.dot(mdUncertaintyCloud, { x: 'Time', y: 'E2', r: CLOUD_POINT_SIZE, fill: wongPalette(4, CLOUD_POINT_OPACITY) }));
        }

        if (mdCVisib) {
            let multiDoseCurve = fillCurve(t => e2MultiDose3C(t, mdDoses, mdTimes, mdTypes, options.conversionFactor, false, options.daysAsIntervals), xmin, xmax, NB_LINE_POINTS);
            multiDoseCurve = multiDoseCurve.map(p => ({ Time: p.Time, E2: p.E2 }));

            e2max = Math.max(e2max, ...multiDoseCurve.map(p => p.E2));
            lineMarks.push(Plot.line(multiDoseCurve, {
                x: 'Time',
                y: 'E2',
                strokeWidth: 2, 
                stroke: wongPalette(4), strokeDash: [2, 2]
            }));

            tipMarks.push(Plot.tip(multiDoseCurve, Plot.pointerX({
                x: 'Time', y: 'E2',
                title: p => `multi-dose\n\ntime: ${numberToDayHour(p.Time)}\n  e₂: ${p.E2.toFixed(0)} ${options.units}`,
                fill: colorBackground(0.618), stroke: colorLightForeground()
            })));
        }

    }

    for (let i = 0; i < ssEveries.length; i++) {

        if (ssUVisibs[i]) {

            let ssUncertaintyCloud = [];
            for (let j = 0; j < NB_CLOUD_POINTS; j++) {
                let randx = Math.random() * (xmax - xmin) + xmin;
                let y = PKRandomFunctions(options.conversionFactor)[ssTypes[i]](randx, ssDoses[i], true, ssEveries[i]);
                ssUncertaintyCloud.push({ Time: randx, E2: y });
            }

            if (!ssCVisibs[i]) {
                let probeSteadyStateCurve = fillCurve(t => PKFunctions(options.conversionFactor)[ssTypes[i]](t, ssDoses[i], true, ssEveries[i]), xmin, xmax, NB_LINE_POINTS);
                e2max = Math.max(e2max, ...probeSteadyStateCurve.map(p => p.E2));
            }

            dotMarks.unshift(Plot.dot(ssUncertaintyCloud, {
                x: 'Time',
                y: 'E2',
                r: CLOUD_POINT_SIZE,
                fill: wongPalette(colorCycle, CLOUD_POINT_OPACITY)
            }));
        }

        if (ssCVisibs[i]) {
            let ssEsterCurve = fillCurve(t => PKFunctions(options.conversionFactor)[ssTypes[i]](t, ssDoses[i], true, ssEveries[i]), xmin, xmax, NB_LINE_POINTS);
            ssEsterCurve = ssEsterCurve.map(p => ({
                Time: p.Time,
                E2: p.E2,
                type: `${ssTypes[i]} ${ssDoses[i]}mg/${ssEveries[i]}day${ssEveries[i] > 1 ? 's' : ''}`
            }));
            e2max = Math.max(e2max, ...ssEsterCurve.map(p => p.E2));
            lineMarks.unshift(Plot.line(ssEsterCurve, { x: 'Time', y: 'E2', strokeWidth: 2, stroke: wongPalette(colorCycle) }));
            tipMarks.unshift(Plot.tip(ssEsterCurve, Plot.pointerX({
                x: 'Time', y: 'E2',
                title: p => `${p.type.toLowerCase()},
                    time: ${numberToDayHour(p.Time)},
                    e₂: ${p.E2.toFixed(0)} ${options.units},
                    average: ${ssTypes[i].includes('patch') ? 'unavailable' : e2ssAverage3C(options.conversionFactor * ssDoses[i], ssEveries[i], ...PKParameters[ssTypes[i]]).toFixed(0)} ${ssTypes[i].includes("patch") ? '' : options.units}
                    trough: ${PKFunctions(options.conversionFactor)[ssTypes[i]](0.0, ssDoses[i], true, ssEveries[i]).toFixed(0)} ${options.units}`,
                fill: colorBackground(0.618), stroke: colorLightForeground()
            })));
        }

        colorCycle += 1;
    }

    let e2curve = Plot.plot({
        width: NB_LINE_POINTS,
        x: { label: 'time (days)' },
        y: { domain: [0, 1.25 * e2max], label: `serum e₂ (${options.units})` },
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
        .concat([Plot.ruleX([xmin]), Plot.ruleY([0])])
    });

    return e2curve;
}
