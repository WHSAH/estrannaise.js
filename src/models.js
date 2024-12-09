import Spline from 'cubic-spline';

import {
    PKParameters,
    mcmcSamplesPK,
    menstrualCycleData,
    modelList,
    availableUnits
} from './modeldata.js';

// Export those values to avoid further upstream importing
export {
    modelList,
    PKParameters,
    availableUnits
};

const menstrualCycleSpline = new Spline(menstrualCycleData['t'], menstrualCycleData['E2']);
const menstrualCycleSplineP05 = new Spline(menstrualCycleData['t'], menstrualCycleData['E2p5']);
const menstrualCycleSplineP95 = new Spline(menstrualCycleData['t'], menstrualCycleData['E2p95']);

/**
 * Generate a curve representing average menstrual cycle with 5th and 95 percentiles
 * @param {number} xMin
 * @param {number} xMax
 * @param {number} nbSteps
 * @param {number} conversionFactor
 * @returns {Object}
 */
export function fillMenstrualCycleCurve(xMin, xMax, nbSteps, conversionFactor = 1.0) {
    let curve = [];
    for (let t = xMin; t <= xMax; t += (xMax - xMin) / (nbSteps - 1)) {
        curve.push({
            Time: t,
            E2: conversionFactor * menstrualCycleSpline.at(((t % 28) + 28) % 28),
            E2p5: conversionFactor * menstrualCycleSplineP05.at(((t % 28) + 28) % 28),
            E2p95: conversionFactor * menstrualCycleSplineP95.at(((t % 28) + 28) % 28)
        });
    }
    return curve;
}

/**
 * Generate the "curve" for target mean levels for transfeminine HRT,
 * based on WPATH SOC 8 + Endocrine Society Guidelines.
 * @param {number} xMin
 * @param {number} xMax
 * @param {number} conversionFactor Conversion factor between units
 */
export function fillTargetRange(xMin, xMax, conversionFactor = 1.0) {
    return [{ time: xMin, lower: conversionFactor * 100, upper: conversionFactor * 200},
            { time: xMax, lower: conversionFactor * 100, upper: conversionFactor * 200}];
}

/**
 * Convenience function for when iterating over model functions
 * @param {function} func
 * @param {number} xMin
 * @param {number} xMax
 * @param {number} nbSteps
 */
export function fillCurve(func, xMin, xMax, nbSteps) {
    let curve = [];
    for (let i = xMin; i <= xMax; i += (xMax - xMin) / (nbSteps - 1)) {
        curve.push({ Time: i, E2: func(i) });
    }
    return curve;
}

// lil bit of ravioli code, but then if we wanted
// to replace this with a more general master PKFunction
// we'd have to add ds=0.0 and d2=0.0 in PKParameters of each esters
// and W for patches and then do the same in mcmcSamplesPK.
// This allows for a little bit more flexibility in the future
// if we want to add more compartments or initial conditions.
// Generalizing too soon is a bad idea.
//
// ...but I could also move on to using dictionaries as arguments
// instead of positional arguments, that would be a good idea.

/**
 * Accessor function for each method
 * @param {number} conversionFactor Conversion factor between units
 */
export function PKFunctions(conversionFactor = 1.0) {
    return {
        'EV im': (t, dose, steadystate=false, T=0.0) => { return e2Curve3C(t, conversionFactor * dose, ...PKParameters['EV im'], 0.0, 0.0, steadystate, T); },
        'EEn im': (t, dose, steadystate=false, T=0.0) => { return e2Curve3C(t, conversionFactor * dose, ...PKParameters['EEn im'], 0.0, 0.0, steadystate, T); },
        'EC im': (t, dose, steadystate=false, T=0.0) => { return e2Curve3C(t, conversionFactor * dose, ...PKParameters['EC im'], 0.0, 0.0, steadystate, T); },
        'EUn im': (t, dose, steadystate=false, T=0.0) => { return e2Curve3C(t, conversionFactor * dose, ...PKParameters['EUn im'], 0.0, 0.0, steadystate, T); },
        'EUn casubq': (t, dose, steadystate=false, T=0.0) => { return e2Curve3C(t, conversionFactor * dose, ...PKParameters['EUn casubq'], 0.0, 0.0, steadystate, T); },
        'EB im': (t, dose, steadystate=false, T=0.0) => { return e2Curve3C(t, conversionFactor * dose, ...PKParameters['EB im'], 0.0, 0.0, steadystate, T); },
        'patch tw': (t, dose, steadystate=false, T=0.0) => { return e2Patch3C(t, conversionFactor * dose, ...PKParameters['patch tw'], 3.5, steadystate, T); },
        'patch ow': (t, dose, steadystate=false, T=0.0) => { return e2Patch3C(t, conversionFactor * dose, ...PKParameters['patch ow'], 7.0, steadystate, T); }
    };
}

