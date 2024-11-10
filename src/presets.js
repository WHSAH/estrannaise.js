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
        'hidden': true,
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [4, 7, 'EEn im'],
            [4, 10, 'EC im', false, true]
        ],
        'customdosesCurveVisible': true,
        'customdosesUncertaintyVisible': false,
        'multi': [
            [4, 0, 'EV im'],
            [4, 20, 'EEn im'],
            [100, 30, 'patch ow']
        ]
    },
    '_section1': {
        'disabled': true,
        'label': 'monotherapies',
    },
    'ester-monotherapies': {
        'label': 'Ester monotherapies comparison',
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [3, 4, 'EV im', true, false],
            [4, 7, 'EEn im', true, false],
            [6, 10, 'EEn im', true, false],
            [5, 7, 'EC im', true, false],
            [15, 14, 'EUn im', true, false],
            [40, 30, 'EUn casubq', true, false]
        ],
        'multi': []
    },
    'een-monotherapy-7': {
        'label': 'EEn monotherapy (7 days)',
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [4, 7, 'EEn im', true, false]
        ],
        'customdosesCurveVisible': true,
        'customdosesUncertaintyVisible': true,
        'multi': [
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im']
        ]
    },
    'een-monotherapy-10': {
        'label': 'EEn monotherapy (10 days)',
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [6, 10, 'EEn im', true, false]
        ],
        'customdosesCurveVisible': true,
        'customdosesUncertaintyVisible': true,
        'multi': [
            [6, 10, 'EEn im'],
            [6, 10, 'EEn im'],
            [6, 10, 'EEn im'],
            [6, 10, 'EEn im'],
            [6, 10, 'EEn im'],
            [6, 10, 'EEn im'],
        ]
    },
    'ev-monotherapy-4': {
        'label': 'EV monotherapy (4 days)',
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [3, 4, 'EV im', true, false]
        ],
        'customdosesCurveVisible': true,
        'customdosesUncertaintyVisible': true,
        'multi': [
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
        ]
    },
    'ec-monotherapy-7': {
        'label': 'EC monotherapy (7 days)',
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [5, 7, 'EC im', true, false]
        ],
        'customdosesCurveVisible': true,
        'customdosesUncertaintyVisible': true,
        'multi': [
            [5, 7, 'EC im'],
            [5, 7, 'EC im'],
            [5, 7, 'EC im'],
            [5, 7, 'EC im'],
            [5, 7, 'EC im'],
            [5, 7, 'EC im'],
            [5, 7, 'EC im']
        ]
    },
    'eun-monotherapy-14': {
        'label': 'EUn monotherapy (14 days)',
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [15, 14, 'EUn im', true, false]
        ],
        'customdosesCurveVisible': true,
        'customdosesUncertaintyVisible': true,
        'multi': [
            [15, 14, 'EUn im'],
            [15, 14, 'EUn im'],
            [15, 14, 'EUn im'],
            [15, 14, 'EUn im'],
            [15, 14, 'EUn im'],
            [15, 14, 'EUn im'],
            [15, 14, 'EUn im'],
            [15, 14, 'EUn im'],
            [15, 14, 'EUn im'],
            [15, 14, 'EUn im'],
            [15, 14, 'EUn im'],
            [15, 14, 'EUn im'],
            [15, 14, 'EUn im'],
            [15, 14, 'EUn im'],
        ]
    },
    'eun-monotherapy-30': {
        'label': 'EUn monotherapy (30 days)',
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [40, 30, 'EUn casubq', true, false]
        ],
        'customdosesCurveVisible': true,
        'customdosesUncertaintyVisible': true,
        'multi': [
            [40, 30, 'EUn casubq'],
            [40, 30, 'EUn casubq'],
            [40, 30, 'EUn casubq'],
            [40, 30, 'EUn casubq'],
            [40, 30, 'EUn casubq'],
            [40, 30, 'EUn casubq'],
            [40, 30, 'EUn casubq'],
            [40, 30, 'EUn casubq'],
            [40, 30, 'EUn casubq'],
            [40, 30, 'EUn casubq'],
            [40, 30, 'EUn casubq']
        ]
    },
    'patch-monotherapy': {
        'label': 'Patch monotherapies (once/twice weekly)',
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [400, 3.5, 'patch tw', true, true],
            [300, 7, 'patch ow', true, true]
        ],
        'customdosesCurveVisible': true,
        'customdosesUncertaintyVisible': true,
        'multi': []
    },
    'ev34-to-een47-monotherapy': {
        'label': 'EV (4 days) to EEn (7 days)',
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [],
        'customdosesCurveVisible': true,
        'customdosesUncertaintyVisible': true,
        'multi': [
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [4, 4, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
        ]
    },
    '_section2': {
        'disabled': true,
        'label': 'missed doses',
    },
    'missed-een-dose-7': {
        'label': 'Missed EEn dose',
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [4, 7, 'EEn im', true, false]
        ],
        'customdosesCurveVisible': true,
        'customdosesUncertaintyVisible': true,
        'multi': [
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 14, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
        ]
    },
    'missed-ev-dose-4': {
        'label': 'Missed EV dose',
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [3, 4, 'EV im', true, false]
        ],
        'customdosesCurveVisible': true,
        'customdosesUncertaintyVisible': true,
        'multi': [
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 8, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
        ]
    },
    'correct-missed-een-dose-7': {
        'label': 'Correct missed EEn dose',
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [4, 7, 'EEn im', true, false]
        ],
        'customdosesCurveVisible': true,
        'customdosesUncertaintyVisible': true,
        'multi': [
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [6, 14, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
        ]
    },
    'correct-missed-ev-dose-4': {
        'label': 'Correct missed EV dose',
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [3, 4, 'EV im', true, false]
        ],
        'customdosesCurveVisible': true,
        'customdosesUncertaintyVisible': true,
        'multi': [
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [4, 8, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
        ]
        },
    'preemptcorrect-missed-een-dose-7': {
        'label': 'Preempt/correct missed EEn dose',
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [4, 7, 'EEn im', true, false]
        ],
        'customdosesCurveVisible': true,
        'customdosesUncertaintyVisible': true,
        'multi': [
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [9, 7, 'EEn im'],
            [5, 14, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
        ]
    },
    'preemptcorrect-missed-ev-dose-4': {
        'label': 'Preempt/correct missed EV dose',
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [3, 4, 'EV im', true, false]
        ],
        'customdosesCurveVisible': true,
        'customdosesUncertaintyVisible': true,
        'multi': [
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [6, 4, 'EV im'],
            [4, 8, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
        ]
    },
    '_section3': {
        'disabled': true,
        'label': 'monotherapies with loading dose',
    },
    'een-monotherapy-loadingdose': {
        'label': 'EEn mono with 8mg loading dose',
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [4, 7, 'EEn im', true, false]
        ],
        'customdosesCurveVisible': true,
        'customdosesUncertaintyVisible': true,
        'multi': [
            [8, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
        ]
    },
    'ev-monotherapy-loadingdose': {
        'label': 'EV mono with 6mg loading dose',
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [3, 4, 'EV im', true, false]
        ],
        'customdosesCurveVisible': true,
        'customdosesUncertaintyVisible': true,
        'multi': [
            [6, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
        ]
    },
    'ec-monotherapy-loadingdose': {
        'label': 'EC mono with 8mg loading dose',
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [5, 7, 'EC im', true, false]
        ],
        'customdosesCurveVisible': true,
        'customdosesUncertaintyVisible': true,
        'multi': [
            [8, 7, 'EC im'],
            [5, 7, 'EC im'],
            [5, 7, 'EC im'],
            [5, 7, 'EC im'],
            [5, 7, 'EC im'],
            [5, 7, 'EC im'],
        ]
    },
    'eun-monotherapy-loadingdose': {
        'label': 'EUn mono with 100mg loading dose',
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [40, 30, 'EUn casubq', true, false]
        ],
        'customdosesCurveVisible': true,
        'customdosesUncertaintyVisible': true,
        'multi': [
            [100, 30, 'EUn casubq'],
            [40, 30, 'EUn casubq'],
            [40, 30, 'EUn casubq'],
            [40, 30, 'EUn casubq'],
            [40, 30, 'EUn casubq'],
            [40, 30, 'EUn casubq'],
            [40, 30, 'EUn casubq'],
            [40, 30, 'EUn casubq'],
            [40, 30, 'EUn casubq'],
            [40, 30, 'EUn casubq']
        ]
    },
    'ev-to-een-loadingdose': {
        'label': 'EV to EEn with 7 mg loading dose',
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [],
        'customdosesCurveVisible': true,
        'customdosesUncertaintyVisible': true,
        'multi': [
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [3, 4, 'EV im'],
            [7, 4, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
            [4, 7, 'EEn im'],
        ]
    },
    '_section4': {
        'disabled': true,
        'label': 'inappropriate WPATH regimens (see text)',
    },
    'wpath-toolittle-toospaced': {
        'label': 'EV/EC 5mg/14days (too variable)',
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [5, 14, 'EV im', true, true],
            [5, 14, 'EC im', true, true]
        ],
        'multi': []
    },
    'wpath-toomuch-toospaced': {
        'label': 'EV/EC 30mg/14days (extreme)',
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [30, 14, 'EV im', true, true],
            [30, 14, 'EC im', true, true]
        ],
        'multi': []
    },
    'wpath-toolittle': {
        'label': 'EV/EC 2mg/7days (low & needs AA)',
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [2, 7, 'EV im', true, true],
            [2, 7, 'EC im', true, true]
        ],
        'multi': []
    },
    'wpath-toomuch': {
        'label': 'EV/EC 10mg/7days (too much)',
        'menstrualCycle': false,
        'intervalDays': true,
        'steady': [
            [10, 7, 'EV im', true, true],
            [10, 7, 'EC im', true, true]
        ],
        'multi': []
    },
    '_section5': {
        'disabled': true,
        'label': 'inappropriate regimens',
    },
    'mimic-menstrual-cycle': {
        'label': 'Mimic menstrual cycle',
        'menstrualCycle': true,
        'intervalDays': false,
        'steady': [],
        'customdosesCurveVisible': true,
        'customdosesUncertaintyVisible': true,
        'multi': [
            [1, 13.5, 'EB im'],
            [4, 16, 'EEn im'],
            [1, 41.5, 'EB im'],
            [4, 44, 'EEn im'],
            [1, 69.5, 'EB im'],
            [4, 72, 'EEn im'],
        ]
    },
    '_peak-performance': {
        'hidden': true,
        'label': 'Peak performance',
        'menstrualCycle': true,
        'intervalDays': true,
        'steady': [],
        'customdosesCurveVisible': true,
        'customdosesUncertaintyVisible': true,
        'multi': [
            [0.145, 0.0, 'EB im'],
            [0.022, 0.667, 'EB im'],
            [0.021, 0.333, 'EB im'],
            [0.019, 0.333, 'EB im'],
            [0.018, 0.333, 'EB im'],
            [0.016, 0.333, 'EB im'],
            [0.019, 0.333, 'EB im'],
            [0.018, 0.333, 'EB im'],
            [0.017, 0.333, 'EB im'],
            [0.023, 0.333, 'EB im'],
            [0.017, 0.333, 'EB im'],
            [0.026, 0.333, 'EB im'],
            [0.023, 0.333, 'EB im'],
            [0.026, 0.333, 'EB im'],
            [0.025, 0.333, 'EB im'],
            [0.026, 0.333, 'EB im'],
            [0.022, 0.333, 'EB im'],
            [0.025, 0.333, 'EB im'],
            [0.025, 0.333, 'EB im'],
            [0.028, 0.333, 'EB im'],
            [0.032, 0.333, 'EB im'],
            [0.037, 0.333, 'EB im'],
            [0.036, 0.333, 'EB im'],
            [0.034, 0.333, 'EB im'],
            [0.037, 0.333, 'EB im'],
            [0.035, 0.333, 'EB im'],
            [0.039, 0.333, 'EB im'],
            [0.047, 0.333, 'EB im'],
            [0.053, 0.333, 'EB im'],
            [0.062, 0.333, 'EB im'],
            [0.069, 0.333, 'EB im'],
            [0.082, 0.333, 'EB im'],
            [0.082, 0.333, 'EB im'],
            [0.101, 0.333, 'EB im'],
            [0.092, 0.333, 'EB im'],
            [0.108, 0.333, 'EB im'],
            [0.101, 0.333, 'EB im'],
            [0.165, 0.333, 'EB im'],
            [0.18, 0.333, 'EB im'],
            [0.215, 0.333, 'EB im'],
            [0.176, 0.333, 'EB im'],
            [0.123, 0.333, 'EB im'],
            [0.034, 0.333, 'EB im'],
            [0.014, 2.0, 'EB im'],
            [0.053, 0.333, 'EB im'],
            [0.046, 0.333, 'EB im'],
            [0.063, 0.333, 'EB im'],
            [0.061, 0.333, 'EB im'],
            [0.074, 0.333, 'EB im'],
            [0.071, 0.333, 'EB im'],
            [0.079, 0.333, 'EB im'],
            [0.075, 0.333, 'EB im'],
            [0.077, 0.333, 'EB im'],
            [0.07, 0.333, 'EB im'],
            [0.079, 0.333, 'EB im'],
            [0.073, 0.333, 'EB im'],
            [0.083, 0.333, 'EB im'],
            [0.095, 0.333, 'EB im'],
            [0.1, 0.333, 'EB im'],
            [0.089, 0.333, 'EB im'],
            [0.074, 0.333, 'EB im'],
            [0.053, 0.333, 'EB im'],
            [0.064, 0.333, 'EB im'],
            [0.064, 0.333, 'EB im'],
            [0.08, 0.333, 'EB im'],
            [0.082, 0.333, 'EB im'],
            [0.087, 0.333, 'EB im'],
            [0.078, 0.333, 'EB im'],
            [0.061, 0.333, 'EB im'],
            [0.034, 0.333, 'EB im'],
            [0.016, 0.333, 'EB im'],
            [0.023, 0.333, 'EB im'],
            [0.034, 0.333, 'EB im'],
            [0.053, 0.333, 'EB im'],
            [0.045, 0.333, 'EB im'],
            [0.016, 0.333, 'EB im'],
        ]
    }
};
