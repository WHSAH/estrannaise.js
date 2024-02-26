// function lngamma(x) { return ieee754gamma.lngamma(x) }

const methodList = ["EV im", "EEn im", "EC im", "EUn im", "EB im", "DOT patch tw", "DOT patch ow"];

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

const PKFunctions = {
    "EV im": function (t, dose, steadystate=false, T=0.0) { return e2Curve3C(t, conversionFactor * dose, ...PKParams["EV im"], 0.0, 0.0, steadystate, T) },
    "EEn im": function (t, dose, steadystate=false, T=0.0) { return e2Curve3C(t, conversionFactor * dose, ...PKParams["EEn im"], 0.0, 0.0, steadystate, T) },
    "EC im": function (t, dose, steadystate=false, T=0.0) { return e2Curve3C(t, conversionFactor * dose, ...PKParams["EC im"], 0.0, 0.0, steadystate, T) },
    "EUn im": function (t, dose, steadystate=false, T=0.0) { return e2Curve3C(t, conversionFactor * dose, ...PKParams["EUn im"], 0.0, 0.0, steadystate, T) },
    "EUn csq": function (t, dose, steadystate=false, T=0.0) { return e2Curve3C(t, conversionFactor * dose, ...PKParams["EUn csq"], 0.0, 0.0, steadystate, T) },
    "EB im": function (t, dose, steadystate=false, T=0.0) { return e2Curve3C(t, conversionFactor * dose, ...PKParams["EB im"], 0.0, 0.0, steadystate, T) },
    "DOT patch tw": function (t, dose, steadystate=false, T=0.0) { return e2Patch3C(t, conversionFactor * dose, ...PKParams["DOT patch tw"], 3.5, steadystate, T) },
    "DOT patch ow": function (t, dose, steadystate=false, T=0.0) { return e2Patch3C(t, conversionFactor * dose, ...PKParams["DOT patch ow"], 7.0, steadystate, T) }
}

const PKRandomFunctions = {
    "EV im": function(t, dose, steadystate=false, T=0.0, idx=null) { return e2Curve3C(t, conversionFactor * dose, ...randomMCMCSample("EV im", idx), 0.0, 0.0, steadystate, T) },
    "EEn im": function(t, dose, steadystate=false, T=0.0, idx=null) { return e2Curve3C(t, conversionFactor * dose, ...randomMCMCSample("EEn im", idx), 0.0, 0.0, steadystate, T) },
    "EC im": function(t, dose, steadystate=false, T=0.0, idx=null) { return e2Curve3C(t, conversionFactor * dose, ...randomMCMCSample("EC im", idx), 0.0, 0.0, steadystate, T) },
    "EUn im": function(t, dose, steadystate=false, T=0.0, idx=null) { return e2Curve3C(t, conversionFactor * dose, ...randomMCMCSample("EUn im", idx), 0.0, 0.0, steadystate, T) },
    "EUn csq": function(t, dose, steadystate=false, T=0.0, idx=null) { return e2Curve3C(t, conversionFactor * dose, ...randomMCMCSample("EUn csq", idx), 0.0, 0.0, steadystate, T) },
    "EB im": function(t, dose, steadystate=false, T=0.0, idx=null) { return e2Curve3C(t, conversionFactor * dose, ...randomMCMCSample("EB im", idx), 0.0, 0.0, steadystate, T) },
    "DOT patch tw": function(t, dose, steadystate=false, T=0.0, idx=null) { return e2Patch3C(t, conversionFactor * dose, ...randomMCMCSample("DOT patch tw", idx), 3.5, steadystate, T) },
    "DOT patch ow": function(t, dose, steadystate=false, T=0.0, idx=null) { return e2Patch3C(t, conversionFactor * dose, ...randomMCMCSample("DOT patch ow", idx), 7.0, steadystate, T) }
}


function calculateUncertainty(t, dose, type, steadystate=false, T=0.0) {
    let idx = Array.from({length: mcmcSamplesPK[type].length}, (_, i) => i);
    let values = idx.map(i => PKRandomFunctions[type](t, dose, steadystate, T, i));
    
    let std = math.std(values)
    let q025 = math.quantileSeq(values, 0.025);
    let q975 = math.quantileSeq(values, 0.975);
    return [std, q025, q975];
}