/**
 * Accessor function for random (uncertainty) values
 * @param {number} conversionFactor Conversion factor between units
 */
export function PKRandomFunctions(conversionFactor = 1.0) {
    return {
        'EV im': (t, dose, steadystate=false, T=0.0, idx=null) => { return e2Curve3C(t, conversionFactor * dose, ...randomMCMCSample('EV im', idx), 0.0, 0.0, steadystate, T); },
        'EEn im': (t, dose, steadystate=false, T=0.0, idx=null) => { return e2Curve3C(t, conversionFactor * dose, ...randomMCMCSample('EEn im', idx), 0.0, 0.0, steadystate, T); },
        'EC im': (t, dose, steadystate=false, T=0.0, idx=null) => { return e2Curve3C(t, conversionFactor * dose, ...randomMCMCSample('EC im', idx), 0.0, 0.0, steadystate, T); },
        'EUn im': (t, dose, steadystate=false, T=0.0, idx=null) => { return e2Curve3C(t, conversionFactor * dose, ...randomMCMCSample('EUn im', idx), 0.0, 0.0, steadystate, T); },
        'EUn casubq': (t, dose, steadystate=false, T=0.0, idx=null) => { return e2Curve3C(t, conversionFactor * dose, ...randomMCMCSample('EUn casubq', idx), 0.0, 0.0, steadystate, T); },
        'EB im': (t, dose, steadystate=false, T=0.0, idx=null) => { return e2Curve3C(t, conversionFactor * dose, ...randomMCMCSample('EB im', idx), 0.0, 0.0, steadystate, T); },
        'patch tw': (t, dose, steadystate=false, T=0.0, idx=null) => { return e2Patch3C(t, conversionFactor * dose, ...randomMCMCSample('patch tw', idx), 3.5, steadystate, T); },
        'patch ow': (t, dose, steadystate=false, T=0.0, idx=null) => { return e2Patch3C(t, conversionFactor * dose, ...randomMCMCSample('patch ow', idx), 7.0, steadystate, T); }
    };
}

/**
 * Calculate a given set of multi-doses
 * Offset values of `doses`, `times`, and `types` need to match.
 * @param {number} t time offset for dose calculation
 * @param {Array} doses Dose amounts, in mg
 * @param {Array} times Dosing intervals, in days
 * @param {Array} types Ester/types, see `methodList` for values
 * @param {number} cf conversion factor for conversion from pg/mL to other
 * @param {boolean} random if values need uncertainty applied
 * @param {boolean} intervals true if days are set as interval
 */
export function e2multidose3C(t, doses = [1.0], times = [0.0], models = ['EV im'], cf = 1.0, random = false, intervals = false) {

    if (intervals) {
        // Some Chad wrote this code, I don't know who.
        // My only contribution is the -times[0] to ignore
        // the first interval
        times = times.map((sum => value => sum += value)(-times[0]));
    };

    let sum = 0;
    for (let i = 0; i < doses.length; i++) {
        if (random === false) {
            sum += PKFunctions(cf)[models[i]](t - times[i], doses[i]);
        } else if (random === true) {
            sum += PKRandomFunctions(cf)[models[i]](t - times[i], doses[i]);
        } else if (random >= 0) {
            sum += PKRandomFunctions(cf)[models[i]](t - times[i], doses[i], random);
        }
    }
    return sum;
}

// Keep k1 and k2 for splatting PKParameters
export function e2ssAverage3C(dose, T, d, _k1, _k2, k3) {
    return dose * d / k3 / T;
}

