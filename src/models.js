function lngamma(x) { return ieee754gamma.lngamma(x) }

const esterList = ["EV IM", "EEn IM", "EC IM", "EUn IM", "EB IM"];


function PK3CD3Symmetry(d, k1, k2, k3, op = 0) {
    if ( op == 0 ) {
        return [d, k1, k2, k3]
    } else if ( op == 1 ) {
        return [d, k2, k1, k3]
    } else if ( op == 2 ) {
        return [d*k1/k3, k3, k2, k1]
    } else if ( op == 3 ) {
        return [d*k1/k3, k2, k3, k1]
    } else if ( op == 4 ) {
        return [d*k2/k3, k3, k1, k2]
    } else if ( op == 5 ) {
        return [d*k2/k3, k1, k3, k2]
    }
}

function e2SingleDose3C(t, dose, d, k1, k2, k3) {
    return t < 0 ? 0 : dose * d * k1 * k2 * (Math.exp(-k1 * t) / (k1 - k2) / (k1 - k3) - Math.exp(-k2 * t) / (k1 - k2) / (k2 - k3) + Math.exp(-k3 * t) / (k1 - k3) / (k2 - k3));
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

function e2MultiDose3C(t, d, k1, k2, k3, doses = [1.0], times = [0.0]) {
    let sum = 0;
    for (let i = 0; i < doses.length; i++) {
        sum += doses[i] * e2SingleDose3C(t - times[i], d, k1, k2, k3);
    }
    return sum;
}

function e2MultiDoseEster3C(t, doses = [1.0], times = [0.0], esters = ["IMEV"], random=false) {
    let sum = 0;
    for (let i = 0; i < doses.length; i++) {
        if (!random) {
            sum += e2SingleDose3C(t - times[i], doses[i], ...PK3CParams[esters[i]]);
        } else {
            let randidx = Math.floor(Math.random() * mcmcSamplesPK3C[esters[i]].length);
            sum += e2SingleDose3C(t - times[i], doses[i], ...mcmcSamplesPK3C[esters[i]][randidx]);
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


