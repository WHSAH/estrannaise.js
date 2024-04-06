import Pbf from 'pbf';
import { RouteType, EstrannaiseState } from './parameters.gen';

const doseNameMap = {
    'EB im': RouteType.BENZOATE,
    'EV im': RouteType.VALERATE,
    'EC im': RouteType.CYPIONATE,
    'EEn im': RouteType.ENANTHATE,
    'EUn im': RouteType.UNDECYLATE,
    'EUn casubq': RouteType.UNDECYLATE_CASUBQ,
    'patch ow': RouteType.PATCH_OW,
    'patch tw': RouteType.PATCH_TW,
};

const reverseDoseNameMap = Object.keys(doseNameMap).reduce(
    (reverseDoseNameMap, key) => ({
        ...reverseDoseNameMap,
        [doseNameMap[key]]: key,
    }), {});

function dosesToDTO(doseTable) {
    const groupedDoses = {};
    for (let i = 0; i < doseTable[0].length; ++i) {
        const time = doseTable[0][i];

        // Ignore empty rows
        if (!time) {
            continue;
        }

        const dose = doseTable[1][i];
        const ester = doseTable[2][i];
        const cvisibility = !!doseTable[3]?.[i];
        const uvisibility = !!doseTable[4]?.[i];

        const dosesThisEster = groupedDoses[ester] ??= [];
        dosesThisEster.push({
            time,
            dose,
            cvisibility,
            uvisibility
        });
    }

    return Object.keys(groupedDoses).map((ester) => ({
        type: doseNameMap[ester].value,
        values: groupedDoses[ester],
    }));
}

export function convertToProtoString({ multiDoseTable, steadyStateTable }) {
    const multi_doses = dosesToDTO(multiDoseTable);
    const steady_state = dosesToDTO(steadyStateTable);

    const estrannaiseState = { multi_doses, steady_state };
    console.log({ estrannaiseState });
    const pbf = new Pbf();
    EstrannaiseState.write(estrannaiseState, pbf);
    const dec = new TextDecoder('utf-8');

    return btoa(String.fromCharCode(...pbf.buf));
}

function dosesFromDTO(doses) {
    return doses.reduce((doseArrays, { type, values }) => {
        const [
            times,
            doses,
            esters,
            cvisibilities,
            uvisibilities,
        ] = doseArrays;

        const ester = reverseDoseNameMap[type];
        for (const { dose, time, cvisibility, uvisibility } of values) {
            times.push(time);
            doses.push(dose);
            esters.push(ester);
            cvisibilities.push(!!cvisibility);
            uvisibilities.push(!!uvisibility);
        }

        return doseArrays;
    },
        [
            /* times: */ [],
            /* doses: */ [],
            /* esters: */ [],
            /* cvisibilities: */ [],
            /* uvisibilities: */ []
        ]);
}

export function convertFromProtoString(protoBase64) {
    // get an ArrayBuffer for the payload
    const protoString = atob(protoBase64);
    const buf = Uint8Array.from(protoString, c => c.charCodeAt(0));

    // read that ArrayBuffer as a proto
    const pbf = new Pbf(buf);
    const state = EstrannaiseState.read(pbf);

    return {
        multiDoseTable: dosesFromDTO(state.multi_doses),
        steadyStateTable: dosesFromDTO(state.steady_state),
    };
}