export function randomMCMCSample(type, idx=null) {
    if (idx === null) {
        idx = Math.floor(Math.random() * mcmcSamplesPK[type].length);
    }
    return mcmcSamplesPK[type][idx];
}

// parameters ds and d2 are optional initial conditions
// Es(0) = ds and E2(0) = d2 for the second and third compartments
export function e2Curve3C(t, dose, d, k1, k2, k3, Ds = 0.0, D2 = 0.0, steadystate = false, T = 1.0) {

    if (!steadystate) {
        if (t < 0) {
            return 0;
        }

        let ret = 0;

        if (D2 > 0) {
            ret += D2 * Math.exp(-k3 * t);
        }

        if (Ds > 0) {
            if (k2 == k3) {
                ret += Ds * k2 * t * Math.exp(-k2 * t);
            } else {
                ret += Ds * k2 / (k2 - k3) * (Math.exp(-k3 * t) - Math.exp(-k2 * t));
            }
        }

        // When one or more rate is equal the single-dose solution
        // is ill-defined because one or more denominators are zero.
        // In these cases we must first take the limit the recover
        // the correct solution.

        // ...buuut meh, we could just as well simply
        // perturb the rates by a tiny amount instead of doing
        // this lengthy limit thing.

        if (dose > 0 && d > 0) {
            if (k1 == k2 && k2 == k3) {
                ret += dose * d * k1 * k1 * t * t * Math.exp(-k1 * t) / 2;
            } else if (k1 == k2 && k2 != k3) {
                ret += dose * d * k1 * k1 * (Math.exp(-k3 * t) - Math.exp(-k1 * t) * (1 + (k1 - k3) * t)) / (k1 - k3) / (k1 - k3);
            } else if (k1 != k2 && k1 == k3) {
                ret += dose * d * k1 * k2 * (Math.exp(-k2 * t) - Math.exp(-k1 * t) * (1 + (k1 - k2) * t)) / (k1 - k2) / (k1 - k2);
            } else if (k1 != k2 && k2 == k3) {
                ret += dose * d * k1 * k2 * (Math.exp(-k1 * t) - Math.exp(-k2 * t) * (1 - (k1 - k2) * t)) / (k1 - k2) / (k1 - k2);
            } else {
                ret += dose * d * k1 * k2 * (Math.exp(-k1 * t) / (k1 - k2) / (k1 - k3) - Math.exp(-k2 * t) / (k1 - k2) / (k2 - k3) + Math.exp(-k3 * t) / (k1 - k3) / (k2 - k3));
            }
        }
        if (isNaN(ret)) {
            return 0;
        } else {
            return ret;
        }
    } else {
        return e2SteadyState3C(t, dose, T, d, k1, k2, k3);
    }
}

export function esSingleDose3C(t, dose, d, k1, k2, _k3, Ds = 0.0) {

    if (t < 0) {
        return 0.0;
    }

    let ret = 0.0;

    if (Ds > 0) {
        ret += Ds * Math.exp(-k2 * t);
    }

    if (dose > 0 && d > 0) {
        if (k1 === k2) {
            ret += dose * d * k1 * t * Math.exp(-k1 * t);
        } else {
            ret += dose * d * k1 / (k1 - k2) * (Math.exp(-k2 * t) - Math.exp(-k1 * t));
        }
    }
    return ret;
}


export function e2SteadyState3C(t, dose, T, d, k1, k2, k3) {
    return dose * d * k1 * k2 * (Math.exp(-k1 * (t - T * Math.floor(t / T))) / (1 - Math.exp(-k1 * T)) / (k1 - k2) / (k1 - k3) - Math.exp(-k2 * (t - T * Math.floor(t / T))) / (1 - Math.exp(-k2 * T)) / (k1 - k2) / (k2 - k3) + Math.exp(-k3 * (t - T * Math.floor(t / T))) / (1 - Math.exp(-k3 * T)) / (k1 - k3) / (k2 - k3));
}

export function e2Patch3C(t, dose, d, k1, k2, k3, W, steadystate = false, T = 0.0) {
    if (!steadystate){
        if (t < 0.0) {
            return 0.0;
        } else if ((0 <= t) && (t <= W)) {
            return e2Curve3C(t, dose, d, k1, k2, k3);
        } else if (t > W) {
            let esW = esSingleDose3C(W, dose, d, k1, k2, k3);
            let e2W = e2Curve3C(W, dose, d, k1, k2, k3);
            return e2Curve3C(t - W, 0.0, 0.0, k1, k2, k3, esW, e2W);
        }
    } else {
        return e2SteadyStatePatch3C(t, dose, T, d, k1, k2, k3, W);
    }
}

