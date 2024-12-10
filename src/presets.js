/**
 * Each preset should have the following keys set:
 *
 * * `menstrualCycle` - Show menstrual cycle overlay or not
 * * `intervalDays` - When true, show days as inter:val, or false as absolute
 * * `steady` - array of array for each steady-sta:te dose
 * * `multi` - array of array for each multi-dose:
 */
export const Presets = {

    // To display first when loading the page
    '_default': {
        hidden: true,
        menstrualCycle: false,
        targetRange: true,
        units: 'pg/mL',
        fudgeFactor: 1.0,
        steadystates: {
            entries: [
                {dose: 4, time: 7, model: 'EEn im', curveVisible: true, uncertaintyVisible: true},
                {dose: 4, time: 10, model: 'EC im', curveVisible: false, uncertaintyVisible: true}
                ]
            },
        customdoses: {
            curveVisible: true,
            uncertaintyVisible: false,
            daysAsIntervals: true,
            entries: [
                {dose: 4, time: 0, model: 'EV im'},
                {dose: 4, time: 20, model: 'EEn im'},
                {dose: 100, time: 30, model: 'patch ow'}
                ]
            }
    },
    '_section1': {
        'disabled': true,
        label: 'monotherapies',
    },
    'ester-monotherapies': {
        label: 'Ester monotherapies comparison',
        menstrualCycle: false,
        steadystates: {
            entries: [
                {dose: 3, time: 4, model: 'EV im', curveVisible: true, uncertaintyVisible: false},
                {dose: 4, time: 7, model: 'EEn im', curveVisible: true, uncertaintyVisible: false},
                {dose: 6, time: 10, model: 'EEn im', curveVisible: true, uncertaintyVisible: false},
                {dose: 5, time: 7, model: 'EC im', curveVisible: true, uncertaintyVisible: false},
                {dose: 15, time: 14, model: 'EUn im', curveVisible: true, uncertaintyVisible: false},
                {dose: 40, time: 30, model: 'EUn casubq', curveVisible: true, uncertaintyVisible: false}
                ]
            },
        customdoses: {
            curveVisible: true,
            uncertaintyVisible: true,
            daysAsIntervals: true, 
            entries: []
        }
    },
    'een-monotherapy-7': {
        label: 'EEn monotherapy (7 days)',
        menstrualCycle: false,
        steadystates: {entries: [
                        {dose: 4, time: 7, model: 'EEn im', curveVisible: true, uncertaintyVisible: false}
                    ]},
        customdoses: {
            daysAsIntervals: true,
            curveVisible: true,
            uncertaintyVisible: true,
            entries: [
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'}
            ]}
    },
    'een-monotherapy-10': {
        label: 'EEn monotherapy (10 days)',
        menstrualCycle: false,
        steadystates: {entries: [
            {dose: 6, time: 10, model: 'EEn im', curveVisible: true, uncertaintyVisible: false}
        ]},
        customdoses: {
            curveVisible: true,
            uncertaintyVisible: true,
            daysAsIntervals: true,
            entries: [
                {dose: 6, time: 10, model: 'EEn im'},
                {dose: 6, time: 10, model: 'EEn im'},
                {dose: 6, time: 10, model: 'EEn im'},
                {dose: 6, time: 10, model: 'EEn im'},
                {dose: 6, time: 10, model: 'EEn im'},
                {dose: 6, time: 10, model: 'EEn im'},
            ]}
    },
    'ev-monotherapy-4': {
        label: 'EV monotherapy (4 days)',
        menstrualCycle: false,
        steadystates: {entries:[
                {dose: 3, time: 4, model: 'EV im', curveVisible: true, uncertaintyVisible: false}
            ]},
        customdoses: {
            curveVisible: true,
            uncertaintyVisible: true,
            daysAsIntervals: true,
            entries: [
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
            ]
        }
    },
    'ec-monotherapy-7': {
        label: 'EC monotherapy (7 days)',
        menstrualCycle: false,
        steadystates: {entries: [
            {dose: 5, time: 7, model: 'EC im', curveVisible: true, uncertaintyVisible: false}
        ]},
        customdoses: {
            curveVisible: true,
            uncertaintyVisible: true,
            daysAsIntervals: true,
            entries: [
                {dose: 5, time: 7, model: 'EC im'},
                {dose: 5, time: 7, model: 'EC im'},
                {dose: 5, time: 7, model: 'EC im'},
                {dose: 5, time: 7, model: 'EC im'},
                {dose: 5, time: 7, model: 'EC im'},
                {dose: 5, time: 7, model: 'EC im'},
                {dose: 5, time: 7, model: 'EC im'}
            ]
        }
    },
    'eun-monotherapy-14': {
        label: 'EUn monotherapy (14 days)',
        menstrualCycle: false,
        steadystates: {entries: [
                {dose: 15, time: 14, model: 'EUn im', curveVisible: true, uncertaintyVisible: false}
        ]},
        customdoses: {
            curveVisible: true,
            uncertaintyVisible: true,
            daysAsIntervals: true,
            entries: [
                {dose: 15, time: 14, model: 'EUn im'},
                {dose: 15, time: 14, model: 'EUn im'},
                {dose: 15, time: 14, model: 'EUn im'},
                {dose: 15, time: 14, model: 'EUn im'},
                {dose: 15, time: 14, model: 'EUn im'},
                {dose: 15, time: 14, model: 'EUn im'},
                {dose: 15, time: 14, model: 'EUn im'},
                {dose: 15, time: 14, model: 'EUn im'},
                {dose: 15, time: 14, model: 'EUn im'},
                {dose: 15, time: 14, model: 'EUn im'},
                {dose: 15, time: 14, model: 'EUn im'},
                {dose: 15, time: 14, model: 'EUn im'},
                {dose: 15, time: 14, model: 'EUn im'},
                {dose: 15, time: 14, model: 'EUn im'},
            ]
        }
    },
    'eun-monotherapy-30': {
        label: 'EUn monotherapy (30 days)',
        menstrualCycle: false,
        steadystates: {entries: [
            {dose: 40, time: 30, model: 'EUn casubq', curveVisible: true, uncertaintyVisible: false}
        ]},
        customdoses: {
            curveVisible: true,
            uncertaintyVisible: true,
            daysAsIntervals: true,
            entries: [
                {dose: 40, time: 30, model: 'EUn casubq'},
                {dose: 40, time: 30, model: 'EUn casubq'},
                {dose: 40, time: 30, model: 'EUn casubq'},
                {dose: 40, time: 30, model: 'EUn casubq'},
                {dose: 40, time: 30, model: 'EUn casubq'},
                {dose: 40, time: 30, model: 'EUn casubq'},
                {dose: 40, time: 30, model: 'EUn casubq'},
                {dose: 40, time: 30, model: 'EUn casubq'},
                {dose: 40, time: 30, model: 'EUn casubq'},
                {dose: 40, time: 30, model: 'EUn casubq'},
                {dose: 40, time: 30, model: 'EUn casubq'}
            ]
        }
    },
    'patch-monotherapy': {
        label: 'Patch monotherapies (once/twice weekly)',
        menstrualCycle: false,
        steadystates: {entries: [
            {dose: 400, time: 3.5, model: 'patch tw', curveVisible: true, uncertaintyVisible: true},
            {dose: 300, time: 7, model: 'patch ow', curveVisible: true, uncertaintyVisible: true}
        ]},
        customdoses: {
            curveVisible: true,
            uncertaintyVisible: true,
            daysAsIntervals: true,
            entries: []
        }
    },
    'ev34-to-een47-monotherapy': {
        label: 'EV (4 days) to EEn (7 days)',
        menstrualCycle: false,
        steadystates: {entries: []},
        customdoses: {
            curveVisible: true,
            uncertaintyVisible: true,
            daysAsIntervals: true,
            entries: [
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 4, time: 4, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
            ]
        }
    },
    '_section2': {
        'disabled': true,
        label: 'missed doses',
    },
    'missed-een-dose-7': {
        label: 'Missed EEn dose',
        menstrualCycle: false,
        steadystates: {entries: [
            {dose: 4, time: 7, model: 'EEn im', curveVisible: true, uncertaintyVisible: false}
        ]},
        customdoses: {
            curveVisible: true,
            uncertaintyVisible: true,
            daysAsIntervals: true,
            entries: [
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 14, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
            ]
        }
    },
    'missed-ev-dose-4': {
        label: 'Missed EV dose',
        menstrualCycle: false,
        steadystates: {entries: [
            {dose: 3, time: 4, model: 'EV im', curveVisible: true, uncertaintyVisible: false}
        ]},
        customdoses: {
            curveVisible: true,
            uncertaintyVisible: true,
            daysAsIntervals: true,
            entries: [
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 8, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
            ]
        }
    },
    'correct-missed-een-dose-7': {
        label: 'Correct missed EEn dose',
        menstrualCycle: false,
        steadystates: {entries: [
            {dose: 4, time: 7, model: 'EEn im', curveVisible: true, uncertaintyVisible: false}
        ]},
        customdoses: {
            curveVisible: true,
            uncertaintyVisible: true,
            daysAsIntervals: true,
            entries: [
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 6, time: 14, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
            ]
        }
    },
    'correct-missed-ev-dose-4': {
        label: 'Correct missed EV dose',
        menstrualCycle: false,
        steadystates: {entries: [
            {dose: 3, time: 4, model: 'EV im', curveVisible: true, uncertaintyVisible: false}
        ]},
        customdoses: {
            curveVisible: true,
            uncertaintyVisible: true,
            daysAsIntervals: true,
            entries: [
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 4, time: 8, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'}
            ]
        }
    },
    'preemptcorrect-missed-een-dose-7': {
        label: 'Preempt/correct missed EEn dose',
        menstrualCycle: false,
        steadystates: {entries: [
            {dose: 4, time: 7, model: 'EEn im', curveVisible: true, uncertaintyVisible: false}
        ]},
        customdoses: {
            curveVisible: true,
            uncertaintyVisible: true,
            daysAsIntervals: true,
            entries: [
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 9, time: 7, model: 'EEn im'},
                {dose: 5, time: 14, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'}
            ]
        }
    },
    'preemptcorrect-missed-ev-dose-4': {
        label: 'Preempt/correct missed EV dose',
        menstrualCycle: false,
        steadystates: {entries: [
            {dose: 3, time: 4, model: 'EV im', curveVisible: true, uncertaintyVisible: false}
        ]},
        customdoses: {
            curveVisible: true,
            uncertaintyVisible: true,
            daysAsIntervals: true,
            entries: [
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 6, time: 4, model: 'EV im'},
                {dose: 4, time: 8, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'}
            ]
        }
    },
    '_section3': {
        'disabled': true,
        label: 'monotherapies with loading dose',
    },
    'een-monotherapy-loadingdose': {
        label: 'EEn mono with 8mg loading dose',
        menstrualCycle: false,
        steadystates: {entries: [
            {dose: 4, time: 7, model: 'EEn im', curveVisible: true, uncertaintyVisible: false}
        ]},
        customdoses: {
            curveVisible: true,
            uncertaintyVisible: true,
            daysAsIntervals: true,
            entries: [
                {dose: 8, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'}
        ]}
    },
    'ev-monotherapy-loadingdose': {
        label: 'EV mono with 6mg loading dose',
        menstrualCycle: false,
        steadystates: {entries: [
            {dose: 3, time: 4, model: 'EV im', curveVisible: true, uncertaintyVisible: false}
        ]},
        customdoses: {
            curveVisible: true,
            uncertaintyVisible: true,
            daysAsIntervals: true,
            entries: [
                {dose: 6, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'}
            ]
        }
    },
    'ec-monotherapy-loadingdose': {
        label: 'EC mono with 8mg loading dose',
        menstrualCycle: false,
        steadystates: {entries: [
            {dose: 5, time: 7, model: 'EC im', curveVisible: true, uncertaintyVisible: false}
        ]},
        customdoses: {
            curveVisible: true,
            uncertaintyVisible: true,
            daysAsIntervals: true,
            entries: [
                {dose: 10, time: 7, model: 'EC im'},
                {dose: 5, time: 7, model: 'EC im'},
                {dose: 5, time: 7, model: 'EC im'},
                {dose: 5, time: 7, model: 'EC im'},
                {dose: 5, time: 7, model: 'EC im'},
                {dose: 5, time: 7, model: 'EC im'},
            ]
        }
    },
    'eun-monotherapy-loadingdose': {
        label: 'EUn mono with 100mg loading dose',
        menstrualCycle: false,
        steadystates: {entries: [
            {dose: 40, time: 30, model: 'EUn casubq', curveVisible: true, uncertaintyVisible: false}
        ]},
        customdoses: {
            curveVisible: true,
            uncertaintyVisible: true,
            daysAsIntervals: true,
            entries: [
                {dose: 100, time: 30, model: 'EUn casubq'},
                {dose: 40, time: 30, model: 'EUn casubq'},
                {dose: 40, time: 30, model: 'EUn casubq'},
                {dose: 40, time: 30, model: 'EUn casubq'},
                {dose: 40, time: 30, model: 'EUn casubq'},
                {dose: 40, time: 30, model: 'EUn casubq'},
                {dose: 40, time: 30, model: 'EUn casubq'},
                {dose: 40, time: 30, model: 'EUn casubq'},
                {dose: 40, time: 30, model: 'EUn casubq'},
                {dose: 40, time: 30, model: 'EUn casubq'}
            ]
        }
    },
    'ev-to-een-loadingdose': {
        label: 'EV to EEn with 7 mg loading dose',
        menstrualCycle: false,
        steadystates: {entries: []},
        customdoses: {
            curveVisible: true,
            uncertaintyVisible: true,
            daysAsIntervals: true,
            entries: [
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 3, time: 4, model: 'EV im'},
                {dose: 7, time: 4, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
                {dose: 4, time: 7, model: 'EEn im'},
            ]
        }
    },
    '_section4': {
        'disabled': true,
        label: 'inappropriate WPATH regimens (see text)',
    },
    'wpath-toolittle-toospaced': {
        label: 'EV/EC 5mg/14days (too variable)',
        menstrualCycle: false,
        steadystates: {entries: [
            {dose: 5, time: 14, model: 'EV im', curveVisible: true, uncertaintyVisible: true},
            {dose: 5, time: 14, model: 'EC im', curveVisible: true, uncertaintyVisible: true}
        ]},
        customdoses: {
            curveVisible: true,
            uncertaintyVisible: true,
            daysAsIntervals: true,
            entries: []
        }
    },
    'wpath-toomuch-toospaced': {
        label: 'EV/EC 30mg/14days (extreme)',
        menstrualCycle: false,
        steadystates: {entries: [
            {dose: 30, time: 14, model: 'EV im', curveVisible: true, uncertaintyVisible: true},
            {dose: 30, time: 14, model: 'EC im', curveVisible: true, uncertaintyVisible: true}
        ]},
        customdoses: {
            curveVisible: true,
            uncertaintyVisible: true,
            daysAsIntervals: true,
            entries: []
        }
    },
    'wpath-toolittle': {
        label: 'EV/EC 2mg/7days (low & needs AA)',
        menstrualCycle: false,
        steadystates: {entries: [
            {dose: 2, time: 7, model: 'EV im', curveVisible: true, uncertaintyVisible: true},
            {dose: 2, time: 7, model: 'EC im', curveVisible: true, uncertaintyVisible: true}
        ]},
        customdoses: {
            curveVisible: true,
            uncertaintyVisible: true,
            daysAsIntervals: true,
            entries: []
        }
    },
    'wpath-toomuch': {
        label: 'EV/EC 10mg/7days (too much)',
        menstrualCycle: false,
        steadystates: {entries: [
            {dose: 10, time: 7, model: 'EV im', curveVisible: true, uncertaintyVisible: true},
            {dose: 10, time: 7, model: 'EC im', curveVisible: true, uncertaintyVisible: true}
        ]},
        customdoses: {
            curveVisible: true,
            uncertaintyVisible: true,
            daysAsIntervals: true,
            entries: []
        }
    },
    '_section5': {
        'disabled': true,
        label: 'inappropriate regimens',
    },
    'mimic-menstrual-cycle': {
        label: 'Mimic menstrual cycle',
        menstrualCycle: true,
        steadystates: {entries: []},
        customdoses: {
            curveVisible: true,
            uncertaintyVisible: true,
            daysAsIntervals: false,
            entries: [
                {dose: 1, time: 13.5, model: 'EB im'},
                {dose: 4, time: 16, model: 'EEn im'},
                {dose: 1, time: 41.5, model: 'EB im'},
                {dose: 4, time: 44, model: 'EEn im'},
                {dose: 1, time: 69.5, model: 'EB im'},
                {dose: 4, time: 72, model: 'EEn im'},
            ]
        }
    },
    '_peak-performance': {
        hidden: true,
        label: 'Peak performance',
        menstrualCycle: true,
        steadystates: {entries: []},
        customdoses: {
            curveVisible: true,
            uncertaintyVisible: true,
            daysAsIntervals: false,
            entries: [
                {dose: 0.145, time: 0.0, model: 'EB im'},
                {dose: 0.022, time: 0.667, model: 'EB im'},
                {dose: 0.021, time: 0.333, model: 'EB im'},
                {dose: 0.019, time: 0.333, model: 'EB im'},
                {dose: 0.018, time: 0.333, model: 'EB im'},
                {dose: 0.016, time: 0.333, model: 'EB im'},
                {dose: 0.019, time: 0.333, model: 'EB im'},
                {dose: 0.018, time: 0.333, model: 'EB im'},
                {dose: 0.017, time: 0.333, model: 'EB im'},
                {dose: 0.023, time: 0.333, model: 'EB im'},
                {dose: 0.017, time: 0.333, model: 'EB im'},
                {dose: 0.026, time: 0.333, model: 'EB im'},
                {dose: 0.023, time: 0.333, model: 'EB im'},
                {dose: 0.026, time: 0.333, model: 'EB im'},
                {dose: 0.025, time: 0.333, model: 'EB im'},
                {dose: 0.026, time: 0.333, model: 'EB im'},
                {dose: 0.022, time: 0.333, model: 'EB im'},
                {dose: 0.025, time: 0.333, model: 'EB im'},
                {dose: 0.025, time: 0.333, model: 'EB im'},
                {dose: 0.028, time: 0.333, model: 'EB im'},
                {dose: 0.032, time: 0.333, model: 'EB im'},
                {dose: 0.037, time: 0.333, model: 'EB im'},
                {dose: 0.036, time: 0.333, model: 'EB im'},
                {dose: 0.034, time: 0.333, model: 'EB im'},
                {dose: 0.037, time: 0.333, model: 'EB im'},
                {dose: 0.035, time: 0.333, model: 'EB im'},
                {dose: 0.039, time: 0.333, model: 'EB im'},
                {dose: 0.047, time: 0.333, model: 'EB im'},
                {dose: 0.053, time: 0.333, model: 'EB im'},
                {dose: 0.062, time: 0.333, model: 'EB im'},
                {dose: 0.069, time: 0.333, model: 'EB im'},
                {dose: 0.082, time: 0.333, model: 'EB im'},
                {dose: 0.082, time: 0.333, model: 'EB im'},
                {dose: 0.101, time: 0.333, model: 'EB im'},
                {dose: 0.092, time: 0.333, model: 'EB im'},
                {dose: 0.108, time: 0.333, model: 'EB im'},
                {dose: 0.101, time: 0.333, model: 'EB im'},
                {dose: 0.165, time: 0.333, model: 'EB im'},
                {dose: 0.18, time: 0.333, model: 'EB im'},
                {dose: 0.215, time: 0.333, model: 'EB im'},
                {dose: 0.176, time: 0.333, model: 'EB im'},
                {dose: 0.123, time: 0.333, model: 'EB im'},
                {dose: 0.034, time: 0.333, model: 'EB im'},
                {dose: 0.014, time: 2.0, model: 'EB im'},
                {dose: 0.053, time: 0.333, model: 'EB im'},
                {dose: 0.046, time: 0.333, model: 'EB im'},
                {dose: 0.063, time: 0.333, model: 'EB im'},
                {dose: 0.061, time: 0.333, model: 'EB im'},
                {dose: 0.074, time: 0.333, model: 'EB im'},
                {dose: 0.071, time: 0.333, model: 'EB im'},
                {dose: 0.079, time: 0.333, model: 'EB im'},
                {dose: 0.075, time: 0.333, model: 'EB im'},
                {dose: 0.077, time: 0.333, model: 'EB im'},
                {dose: 0.07, time: 0.333, model: 'EB im'},
                {dose: 0.079, time: 0.333, model: 'EB im'},
                {dose: 0.073, time: 0.333, model: 'EB im'},
                {dose: 0.083, time: 0.333, model: 'EB im'},
                {dose: 0.095, time: 0.333, model: 'EB im'},
                {dose: 0.1, time: 0.333, model: 'EB im'},
                {dose: 0.089, time: 0.333, model: 'EB im'},
                {dose: 0.074, time: 0.333, model: 'EB im'},
                {dose: 0.053, time: 0.333, model: 'EB im'},
                {dose: 0.064, time: 0.333, model: 'EB im'},
                {dose: 0.064, time: 0.333, model: 'EB im'},
                {dose: 0.08, time: 0.333, model: 'EB im'},
                {dose: 0.082, time: 0.333, model: 'EB im'},
                {dose: 0.087, time: 0.333, model: 'EB im'},
                {dose: 0.078, time: 0.333, model: 'EB im'},
                {dose: 0.061, time: 0.333, model: 'EB im'},
                {dose: 0.034, time: 0.333, model: 'EB im'},
                {dose: 0.016, time: 0.333, model: 'EB im'},
                {dose: 0.023, time: 0.333, model: 'EB im'},
                {dose: 0.034, time: 0.333, model: 'EB im'},
                {dose: 0.053, time: 0.333, model: 'EB im'},
                {dose: 0.045, time: 0.333, model: 'EB im'},
                {dose: 0.016, time: 0.333, model: 'EB im'},
            ]
        }
    }
};
