// function lngamma(x) { return ieee754gamma.lngamma(x) }

const methodList = ["EV IM", "EEn IM", "EC IM", "EUn IM", "EB IM", "DOT patch tw", "DOT patch ow"];

const PKFunctions = {
    "EV im": function (t, dose) { return e2SingleDose3C(t, dose, ...PK3CParams["EV im"]) },
    "EEn im mk1": function (t, dose) { return e2SingleDose3C(t, dose, ...PK3CParams["EEn im mk1"]) },
    "EEn im mk2": function (t, dose) { return e2SingleDose3C(t, dose, ...PK3CParams["EEn im mk2"]) },
    "EC im": function (t, dose) { return e2SingleDose3C(t, dose, ...PK3CParams["EC im"]) }, 
    "EUn im": function (t, dose) { return e2SingleDose3C(t, dose, ...PK3CParams["EUn im"]) },
    "EB im": function (t, dose) { return e2SingleDose3C(t, dose, ...PK3CParams["EB im"]) },
    "DOT patch tw": function (t, dose) { return e2Patch3CTwiceWeekly(t, dose, ...PK3CParams["DOT patch tw"]) },
    "DOT patch ow": function (t, dose) { return e2Patch3COnceWeekly(t, dose, ...PK3CParams["DOT patch ow"]) }
}

const PKRandomFunctions = {
    "EV im": function(t, dose) { return e2SingleDose3C(t, dose, ...randomMCMCSample("EV im")) },
    "EEn im mk1": function(t, dose) { return e2SingleDose3C(t, dose, ...randomMCMCSample("EEn im mk1")) },
    "EEn im mk2": function(t, dose) { return e2SingleDose3C(t, dose, ...randomMCMCSample("EEn im mk2")) },
    "EC im": function(t, dose) { return e2SingleDose3C(t, dose, ...randomMCMCSample("EC im")) },
    "EUn im": function(t, dose) { return e2SingleDose3C(t, dose, ...randomMCMCSample("EUn im")) },
    "EB im": function(t, dose) { return e2SingleDose3C(t, dose, ...randomMCMCSample("EB im")) },
    "DOT patch tw": function(t, dose) { return e2Patch3CTwiceWeekly(t, dose, ...randomMCMCSample("DOT patch tw")) },
    "DOT patch ow": function(t, dose) { return e2Patch3COnceWeekly(t, dose, ...randomMCMCSample("DOT patch ow")) }
}

function randomMCMCSample(type) {
    let randidx = Math.floor(Math.random() * mcmcSamplesPK3C[type].length)
    return mcmcSamplesPK3C[type][randidx]
}

function PK3CD3Symmetry(d, k1, k2, k3, op = 0) {
    if (op == 0) {
        return [d, k1, k2, k3]
    } else if (op == 1) {
        return [d, k2, k1, k3]
    } else if (op == 2) {
        return [d * k1 / k3, k3, k2, k1]
    } else if (op == 3) {
        return [d * k1 / k3, k2, k3, k1]
    } else if (op == 4) {
        return [d * k2 / k3, k3, k1, k2]
    } else if (op == 5) {
        return [d * k2 / k3, k1, k3, k2]
    }
}

// parameters ds and d2 are optional initial conditions in
// the second and third compartments Es(0) = Ds and E2(0) = D2
function e2SingleDose3C(t, dose, d, k1, k2, k3, Ds = 0.0, D2 = 0.0) {
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

    return ret;
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

        // return dose * d * k1 * k1 / (k1 - k3) / (k1 - k3) * ((1 - Math.exp(-k3 * t))/ k3 - 2 / k1 + k3 / k1 / k1 + Math.exp(-k1 * t) * (2 * k1 - k3 + k1 * (k1 - k3) * t) / k1 / k1)

    } else if (k1 != k3 && k2 == k3) {

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

// function e2MultiDose3C(t, d, k1, k2, k3, doses = [1.0], times = [0.0]) {
//     let sum = 0;
//     for (let i = 0; i < doses.length; i++) {
//         sum += doses[i] * e2SingleDose3C(t - times[i], d, k1, k2, k3);
//     }
//     return sum;
// }

function e2MultiDose3C(t, doses = [1.0], times = [0.0], types = ["EV im"], random = false) {
    let sum = 0;
    for (let i = 0; i < doses.length; i++) {
        if (!random) {
            sum += PKFunctions[types[i]](t - times[i], doses[i]);
            // sum += e2SingleDose3C(t - times[i], doses[i], ...PK3CParams[esters[i]]);
        } else {
            // let randidx = Math.floor(Math.random() * mcmcSamplesPK3C[esters[i]].length);
            // sum += e2SingleDose3C(t - times[i], doses[i], ...mcmcSamplesPK3C[esters[i]][randidx]);
            sum += PKRandomFunctions[types[i]](t - times[i], doses[i]);
        }
    }
    return sum;
}

function e2RepeatedDose3C(t, dose, T, K, d, k1, k2, k3) {
    let sum = 0;
    for (let i = 0; i < K; i++) {
        sum += e2SingleDose3C(t - T * i, dose, d, k1, k2, k3);
    }
    return sum;
}

function e2Patch3C(t, dose, d, k1, k2, k3, W) {
    if (t < 0.0) {
        return 0.0;
    } else if ((0 <= t) && (t <= W)) {
        return e2SingleDose3C(t, dose, d, k1, k2, k3);
    } else if (t > W) {
        let esW = esSingleDose3C(W, dose, d, k1, k2, k3);
        let e2W = e2SingleDose3C(W, dose, d, k1, k2, k3);
        return e2SingleDose3C(t - W, 0.0, 0.0, k1, k2, k3, esW, e2W);
    }
}

function e2Patch3CTwiceWeekly(t, dose, d, k1, k2, k3) {
    return e2Patch3C(t, dose, d, k1, k2, k3, 3.5);
}

function e2Patch3COnceWeekly(t, dose, d, k1, k2, k3) {
    return e2Patch3C(t, dose, d, k1, k2, k3, 7.0);
}