function randomMCMCSample(type, idx=null) {
    if (idx === null) {
        idx = Math.floor(Math.random() * mcmcSamplesPK[type].length)
    }
    return mcmcSamplesPK[type][idx]
}

function PKD3Symmetries(d, k1, k2, k3) {
    return [
        [d, k1, k2, k3],
        [d, k2, k1, k3],
        [d * k1 / k3, k3, k2, k1],
        [d * k1 / k3, k2, k3, k1],
        [d * k2 / k3, k3, k1, k2],
        [d * k2 / k3, k1, k3, k2]
    ];
}

// parameters ds and d2 are optional initial conditions
// Es(0) = ds and E2(0) = d2 for the second and third compartments 
function e2Curve3C(t, dose, d, k1, k2, k3, Ds = 0.0, D2 = 0.0, steadystate = false, T=1.0) {

    if (!steadystate) {
        if (t < 0) {
            return 0;
        }

        let ret = 0;

        if (D2 > 0) {
            ret += D2 * Math.exp(-k3 * t)
        }

        if (Ds > 0) {
            if (k2 == k3) {
                ret += Ds * k2 * t * Math.exp(-k2 * t)
            } else {
                ret += Ds * k2 / (k2 - k3) * (Math.exp(-k3 * t) - Math.exp(-k2 * t))    
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

                // let l1 = -k1 * t - Math.log(Math.abs(k1 - k2)) - Math.log(Math.abs(k1 - k3));
                // let s1 = Math.sign(k1 - k2) * Math.sign(k1 - k3);

                // let l2 = -k2 * t - Math.log(Math.abs(k1 - k2)) - Math.log(Math.abs(k2 - k3));
                // let s2 = -Math.sign(k1 - k2) * Math.sign(k2 - k3);

                // let l3 = -k3 * t - Math.log(Math.abs(k1 - k3)) - Math.log(Math.abs(k2 - k3));
                // let s3 = Math.sign(k1 - k3) * Math.sign(k2 - k3);

                // // ret += dose * d * k1 * k2 * Math.exp(logsumsignedexp([l1, l2, l3], [s1, s2, s3]));
                // ret += Math.exp(Math.log(dose) + Math.log(d) + Math.log(k1) + Math.log(k2) + logsumsignedexp([l1, l2, l3], [s1, s2, s3]));

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

function esSingleDose3C(t, dose, d, k1, k2, k3, Ds = 0.0) {

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


function e2SingleDoseAUC3C(t, dose, d, k1, k2, k3) {
    if (t < 0) {
        return 0;
    }

    if (k1 == k2 && k2 == k3) {

        return dose * d / k1 * (1 - Math.exp(-k1 * t) * (1 + k1 * t + k1 * k1 * t * t / 2))

    } else if (k1 == k2 && k2 != k3) {

        return dose * d * k1 * k1 / (k1 - k3) / (k1 - k3) * ((1 - Math.exp(-k3 * t)) / k3 - 2 / k1 + k3 / k1 / k1 + Math.exp(-k1 * t) * (2 * k1 - k3 + k1 * (k1 - k3) * t) / k1 / k1)

    } else if (k1 != k2 && k1 == k3) {

        // missing because I got distracted

    } else if (k1 != k3 && k2 == k3) {

        // missing

    } else {
        return dose * d * k1 * k2 * ((1 - Math.exp(-k1 * t)) / k1 / (k1 - k2) / (k1 - k3) - (1 - Math.exp(-k2 * t)) / k2 / (k1 - k2) / (k2 - k3) + (1 - Math.exp(-k3 * t)) / k3 / (k1 - k3) / (k2 - k3));
    }
}

function e2SteadyState3C(t, dose, T, d, k1, k2, k3) {
    return dose * d * k1 * k2 * (Math.exp(-k1 * (t - T * Math.floor(t / T))) / (1 - Math.exp(-k1 * T)) / (k1 - k2) / (k1 - k3) - Math.exp(-k2 * (t - T * Math.floor(t / T))) / (1 - Math.exp(-k2 * T)) / (k1 - k2) / (k2 - k3) + Math.exp(-k3 * (t - T * Math.floor(t / T))) / (1 - Math.exp(-k3 * T)) / (k1 - k3) / (k2 - k3));
}

function e2ssTrough3C(dose, T, d, k1, k2, k3) {
    return e2SteadyState3C(0, dose, T, d, k1, k2, k3)
}

// Keep k1 and k2 for splatting PKParams
function e2ssAverage3C(dose, T, d, k1, k2, k3) {
    return dose * d / k3 / T
}


function e2MultiDose3C(t, doses = [1.0], times = [0.0], types = ["EV im"], random = false, intervals = false) {
    // let exponents = [];
    // for (let i = 0; i < doses.length; i++) {
    //     if (!random) {
    //         exponents.push(Math.log(PKFunctions[types[i]](t - times[i], doses[i])));
    //     } else {
    //         exponents.push(Math.log(PKRandomFunctions[types[i]](t - times[i], doses[i])));
    //     }
    // }
    // // console.log(t, exponents)
    // let ret = Math.exp(_logsumexp(exponents));
    // if (isNaN(ret)) {
    //     return 0.0;
    // } else {
    //     return ret;
    // }

    if (intervals) {
        times = times.map((sum => value => sum += value)(0));
        let initialTime = times[0]
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

function e2RepeatedDose3C(t, dose, T, K, d, k1, k2, k3) {
    let sum = 0;
    for (let i = 0; i < K; i++) {
        sum += e2Curve3C(t - T * i, dose, d, k1, k2, k3);
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
    )

    ret += esW * k2 / (k2 - k3) * (Math.exp(-k3 * (t - W - T * Math.floor((t - W)/T))) / (1 - Math.exp(-k3 * T)) - Math.exp(-k2 * (t - W - T * Math.floor((t - W)/T))) / (1 - Math.exp(-k2 * T)));

    ret += e2W * Math.exp(-k3 * (t - W - T * Math.floor((t - W)/T))) / (1 - Math.exp(-k3 * T));

    return ret;
}


function e2iv3C(t, dose, d, k21, k2e, k12, k1s, k1e, ks1, kse) {
    let A = iv3Cmatrix(k21, k2e, k12, k1s, k1e, ks1, kse);
    if (typeof t === "number") {
        return dose * d * evolve(A, [1.0, 0, 0], [t])[1][0];
    } else if (t.length > 0) {
        if (!isArraySorted(t)) {
            console.error("t must be sorted");
            return;
        }
        return math.multiply(dose * d, evolve(A, [1.0, 0, 0], math.diff(t)).map(x => x[0]));
    }
}

function iv3Cmatrix(k21, k2e, k12, k1s, k1e, ks1, kse) {
    return [[-(k21 + k2e),                 k12,             0], 
            [         k21,  -(k12 + k1s + k1e),           ks1], 
            [           0,                 k1s,  -(ks1 + kse)]];
}

function slpo4Cmatrix(kp2, k21, k2e, k12, k1s, k1e, ks1, kse) {
    return [[-kp2,             0,                   0,             0]
            [ kp2,  -(k21 + k2e),                   0,             0], 
            [   0,           k21,  -(k12 + k1s + k1e),           ks1], 
            [   0,             0,                 k1s,  -(ks1 + kse)]];
}

function evolve(A, initial, dts) {
    let sol = [initial];
    for (let i = 0; i < dts.length; i++) {
        sol.push(math.multiply(math.expm(math.multiply(dts[i], A)), sol[i])._data);
    }
    return sol
}

function _logsumexp(arr) {
    let max = Math.max(...arr);
    return max + Math.log(arr.reduce((acc, x) => acc + Math.exp(x - max), 0));
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

function logsumsignedexp(exponents, signs) {
    let positive = [];
    let negative = [];

    for (let i = 0; i < exponents.length; i++) {
        if (signs[i] >= 0) {
            positive.push(exponents[i]);
        } else {
            negative.push(exponents[i]);
        }
    }

    let logsumexpPositive = positive.length ? _logsumexp(positive) : -Infinity;
    let logsumexpNegative = negative.length ? _logsumexp(negative) : -Infinity;

    return _logsubexp(logsumexpPositive, logsumexpNegative);
}