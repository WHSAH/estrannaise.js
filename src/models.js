let Spline = require('cubic-spline');

import { conversionFactor } from './core.js';

import {
  mcmcSamplesPK,
  PKParams,
  menstrualCycleData,
} from './modeldata.js';

export const methodList = ["EB im", "EV im", "EEn im", "EC im", "EUn im", "EUn casubq", "patch tw", "patch ow"];

const menstrualCycleSpline = new Spline(menstrualCycleData["t"], menstrualCycleData["E2"]);
const menstrualCycleSplineP05 = new Spline(menstrualCycleData["t"], menstrualCycleData["E2p5"]);
const menstrualCycleSplineP95 = new Spline(menstrualCycleData["t"], menstrualCycleData["E2p95"]);

export function menstrualCycle(time) {
    let t = ((time % 28) + 28) % 28; // end of day 28 = day 0
    return conversionFactor * menstrualCycleSpline.at(t);
}

export function menstrualCycleP05(time) {
    let t = ((time % 28) + 28) % 28;
    return conversionFactor * menstrualCycleSplineP05.at(t);
}

export function menstrualCycleP95(time) {
    let t = ((time % 28) + 28) % 28;
    return conversionFactor * menstrualCycleSplineP95.at(t);
}

// lil bit of ravioli code, but then if we wanted
// to replace this with a more general master PKFunction
// we'd have to add ds=0.0 and d2=0.0 in PKParams of each esters
// and W for patches and then do the same in mcmcSamplesPK.
// This allows for a little bit more flexibility in the future
// if we want to add more compartments or initial conditions.
// Generalizing too soon is a bad idea.
//
// ...but I could also move on to using dictionaries as arguments
// instead of positional arguments, that would be a good idea.

export const PKFunctions = {
    "EV im": (t, dose, steadystate=false, T=0.0) => { return e2Curve3C(t, conversionFactor * dose, ...PKParams["EV im"], 0.0, 0.0, steadystate, T); },
    "EEn im": (t, dose, steadystate=false, T=0.0) => { return e2Curve3C(t, conversionFactor * dose, ...PKParams["EEn im"], 0.0, 0.0, steadystate, T); },
    "EC im": (t, dose, steadystate=false, T=0.0) => { return e2Curve3C(t, conversionFactor * dose, ...PKParams["EC im"], 0.0, 0.0, steadystate, T); },
    "EUn im": (t, dose, steadystate=false, T=0.0) => { return e2Curve3C(t, conversionFactor * dose, ...PKParams["EUn im"], 0.0, 0.0, steadystate, T); },
    "EUn casubq": (t, dose, steadystate=false, T=0.0) => { return e2Curve3C(t, conversionFactor * dose, ...PKParams["EUn casubq"], 0.0, 0.0, steadystate, T); },
    "EB im": (t, dose, steadystate=false, T=0.0) => { return e2Curve3C(t, conversionFactor * dose, ...PKParams["EB im"], 0.0, 0.0, steadystate, T); },
    "patch tw": (t, dose, steadystate=false, T=0.0) => { return e2Patch3C(t, conversionFactor * dose, ...PKParams["patch tw"], 3.5, steadystate, T); },
    "patch ow": (t, dose, steadystate=false, T=0.0) => { return e2Patch3C(t, conversionFactor * dose, ...PKParams["patch ow"], 7.0, steadystate, T); }
};

export const PKRandomFunctions = {
    "EV im": (t, dose, steadystate=false, T=0.0, idx=null) => { return e2Curve3C(t, conversionFactor * dose, ...randomMCMCSample("EV im", idx), 0.0, 0.0, steadystate, T); },
    "EEn im": (t, dose, steadystate=false, T=0.0, idx=null) => { return e2Curve3C(t, conversionFactor * dose, ...randomMCMCSample("EEn im", idx), 0.0, 0.0, steadystate, T); },
    "EC im": (t, dose, steadystate=false, T=0.0, idx=null) => { return e2Curve3C(t, conversionFactor * dose, ...randomMCMCSample("EC im", idx), 0.0, 0.0, steadystate, T); },
    "EUn im": (t, dose, steadystate=false, T=0.0, idx=null) => { return e2Curve3C(t, conversionFactor * dose, ...randomMCMCSample("EUn im", idx), 0.0, 0.0, steadystate, T); },
    "EUn casubq": (t, dose, steadystate=false, T=0.0, idx=null) => { return e2Curve3C(t, conversionFactor * dose, ...randomMCMCSample("EUn casubq", idx), 0.0, 0.0, steadystate, T); },
    "EB im": (t, dose, steadystate=false, T=0.0, idx=null) => { return e2Curve3C(t, conversionFactor * dose, ...randomMCMCSample("EB im", idx), 0.0, 0.0, steadystate, T); },
    "patch tw": (t, dose, steadystate=false, T=0.0, idx=null) => { return e2Patch3C(t, conversionFactor * dose, ...randomMCMCSample("patch tw", idx), 3.5, steadystate, T); },
    "patch ow": (t, dose, steadystate=false, T=0.0, idx=null) => { return e2Patch3C(t, conversionFactor * dose, ...randomMCMCSample("patch ow", idx), 7.0, steadystate, T); }
};