export function e2SteadyStatePatch3C(t, dose, T, d, k1, k2, k3, W) {
    let esW = esSingleDose3C(W, dose, d, k1, k2, k3);
    let e2W = e2Curve3C(W, dose, d, k1, k2, k3);

    let ret = dose * d * k1 * k2 * (
        Math.exp(_logsubexp(-k1 * (t - T * Math.floor(t/T)), -k1 * (t - T * Math.floor((t - W)/T)))) / (1 - Math.exp(-k1 * T)) / (k1 - k2) / (k1 - k3)
      - Math.exp(_logsubexp(-k2 * (t - T * Math.floor(t/T)), -k2 * (t - T * Math.floor((t - W)/T)))) / (1 - Math.exp(-k2 * T)) / (k1 - k2) / (k2 - k3)
      + Math.exp(_logsubexp(-k3 * (t - T * Math.floor(t/T)), -k3 * (t - T * Math.floor((t - W)/T)))) / (1 - Math.exp(-k3 * T)) / (k1 - k3) / (k2 - k3)
    );

    ret += esW * k2 / (k2 - k3) * (Math.exp(-k3 * (t - W - T * Math.floor((t - W)/T))) / (1 - Math.exp(-k3 * T)) - Math.exp(-k2 * (t - W - T * Math.floor((t - W)/T))) / (1 - Math.exp(-k2 * T)));

    ret += e2W * Math.exp(-k3 * (t - W - T * Math.floor((t - W)/T))) / (1 - Math.exp(-k3 * T));

    return ret;
}

function _logsubexp(x, y) {
    if (y > x) {
        throw new Error('Invalid input: y should be less than or equal to x');
    }
    else if (x === y) {
        return -Infinity;
    }
    else {
        return x + Math.log(1 - Math.exp(y - x));
    }
}

// Use the 1C approximation to estimate the terminal elimination time
// When k1, k2, k3 are close 5x the minimum k might not be enough
export function terminalEliminationTime3C(_d, k1, k2, k3, nbHalfLives = 5) {
    return nbHalfLives * Math.log(2) * (1 / k1 + 1 / k2 + 1 / k3);
}

function goldenSectionSearch(f, a, b, tolerance = 1e-5, maxIterations = 100) {
    const phi = (1 + Math.sqrt(5)) / 2; // The golden ratio
    let c = b - (b - a) / phi;
    let d = a + (b - a) / phi;

    for (let i = 0; i < maxIterations; i++) {
        if (f(c) < f(d)) {
            b = d;
        } else {
            a = c;
        }

        c = b - (b - a) / phi;
        d = a + (b - a) / phi;
        if (Math.abs(b - a) < tolerance) {
            break;
        }
    }

    return (b + a) / 2;
}

export function getPKQuantities3C(_d, k1, k2, k3) {
    let terminalTime = terminalEliminationTime3C(1.0, k1, k2, k3);
    let Tmax = goldenSectionSearch(t => -e2Curve3C(t, 1.0, 1.0, k1, k2, k3), 0, terminalTime);
    let Cmax = e2Curve3C(Tmax, 1.0, 1.0, k1, k2, k3);
    let Chalf = Cmax / 2;
    let Thalf = goldenSectionSearch(t => (e2Curve3C(t, 1.0, 1.0, k1, k2, k3) - Chalf)**2, Tmax, terminalTime);
    let ThalfAbsorption = goldenSectionSearch(t => (e2Curve3C(t, 1.0, 1.0, k1, k2, k3) - Chalf)**2, 0, Tmax);
    let halfLife = Thalf - Tmax;
    let halfLifeAbsorption = ThalfAbsorption;
    return { Tmax: Tmax, Cmax: d * Cmax, halfLife: halfLife, halfLifeAbsorption: halfLifeAbsorption };
}

export function getPKQuantities(model) {
    return getPKQuantities3C(...PKParameters[model]);
}