function randomMCMCSample(type, idx=null) {
    if (idx === null) {
        idx = Math.floor(Math.random() * mcmcSamplesPK[type].length);
    }
    return mcmcSamplesPK[type][idx];
}

// parameters ds and d2 are optional initial conditions
// Es(0) = ds and E2(0) = d2 for the second and third compartments
export function e2Curve3C(t, dose, d, k1, k2, k3, Ds = 0.0, D2 = 0.0, steadystate = false, T=1.0) {

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

export function esSingleDose3C(t, dose, d, k1, k2, k3, Ds = 0.0) {

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


export function e2SingleDoseAUC3C(t, dose, d, k1, k2, k3) {
    if (t < 0) {
        return 0;
    }

    if (k1 == k2 && k2 == k3) {

        return dose * d / k1 * (1 - Math.exp(-k1 * t) * (1 + k1 * t + k1 * k1 * t * t / 2));

    } else if (k1 == k2 && k2 != k3) {

        return dose * d * k1 * k1 / (k1 - k3) / (k1 - k3) * ((1 - Math.exp(-k3 * t)) / k3 - 2 / k1 + k3 / k1 / k1 + Math.exp(-k1 * t) * (2 * k1 - k3 + k1 * (k1 - k3) * t) / k1 / k1);

    } else if (k1 != k2 && k1 == k3) {

        // missing because I got distracted

    } else if (k1 != k3 && k2 == k3) {

        // missing

    } else {
        return dose * d * k1 * k2 * ((1 - Math.exp(-k1 * t)) / k1 / (k1 - k2) / (k1 - k3) - (1 - Math.exp(-k2 * t)) / k2 / (k1 - k2) / (k2 - k3) + (1 - Math.exp(-k3 * t)) / k3 / (k1 - k3) / (k2 - k3));
    }
}

export function e2SteadyState3C(t, dose, T, d, k1, k2, k3) {
    return dose * d * k1 * k2 * (Math.exp(-k1 * (t - T * Math.floor(t / T))) / (1 - Math.exp(-k1 * T)) / (k1 - k2) / (k1 - k3) - Math.exp(-k2 * (t - T * Math.floor(t / T))) / (1 - Math.exp(-k2 * T)) / (k1 - k2) / (k2 - k3) + Math.exp(-k3 * (t - T * Math.floor(t / T))) / (1 - Math.exp(-k3 * T)) / (k1 - k3) / (k2 - k3));
}

export function e2ssTrough3C(dose, T, d, k1, k2, k3) {
    return e2SteadyState3C(0, dose, T, d, k1, k2, k3);
}

// Keep k1 and k2 for splatting PKParams
export function e2ssAverage3C(dose, T, d, k1, k2, k3) {
    return dose * d / k3 / T;
}

export function e2MultiDose3C(t, doses = [1.0], times = [0.0], types = ["EV im"], random = false, intervals = false) {

    if (intervals) {
        times = times.map((sum => value => sum += value)(0));
        let initialTime = times[0];
        times = times.map(t => t - initialTime);
    };

    let sum = 0;
    for (let i = 0; i < doses.length; i++) {
        if (!random) {
            sum += PKFunctions[types[i]](t - times[i], doses[i]);
        } else {
            sum += PKRandomFunctions[types[i]](t - times[i], doses[i]);
        }
    }
    return sum;
}

function e2Patch3C(t, dose, d, k1, k2, k3, W, steadystate = false, T = 0.0) {
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

function e2SteadyStatePatch3C(t, dose, T, d, k1, k2, k3, W) {
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
        throw new Error("Invalid input: y should be less than or equal to x");
    }
    else if (x === y) {
        return -Infinity;
    }
    else {
        return x + Math.log(1 - Math.exp(y - x));
    }
}
